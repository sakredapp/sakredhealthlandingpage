/**
 * /discover — the network as an application.
 *
 * Also serves `/discover/:modality` and `/discover/:modality/:city`, which are
 * the indexable category routes. They are the same experience with a filter
 * pre-applied and an editorial header on top, rather than a separate, thinner
 * page: one code path means the SEO landing and the tool can't diverge.
 *
 * ── Layout ───────────────────────────────────────────────────────────
 *
 *   desktop   filters across the top; result list left, map right, both
 *             pinned to the viewport so neither scrolls the other away
 *   mobile    map first, results in a bottom sheet the thumb can drag up
 *
 * ── Querying ─────────────────────────────────────────────────────────
 *
 * The map never queries as it moves. Panning updates a pending viewport and
 * surfaces "Search this area"; the user decides when to commit. Querying every
 * camera frame would mean dozens of requests per drag and a list reshuffling
 * under the cursor (brief §5).
 */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, useSearch } from "wouter";
import { ChevronUp, Search, X } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SakredMap } from "@/components/map/SakredMap";
import { ProviderCard } from "@/components/health/ProviderCard";
import {
  DiscoverFilters,
  EMPTY_FILTERS,
  countActiveFilters,
  type FilterState,
} from "@/components/health/DiscoverFilters";
import {
  NetworkBuilding,
  NetworkSkeleton,
  NetworkUnavailable,
} from "@/components/health/NetworkStates";
import {
  useDebounced,
  useModalities,
  useNetworkSearch,
  usePendingViewport,
} from "@/lib/network";
import { SEED_MODALITIES, getSeedModality } from "@/data/modalities";
import { useSeo, SITE_URL } from "@/lib/seo";
import { track, termLength } from "@/lib/analytics";
import type { Modality, VerificationState } from "@shared/health-network";

/**
 * Names the control that moved, for analytics.
 *
 * A category, never the value: "modality" rather than which modality, because
 * the interesting question is which filters people reach for, and the specific
 * modality is already carried by the URL if we need it.
 */
function describeFilterChange(before: FilterState, after: FilterState): string {
  if (before.modalities.length !== after.modalities.length) return "modality";
  if (before.openNow !== after.openNow) return "open_now";
  if (before.sameDay !== after.sameDay) return "same_day";
  if (before.walkIns !== after.walkIns) return "walk_ins";
  if (before.minVerification !== after.minVerification) return "verification";
  return "cleared";
}

/** "austin" → "Austin"; "new-york" → "New York". */
function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function Discover() {
  const params = useParams<{ modality?: string; city?: string }>();
  const searchString = useSearch();
  const [, navigate] = useLocation();

  const routeModality = params.modality ?? null;
  const routeCity = params.city ?? null;

  /* ---- query state, seeded from the URL ------------------------- */
  const initial = useMemo(() => new URLSearchParams(searchString), [searchString]);

  const [term, setTerm] = useState(() => initial.get("q") ?? "");
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...EMPTY_FILTERS,
    modalities: [
      ...(routeModality ? [routeModality] : []),
      ...(initial.get("modality") ? [initial.get("modality")!] : []),
    ].filter((slug, index, all) => all.indexOf(slug) === index),
    openNow: initial.get("openNow") === "true",
  }));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const debouncedTerm = useDebounced(term, 320);

  /* Fires on the settled term, not per keystroke — and carries the term's
     length, never the term. A health search is somebody's symptoms. */
  useEffect(() => {
    if (!debouncedTerm.trim()) return;
    track("discover_search", {
      surface: "discover",
      term_length: termLength(debouncedTerm),
    });
  }, [debouncedTerm]);
  const { bounds, hasMoved, onViewportChange, commit } = usePendingViewport();

  /* ---- modality vocabulary --------------------------------------- */
  const { data: liveModalities, available: modalitiesAvailable } = useModalities();

  /**
   * Falls back to the seed vocabulary so the filter bar is usable before the
   * network publishes. These are queries, not listings — a chip that returns
   * nothing tells the truth when you press it.
   */
  const modalities: Modality[] = useMemo(() => {
    if (modalitiesAvailable && liveModalities.length) return liveModalities;
    return SEED_MODALITIES.map((m) => ({
      id: m.slug,
      slug: m.slug,
      name: m.name,
      shortName: m.shortName ?? null,
      description: m.description,
      category: null,
    }));
  }, [liveModalities, modalitiesAvailable]);

  /* ---- the search ------------------------------------------------ */
  const { data, isLoading, available, isEmpty } = useNetworkSearch({
    q: debouncedTerm || undefined,
    modalities: filters.modalities.length ? filters.modalities : undefined,
    city: routeCity ? titleCase(routeCity) : undefined,
    bounds: bounds ?? undefined,
    openNow: filters.openNow,
    sameDay: filters.sameDay,
    walkIns: filters.walkIns,
    minVerification: filters.minVerification,
    limit: 40,
  });

  const locations = data.locations;

  /* ---- keep the URL honest --------------------------------------- *
   * The address bar always describes what is on screen, so any view can be
   * shared, bookmarked, or reopened. Category routes keep their own path and
   * only carry the extra state as query params. */
  useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedTerm) next.set("q", debouncedTerm);
    filters.modalities
      .filter((slug) => slug !== routeModality)
      .forEach((slug) => next.append("modality", slug));
    if (filters.openNow) next.set("openNow", "true");
    if (filters.sameDay) next.set("sameDay", "true");
    if (filters.walkIns) next.set("walkIns", "true");
    if (filters.minVerification) next.set("verification", filters.minVerification);

    const base = routeModality
      ? routeCity
        ? `/discover/${routeModality}/${routeCity}`
        : `/discover/${routeModality}`
      : "/discover";
    const qs = next.toString();
    const target = qs ? `${base}?${qs}` : base;

    if (`${window.location.pathname}${window.location.search}` !== target) {
      // `replace` so filtering doesn't stack twenty history entries between
      // the visitor and the page they arrived from.
      navigate(target, { replace: true });
    }
  }, [debouncedTerm, filters, routeModality, routeCity, navigate]);

  /* ---- SEO ------------------------------------------------------- */
  const seedModality = routeModality ? getSeedModality(routeModality) : undefined;
  const liveModality = routeModality
    ? modalities.find((m) => m.slug === routeModality)
    : undefined;
  const modalityName = liveModality?.name ?? seedModality?.name ?? (routeModality ? titleCase(routeModality) : null);
  const cityName = routeCity ? titleCase(routeCity) : null;

  const canonicalPath = routeModality
    ? routeCity
      ? `/discover/${routeModality}/${routeCity}`
      : `/discover/${routeModality}`
    : "/discover";

  const title = modalityName
    ? cityName
      ? `${modalityName} in ${cityName} — Sakred Health Network`
      : `${modalityName} Practitioners — Sakred Health Network`
    : "Find Trusted Practitioners Near You — Sakred Health";

  const description = modalityName
    ? `Find ${modalityName.toLowerCase()} practitioners${cityName ? ` in ${cityName}` : ""} on the Sakred Health Network — each practice reviewed before it's published.`
    : "Search the Sakred Health Network for trusted practitioners, practices and health resources near you.";

  useSeo({
    title,
    description,
    canonical: canonicalPath,
    /**
     * A category page with nothing published under it is a thin page. We do not
     * ask Google to index one (brief §8) — it stays reachable and useful for a
     * visitor, it just doesn't enter the index until it has something to say.
     */
    noindex: Boolean(routeModality) && available && locations.length === 0,
  });

  /* ---- render ---------------------------------------------------- */
  const activeFilters = countActiveFilters(filters);

  const resultsBody = (() => {
    if (isLoading) return <NetworkSkeleton rows={5} />;
    if (!available) return <NetworkUnavailable compact />;
    if (isEmpty || locations.length === 0) {
      return (
        <NetworkBuilding
          place={cityName ?? undefined}
          compact
          broaderHref={
            routeCity
              ? `/discover/${routeModality}`
              : activeFilters > 0
                ? canonicalPath
                : undefined
          }
          broaderLabel={routeCity ? `All ${modalityName?.toLowerCase()} practices` : "Clear filters"}
        />
      );
    }
    return (
      <ul className="space-y-3">
        {locations.map((location) => (
          <li key={location.id}>
            <ProviderCard
              location={location}
              variant="row"
              selected={selectedId === location.id}
              onSelect={(id) => {
                setSelectedId(id);
                setSheetOpen(false);
              }}
            />
          </li>
        ))}
      </ul>
    );
  })();

  return (
    <SiteLayout solidHeader progress={false}>
      {/* ---- editorial header, category routes only ---- */}
      {modalityName && (
        <header className="surface-atlas border-b border-sakred-stone px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <nav aria-label="Breadcrumb" className="mb-3 text-xs text-sakred-ink/50">
              <a href="/discover" className="hover:text-sakred-espresso">
                Discover
              </a>
              <span className="mx-1.5">/</span>
              {cityName ? (
                <>
                  <a href={`/discover/${routeModality}`} className="hover:text-sakred-espresso">
                    {modalityName}
                  </a>
                  <span className="mx-1.5">/</span>
                  <span className="text-sakred-ink/70">{cityName}</span>
                </>
              ) : (
                <span className="text-sakred-ink/70">{modalityName}</span>
              )}
            </nav>
            <h1 className="font-display text-3xl tracking-tight text-sakred-espresso sm:text-4xl">
              {modalityName}
              {cityName ? ` in ${cityName}` : ""}
            </h1>
            {(liveModality?.description || seedModality?.description) && (
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-sakred-ink/65">
                {liveModality?.description || seedModality?.description}
              </p>
            )}
          </div>
        </header>
      )}

      {/* The bare /discover route is a full-bleed tool with no room for a
          display headline — but a page with no <h1> is a page search engines
          and screen readers can't summarise. Category routes render a visible
          one above, so this only fires for the tool view. */}
      {!modalityName && (
        <h1 className="sr-only">
          Find trusted practitioners and practices near you — the Sakred Health Network
        </h1>
      )}

      {/* ---- search ---- */}
      <div className="border-b border-sakred-stone bg-sakred-surface px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 rounded-full border border-sakred-stone bg-sakred-canvas px-4 focus-within:border-sakred-gold/70">
          <Search className="h-4 w-4 shrink-0 text-sakred-ink/40" aria-hidden="true" />
          <label htmlFor="discover-search" className="sr-only">
            Search practitioner, modality or city
          </label>
          <input
            id="discover-search"
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search practitioner, modality or city"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-sakred-espresso outline-none placeholder:text-sakred-ink/40"
          />
          {term && (
            <button
              type="button"
              onClick={() => setTerm("")}
              aria-label="Clear search"
              className="shrink-0 text-sakred-ink/40 hover:text-sakred-espresso"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <DiscoverFilters
        filters={filters}
        onChange={(next) => {
          track("discover_filter", {
            surface: "discover",
            filter: describeFilterChange(filters, next),
            modality_count: next.modalities.length,
          });
          setFilters(next);
        }}
        modalities={modalities}
        resultCount={available && !isLoading ? locations.length : null}
      />

      {/* ---- the workspace ---- *
       * Height is viewport minus the header, search and filter bars, so the
       * map and the list each scroll inside themselves and the page as a whole
       * does not scroll at all on desktop. */}
      <div className="relative lg:flex lg:h-[calc(100vh-13.5rem)]">
        {/* results — desktop column */}
        <div className="hidden w-[26rem] shrink-0 overflow-y-auto border-r border-sakred-stone bg-sakred-canvas p-4 lg:block xl:w-[30rem]">
          {resultsBody}
        </div>

        {/* map */}
        <div className="relative h-[60vh] flex-1 lg:h-auto">
          <SakredMap
            locations={locations}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onViewportChange={onViewportChange}
            fitToLocations={locations.length > 0}
            className="h-full w-full"
            ariaLabel={`Map of ${locations.length} practices in the Sakred Health Network`}
          />

          {/* "Search this area" — appears only once the viewport has genuinely
              drifted away from the results on screen. */}
          {hasMoved && (
            <button
              type="button"
              onClick={commit}
              className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full border border-sakred-gold bg-sakred-surface px-5 py-2 text-sm font-medium text-sakred-espresso shadow-[0_12px_30px_-16px_rgba(28,26,23,0.6)] transition-transform duration-micro hover:-translate-y-0.5 hover:-translate-x-1/2"
            >
              Search this area
            </button>
          )}
        </div>

        {/* results — mobile sheet */}
        <div
          className={`fixed inset-x-0 bottom-0 z-30 max-h-[78vh] overflow-y-auto rounded-t-3xl border-t border-sakred-stone bg-sakred-canvas shadow-[0_-20px_50px_-30px_rgba(28,26,23,0.6)] transition-transform duration-card ease-settle lg:hidden ${
            sheetOpen ? "translate-y-0" : "translate-y-[calc(100%-4.25rem)]"
          }`}
        >
          <button
            type="button"
            onClick={() => setSheetOpen((open) => !open)}
            aria-expanded={sheetOpen}
            className="flex w-full items-center justify-between px-5 py-4"
          >
            <span className="text-sm font-medium text-sakred-espresso">
              {isLoading
                ? "Searching…"
                : available
                  ? `${locations.length} ${locations.length === 1 ? "practice" : "practices"}`
                  : "Directory unavailable"}
            </span>
            <ChevronUp
              className={`h-4 w-4 text-sakred-ink/50 transition-transform duration-card ${
                sheetOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>
          <div className="px-4 pb-8">{resultsBody}</div>
        </div>
      </div>

      {/* ---- modality index, for crawlers and for browsing ---- */}
      <section id="modalities" className="border-t border-sakred-stone bg-sakred-surface-alt px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-2xl text-sakred-espresso">Browse by modality</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {modalities.map((modality) => (
              <li key={modality.slug}>
                <a
                  href={`/discover/${modality.slug}`}
                  className="inline-block rounded-full border border-sakred-stone bg-sakred-surface px-4 py-2 text-sm text-sakred-ink/75 transition-colors duration-micro hover:border-sakred-gold/50 hover:text-sakred-espresso"
                >
                  {modality.name}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-sakred-ink/55">
            Know a practitioner who belongs in the network?{" "}
            <a
              href="/recommend"
              className="font-medium text-sakred-gold-deep underline decoration-sakred-gold/40 underline-offset-4"
            >
              Recommend them
            </a>
            .
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}

/** Re-exported so the router can reference the verification type it filters on. */
export type { VerificationState };
