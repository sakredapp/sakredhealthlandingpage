/**
 * /locations/:slug — a published practice.
 *
 * This is the page that has to earn organic search, so it is built to stand on
 * its own: real content, real structured data, a map, and onward links. It is
 * also the page most exposed to overclaiming, so several sections render only
 * when the underlying data actually exists:
 *
 *   · "Why Sakred recommends them" appears only when an editor wrote a note.
 *     It is never generated from the modalities, the verification state, or
 *     anything else. A synthesised reason for recommending a real clinic is a
 *     fabrication with a real business's name on it.
 *   · Hours render only when published. No hours is not "closed".
 *   · The community count renders only when there is one.
 */
import { useEffect } from "react";
import { useParams, useLocation as useRoute } from "wouter";
import {
  Clock,
  ExternalLink,
  MapPin,
  MessagesSquare,
  Navigation as NavigationIcon,
  Phone,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SakredMap } from "@/components/map/SakredMap";
import { NetworkImage } from "@/components/health/EditorialImage";
import { ProviderCard } from "@/components/health/ProviderCard";
import { VerificationBadge } from "@/components/health/VerificationBadge";
import {
  NetworkSkeleton,
  NetworkUnavailable,
} from "@/components/health/NetworkStates";
import { Reveal, StaggerChildren, StaggerItem } from "@/components/motion";
import { useLocation as useNetworkLocation } from "@/lib/network";
import { useSeo, SITE_URL } from "@/lib/seo";
import { track } from "@/lib/analytics";
import {
  VERIFICATION_COPY,
  WEEKDAY_NAMES,
  locationPlace,
  practitionerPath,
  locationPath,
  resolveOpenState,
  type HealthLocation,
  type OpeningPeriod,
} from "@shared/health-network";
import NotFound from "./not-found";

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

const fmt = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h < 12 ? "am" : "pm";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour}:${String(m).padStart(2, "0")}${suffix}` : `${hour}${suffix}`;
};

function Hours({ hours, timezone }: { hours: OpeningPeriod[]; timezone?: string | null }) {
  const today = resolveOpenState(hours, timezone);
  const byDay = new Map<number, OpeningPeriod[]>();
  hours.forEach((period) => {
    byDay.set(period.day, [...(byDay.get(period.day) ?? []), period]);
  });

  return (
    <div>
      <h2 className="font-display text-2xl text-sakred-espresso">Hours</h2>
      {today.label && (
        <p
          className={`mt-2 text-sm font-medium ${
            today.open ? "text-sakred-gold-deep" : "text-sakred-ink/55"
          }`}
        >
          {today.label}
        </p>
      )}
      <dl className="mt-4 max-w-sm divide-y divide-sakred-stone/60 border-y border-sakred-stone/60">
        {[1, 2, 3, 4, 5, 6, 0].map((day) => {
          const periods = byDay.get(day);
          return (
            <div key={day} className="flex justify-between py-2.5 text-sm">
              <dt className="text-sakred-ink/70">{WEEKDAY_NAMES[day]}</dt>
              <dd className="text-sakred-espresso">
                {periods?.length
                  ? periods.map((p) => `${fmt(p.opens)}–${fmt(p.closes)}`).join(", ")
                  : "Closed"}
              </dd>
            </div>
          );
        })}
      </dl>
      {timezone && (
        <p className="mt-2 text-xs text-sakred-ink/45">
          Times shown in the practice&rsquo;s local timezone.
        </p>
      )}
    </div>
  );
}

function Action({
  href,
  icon: Icon,
  children,
  external,
  primary,
  onClick,
}: {
  href: string;
  icon: typeof Phone;
  children: React.ReactNode;
  external?: boolean;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-transform duration-micro hover:-translate-y-0.5 ${
        primary
          ? "border border-sakred-gold bg-gradient-to-r from-sakred-gold via-sakred-gold-light to-sakred-gold text-sakred-espresso"
          : "border border-sakred-stone bg-sakred-surface text-sakred-espresso"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {children}
    </a>
  );
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

export default function LocationPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useRoute();
  const { data, isLoading, isError } = useNetworkLocation(slug);

  const location = data?.location;
  const nearby = data?.nearby ?? [];

  /**
   * A retired slug is served, then corrected.
   *
   * The network keeps slug history, so a practice that has been renamed still
   * resolves under its old URL — `redirect` says the requested slug was an
   * alias. Rather than 404 (which loses whoever followed the link) or serve the
   * same practice at two addresses (which splits its search ranking), the page
   * renders and replaces the URL with the canonical one.
   *
   * `replace`, not push: the retired URL should not sit in the back button.
   */
  useEffect(() => {
    if (location?.redirect && location.canonicalSlug && location.canonicalSlug !== slug) {
      navigate(locationPath(location.canonicalSlug), { replace: true });
    }
  }, [location?.redirect, location?.canonicalSlug, slug, navigate]);

  /* One view event per practice, once it has actually loaded. Carries the
     trust state — the thing worth correlating against engagement — and no
     identifying detail about the practice or the visitor. */
  useEffect(() => {
    if (!location) return;
    track("provider_view", {
      surface: "location_page",
      verification: location.verification,
    });
  }, [location?.id, location?.verification]);

  const place = location ? locationPlace(location.city, location.region) : "";
  const address = location
    ? [location.addressLine1, location.addressLine2, place, location.postalCode]
        .filter(Boolean)
        .join(", ")
    : "";

  useSeo({
    title: location
      ? `${location.name} — ${place} | Sakred Health Network`
      : "Practice | Sakred Health Network",
    description: location
      ? `${location.name} in ${place}${
          location.modalities.length
            ? ` — ${location.modalities.map((m) => m.name).join(", ")}`
            : ""
        }. Listed on the Sakred Health Network.`
      : "A practice on the Sakred Health Network.",
    canonical: slug ? `/locations/${slug}` : undefined,
    image: location?.photos[0]?.url,
    jsonLd: location ? buildJsonLd(location, slug!) : undefined,
  });

  if (isLoading) {
    return (
      <SiteLayout solidHeader>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <NetworkSkeleton rows={3} />
        </div>
      </SiteLayout>
    );
  }

  // A 5xx means we couldn't reach the directory. That is not the same as "this
  // practice does not exist", and must not render as a 404.
  if (isError) {
    return (
      <SiteLayout solidHeader>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <NetworkUnavailable />
        </div>
      </SiteLayout>
    );
  }

  if (!location) return <NotFound />;

  const open = resolveOpenState(location.hours, location.timezone);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    address || `${location.lat},${location.lng}`
  )}`;

  return (
    <SiteLayout solidHeader>
      {/* ---- hero ---- */}
      <header className="bg-sakred-surface-alt">
        <NetworkImage
          photo={location.photos[0] ?? null}
          subject={location.name}
          id={location.id}
          modalities={location.modalities}
          className="h-[42vh] min-h-[18rem] w-full"
          sizes="100vw"
          eager
        />

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-3 text-xs text-sakred-ink/50">
            <a href="/discover" className="hover:text-sakred-espresso">
              Discover
            </a>
            <span className="mx-1.5">/</span>
            <span className="text-sakred-ink/70">{location.name}</span>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl leading-tight tracking-tight text-sakred-espresso sm:text-4xl">
                {location.name}
              </h1>
              <p className="mt-1.5 flex items-center gap-1.5 text-base text-sakred-ink/65">
                <MapPin className="h-4 w-4 text-sakred-gold" aria-hidden="true" />
                {place}
              </p>
            </div>
            <VerificationBadge state={location.verification} size="md" />
          </div>

          {location.modalities.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {location.modalities.map((modality) => (
                <li key={modality.slug}>
                  <a
                    href={`/discover/${modality.slug}`}
                    className="inline-block rounded-full border border-sakred-stone bg-sakred-surface px-3 py-1 text-xs text-sakred-ink/70 transition-colors duration-micro hover:border-sakred-gold/50 hover:text-sakred-espresso"
                  >
                    {modality.name}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {open.label && (
            <p
              className={`mt-3 flex items-center gap-1.5 text-sm ${
                open.open ? "text-sakred-gold-deep" : "text-sakred-ink/55"
              }`}
            >
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {open.label}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Action
              href={directionsUrl}
              icon={NavigationIcon}
              external
              primary
              onClick={() => track("provider_directions", { surface: "location_page" })}
            >
              Directions
            </Action>
            {location.website && (
              <Action
                href={location.website}
                icon={ExternalLink}
                external
                onClick={() => track("provider_website", { surface: "location_page" })}
              >
                Website
              </Action>
            )}
            {location.phone && (
              <Action
                href={`tel:${location.phone.replace(/[^\d+]/g, "")}`}
                icon={Phone}
                onClick={() => track("provider_call", { surface: "location_page" })}
              >
                Call
              </Action>
            )}
            {location.bookingUrl && (
              <Action href={location.bookingUrl} icon={Clock} external>
                Book
              </Action>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div className="space-y-14">
            {/* Editorial only. No note, no section — see the file header. */}
            {location.sakredNote && (
              <Reveal>
                <section className="rounded-2xl border border-sakred-gold/30 bg-sakred-gold/[0.07] p-6 sm:p-8">
                  <h2 className="font-display text-2xl text-sakred-espresso">
                    Why Sakred recommends them
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-sakred-ink/75">
                    {location.sakredNote}
                  </p>
                </section>
              </Reveal>
            )}

            {location.about && (
              <Reveal>
                <section>
                  <h2 className="font-display text-2xl text-sakred-espresso">
                    About the practice
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-sakred-ink/70">
                    {location.about}
                  </p>
                </section>
              </Reveal>
            )}

            {location.practitioners.length > 0 && (
              <section>
                <h2 className="font-display text-2xl text-sakred-espresso">Practitioners</h2>
                <StaggerChildren as="ul" className="mt-5 grid gap-4 sm:grid-cols-2">
                  {location.practitioners.map((practitioner) => (
                    <StaggerItem as="li" key={practitioner.id} className="min-w-0">
                      <a
                        href={practitionerPath(practitioner.slug)}
                        className="flex h-full gap-4 rounded-2xl border border-sakred-stone bg-sakred-surface p-4 lift-card"
                      >
                        <NetworkImage
                          photo={practitioner.photo}
                          subject={practitioner.name}
                          id={practitioner.id}
                          modalities={practitioner.modalities}
                          className="h-20 w-16 shrink-0 rounded-xl"
                          sizes="64px"
                        />
                        <div className="min-w-0">
                          <h3 className="font-display text-base leading-snug text-sakred-espresso">
                            {practitioner.name}
                          </h3>
                          {practitioner.credentials && (
                            <p className="text-xs text-sakred-ink/50">
                              {practitioner.credentials}
                            </p>
                          )}
                          {practitioner.headline && (
                            <p className="mt-1.5 text-sm leading-snug text-sakred-ink/65">
                              {practitioner.headline}
                            </p>
                          )}
                          <VerificationBadge
                            state={practitioner.verification}
                            className="mt-2"
                          />
                        </div>
                      </a>
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              </section>
            )}

            {location.hours && location.hours.length > 0 && (
              <Reveal>
                <Hours hours={location.hours} timezone={location.timezone} />
              </Reveal>
            )}

            {/* The public trust state and what it means — never the private
                evidence behind it. */}
            <Reveal>
              <section className="rounded-2xl border border-sakred-stone bg-sakred-surface p-6">
                <h2 className="font-display text-2xl text-sakred-espresso">Verification</h2>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <VerificationBadge state={location.verification} size="md" />
                  {location.verifiedAt && (
                    <span className="text-xs text-sakred-ink/50">
                      Last checked{" "}
                      {new Date(location.verifiedAt).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-sakred-ink/65">
                  {VERIFICATION_COPY[location.verification].detail}
                </p>
                <p className="mt-3 text-xs text-sakred-ink/45">
                  Directory information, not a clinical endorsement. Sakred Health does
                  not provide medical advice, diagnosis or treatment.
                </p>
              </section>
            </Reveal>

            {location.discussionCount ? (
              <Reveal>
                <section className="flex items-center gap-3 rounded-2xl border border-sakred-stone bg-sakred-surface-alt p-5">
                  <MessagesSquare
                    className="h-5 w-5 shrink-0 text-sakred-gold-deep"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-sakred-ink/70">
                    <strong className="font-medium text-sakred-espresso">
                      {location.discussionCount}{" "}
                      {location.discussionCount === 1 ? "discussion" : "discussions"}
                    </strong>{" "}
                    about this practice in the Sakred community.{" "}
                    <a href="/app" className="font-medium text-sakred-gold-deep underline decoration-sakred-gold/40 underline-offset-4">
                      Read them in the app
                    </a>
                  </p>
                </section>
              </Reveal>
            ) : null}
          </div>

          {/* ---- sidebar ---- */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-sakred-stone">
              <SakredMap
                locations={[location]}
                selectedId={location.id}
                center={[location.lng, location.lat]}
                zoom={14}
                showControls={false}
                className="h-64 w-full"
                ariaLabel={`Map showing the location of ${location.name}`}
              />
              {address && (
                <p className="border-t border-sakred-stone bg-sakred-surface px-4 py-3 text-sm leading-relaxed text-sakred-ink/70">
                  {address}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-sakred-stone bg-sakred-surface p-5">
              <h2 className="font-display text-lg text-sakred-espresso">
                Save this place
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-sakred-ink/60">
                Keep it, follow protocols between visits, and continue in the Sakred
                Health app.
              </p>
              <a
                href="/app"
                className="mt-4 inline-flex rounded-full border border-sakred-gold bg-gradient-to-r from-sakred-gold via-sakred-gold-light to-sakred-gold px-5 py-2.5 text-sm font-medium text-sakred-espresso"
              >
                Get the app
              </a>
            </div>
          </aside>
        </div>

        {nearby.length > 0 && (
          <section className="mt-16 border-t border-sakred-stone pt-12">
            <h2 className="font-display text-2xl text-sakred-espresso">Nearby practices</h2>
            <StaggerChildren as="ul" className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {nearby.map((item) => (
                <StaggerItem as="li" key={item.id} className="min-w-0">
                  <ProviderCard location={item} />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </section>
        )}
      </div>
    </SiteLayout>
  );
}

/* ------------------------------------------------------------------ *
 * Structured data
 * ------------------------------------------------------------------ */

/**
 * `LocalBusiness` rather than `MedicalBusiness`.
 *
 * The network spans traditional, holistic and integrative practice, and much
 * of it is not a medical business under schema.org's meaning of the word.
 * Claiming otherwise in structured data is exactly the kind of overstatement
 * the verification ladder exists to avoid.
 *
 * Deliberately absent: `aggregateRating`. We publish no ratings, so we assert
 * none — a rating in markup that has no counterpart on the page is a
 * structured-data violation as well as a lie.
 */
function buildJsonLd(location: HealthLocation, slug: string) {
  const url = `${SITE_URL}/locations/${slug}`;

  const openingHours = (location.hours ?? []).map((period) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: `https://schema.org/${WEEKDAY_NAMES[period.day]}`,
    opens: period.opens,
    closes: period.closes,
  }));

  return [
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": url,
      name: location.name,
      url,
      ...(location.website ? { sameAs: [location.website] } : {}),
      ...(location.phone ? { telephone: location.phone } : {}),
      ...(location.about ? { description: location.about } : {}),
      ...(location.photos.length ? { image: location.photos.map((p) => p.url) } : {}),
      address: {
        "@type": "PostalAddress",
        ...(location.addressLine1 ? { streetAddress: location.addressLine1 } : {}),
        addressLocality: location.city,
        addressRegion: location.region,
        ...(location.postalCode ? { postalCode: location.postalCode } : {}),
        addressCountry: location.country ?? "US",
      },
      geo: { "@type": "GeoCoordinates", latitude: location.lat, longitude: location.lng },
      ...(openingHours.length ? { openingHoursSpecification: openingHours } : {}),
      ...(location.modalities.length
        ? { knowsAbout: location.modalities.map((m) => m.name) }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Discover", item: `${SITE_URL}/discover` },
        { "@type": "ListItem", position: 3, name: location.name, item: url },
      ],
    },
  ];
}
