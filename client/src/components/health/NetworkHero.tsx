/**
 * The homepage hero. The map owns it.
 *
 * Composition is 38/62 on desktop — copy and search on the left, a large live
 * map on the right that bleeds off the right edge of the viewport so it reads
 * as a window onto something larger rather than a widget in a box.
 *
 * ── The opening sequence (brief §2) ──────────────────────────────────
 *
 *   0.0s  the atlas is already painted (it's SVG, it costs nothing)
 *   ~0.1  headline presses in word by word
 *   ~0.5  MapLibre fades over the atlas as its first tiles land
 *   ~0.8  gold pins drop in sequence
 *   ~1.4  one practice card rises from the selected pin
 *
 * Then it stops. Nothing loops, nothing pulses forever. The sequence runs
 * once, ends, and leaves a still image that happens to be interactive.
 *
 * ── What the pins are ────────────────────────────────────────────────
 *
 * Real published locations, from the same canonical tables the app reads. When
 * the network has nothing published, the hero shows the drawn atlas with no
 * pins and the copy underneath does the work — it never invents a pin to make
 * the composition look busier.
 */
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { DUR, EASE, StampHeading, fadeUp } from "@/components/motion";
import { SakredMap } from "@/components/map/SakredMap";
import { ProviderCard } from "./ProviderCard";
import { useNetworkSearch } from "@/lib/network";
import { QUICK_FILTERS } from "@/data/modalities";
import { track, termLength } from "@/lib/analytics";

export function NetworkHero() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");

  /**
   * A small national sample — enough pins to show the shape of the network
   * without turning the hero into a data-fetching page. /discover is where
   * the real querying happens.
   */
  const { data, available } = useNetworkSearch({ limit: 24 });
  const locations = data.locations;

  /** The one practice whose card rises out of the map. */
  const featured = locations[0] ?? null;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeId = selectedId ?? featured?.id ?? null;
  const active = useMemo(
    () => locations.find((l) => l.id === activeId) ?? null,
    [locations, activeId]
  );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    // Length only. What someone types into a health search is their situation
    // in their own words and never leaves the browser.
    track("homepage_map_search", {
      surface: "homepage",
      term_length: termLength(trimmed),
      has_results: locations.length > 0,
    });
    navigate(trimmed ? `/discover?q=${encodeURIComponent(trimmed)}` : "/discover");
  };

  return (
    <section className="relative overflow-hidden bg-sakred-canvas pt-24 lg:pt-16">
      <div className="mx-auto grid max-w-[110rem] items-center gap-10 px-4 pb-14 sm:px-6 lg:grid-cols-[38fr_62fr] lg:gap-8 lg:pb-0 lg:pl-8 lg:pr-0 xl:pl-16">
        {/* ---------------- copy ---------------- */}
        <div className="lg:py-24">
          <motion.p
            {...fadeUp(0)}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-sakred-gold/30 bg-sakred-surface/80 px-4 py-1.5 text-xs font-medium text-sakred-ink/70 backdrop-blur-sm"
          >
            The Sakred Health Network
          </motion.p>

          <StampHeading
            as="h1"
            text="Find trusted care"
            accent="around you."
            delay={0.1}
            className="font-display text-4xl leading-[1.05] tracking-tight text-sakred-espresso sm:text-5xl xl:text-6xl"
          />

          <motion.p
            {...fadeUp(0.34)}
            className="mt-5 max-w-lg text-base leading-relaxed text-sakred-ink/70 sm:text-lg"
          >
            Discover practitioners, practices and health resources selected for a more
            intentional approach to health.
          </motion.p>

          {/* ---------------- search ---------------- */}
          <motion.form
            {...fadeUp(0.46)}
            onSubmit={submit}
            role="search"
            className="mt-7 flex items-center gap-2 rounded-full border border-sakred-stone bg-sakred-surface p-1.5 pl-4 shadow-[0_16px_40px_-30px_rgba(28,26,23,0.5)] focus-within:border-sakred-gold/70"
          >
            <Search className="h-4 w-4 shrink-0 text-sakred-ink/40" aria-hidden="true" />
            <label htmlFor="hero-search" className="sr-only">
              Search practitioner, modality or city
            </label>
            <input
              id="hero-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search practitioner, modality or city"
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-sakred-espresso outline-none placeholder:text-sakred-ink/40"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full border border-sakred-gold bg-gradient-to-r from-sakred-gold via-sakred-gold-light to-sakred-gold px-5 py-2 text-sm font-medium text-sakred-espresso transition-transform duration-micro hover:-translate-y-0.5"
            >
              Explore
            </button>
          </motion.form>

          {/* ---------------- quick filters ---------------- *
              These are queries, not claims. Each one opens /discover with the
              filter applied; if nothing is published under it, /discover says
              so rather than the chip implying coverage. */}
          <motion.ul {...fadeUp(0.56)} className="mt-4 flex flex-wrap gap-2">
            {QUICK_FILTERS.map((filter) => (
              <li key={filter.value}>
                <a
                  href={`/discover?${filter.param}=${filter.value}`}
                  className="inline-block rounded-full border border-sakred-stone bg-sakred-surface/70 px-3 py-1.5 text-xs text-sakred-ink/70 transition-colors duration-micro hover:border-sakred-gold/50 hover:text-sakred-espresso"
                >
                  {filter.label}
                </a>
              </li>
            ))}
          </motion.ul>

          {/* ---------------- CTAs ---------------- */}
          <motion.div {...fadeUp(0.64)} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href="/discover"
              className="inline-flex items-center gap-2 text-sm font-medium text-sakred-espresso"
            >
              <span className="border-b border-sakred-gold pb-0.5">Explore the map</span>
              <ArrowRight className="h-4 w-4 text-sakred-gold" aria-hidden="true" />
            </a>
            <a
              href="/recommend"
              className="text-sm font-medium text-sakred-ink/65 transition-colors duration-micro hover:text-sakred-espresso"
            >
              Recommend a practitioner
            </a>
            <a
              href="/for-practitioners"
              className="text-sm text-sakred-ink/45 transition-colors duration-micro hover:text-sakred-espresso"
            >
              Are you a practitioner?
            </a>
          </motion.div>

          {/* The line that tells existing insurance traffic they're still in
              the right place — small, but load-bearing (brief §34). */}
          <motion.p {...fadeUp(0.72)} className="mt-7 text-sm text-sakred-ink/50">
            Looking for insurance coverage?{" "}
            <a
              href="/products"
              className="font-medium text-sakred-gold-deep underline decoration-sakred-gold/40 underline-offset-4 hover:text-sakred-espresso"
            >
              We still handle that →
            </a>
          </motion.p>
        </div>

        {/* ---------------- map ---------------- */}
        <div className="relative -mx-4 h-[26rem] sm:-mx-6 sm:h-[32rem] lg:mx-0 lg:h-[46rem]">
          <div className="absolute inset-0 overflow-hidden lg:rounded-l-[2rem]">
            <SakredMap
              locations={locations}
              selectedId={activeId}
              onSelect={setSelectedId}
              /* Scenery, not a tool: no controls, no labels, and — critically —
                 no scroll capture, so a visitor scrolling the page past a
                 full-height map isn't trapped zooming it. */
              interactive={false}
              showControls={false}
              labels={false}
              fitToLocations={locations.length > 0}
              className="h-full w-full"
              ariaLabel="Map of the Sakred Health Network"
            />
          </div>

          {/* Ivory feather along the left edge so the headline column never
              sits on hard map detail. */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-40 bg-gradient-to-r from-sakred-canvas to-transparent lg:block"
            aria-hidden="true"
          />

          {/* The card that rises from the selected pin. It is a real published
              practice or it is absent — there is no demo card. */}
          {active && (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 26, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: DUR.reveal, ease: EASE, delay: available ? 1.35 : 0 }}
              className="absolute bottom-5 left-4 w-[min(21rem,calc(100%-2rem))] sm:left-8 lg:bottom-10 lg:left-12"
            >
              <ProviderCard location={active} variant="row" selected />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
