/**
 * /practitioners/:slug — a published practitioner.
 *
 * Same restraint as the location page: the Sakred note renders only when one
 * was written, and the page never asserts a specialism the record doesn't
 * carry. A practitioner's page is the most personal thing on this site and the
 * one where a fabricated sentence would do the most damage.
 */
import { useEffect } from "react";
import { useParams, useLocation as useRoute } from "wouter";
import { MapPin } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { NetworkImage } from "@/components/health/EditorialImage";
import { ProviderCard } from "@/components/health/ProviderCard";
import { VerificationBadge } from "@/components/health/VerificationBadge";
import {
  NetworkSkeleton,
  NetworkUnavailable,
} from "@/components/health/NetworkStates";
import { Reveal, StaggerChildren, StaggerItem } from "@/components/motion";
import { usePractitioner } from "@/lib/network";
import { useSeo, SITE_URL } from "@/lib/seo";
import { track } from "@/lib/analytics";
import {
  VERIFICATION_COPY,
  practitionerPath,
  type HealthPractitioner,
} from "@shared/health-network";
import NotFound from "./not-found";

export default function PractitionerPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useRoute();
  const { data, isLoading, isError } = usePractitioner(slug);
  const practitioner = data?.practitioner;

  /* Retired slug → canonical URL. See the note in LocationPage. */
  useEffect(() => {
    if (practitioner?.redirect && practitioner.canonicalSlug && practitioner.canonicalSlug !== slug) {
      navigate(practitionerPath(practitioner.canonicalSlug), { replace: true });
    }
  }, [practitioner?.redirect, practitioner?.canonicalSlug, slug, navigate]);

  useEffect(() => {
    if (!practitioner) return;
    track("provider_view", {
      surface: "practitioner_page",
      verification: practitioner.verification,
    });
  }, [practitioner?.id, practitioner?.verification]);

  const modalityNames = practitioner?.modalities.map((m) => m.name).join(", ") ?? "";
  const places = practitioner?.locations.map((l) => `${l.city}, ${l.region}`) ?? [];

  useSeo({
    title: practitioner
      ? `${practitioner.name}${
          practitioner.credentials ? `, ${practitioner.credentials}` : ""
        } | Sakred Health Network`
      : "Practitioner | Sakred Health Network",
    description: practitioner
      ? `${practitioner.name}${modalityNames ? ` — ${modalityNames}` : ""}${
          places.length ? `, practising in ${places[0]}` : ""
        }. Listed on the Sakred Health Network.`
      : "A practitioner on the Sakred Health Network.",
    canonical: slug ? `/practitioners/${slug}` : undefined,
    image: practitioner?.photo?.url,
    jsonLd: practitioner ? buildJsonLd(practitioner, slug!) : undefined,
  });

  if (isLoading) {
    return (
      <SiteLayout solidHeader>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <NetworkSkeleton rows={2} />
        </div>
      </SiteLayout>
    );
  }

  if (isError) {
    return (
      <SiteLayout solidHeader>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <NetworkUnavailable />
        </div>
      </SiteLayout>
    );
  }

  if (!practitioner) return <NotFound />;

  return (
    <SiteLayout solidHeader>
      <header className="border-b border-sakred-stone bg-sakred-surface-alt">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-5 text-xs text-sakred-ink/50">
            <a href="/discover" className="hover:text-sakred-espresso">
              Discover
            </a>
            <span className="mx-1.5">/</span>
            <span className="text-sakred-ink/70">{practitioner.name}</span>
          </nav>

          <div className="flex flex-col gap-7 sm:flex-row sm:items-start">
            <NetworkImage
              photo={practitioner.photo}
              subject={practitioner.name}
              id={practitioner.id}
              modalities={practitioner.modalities}
              className="h-48 w-40 shrink-0 rounded-2xl"
              sizes="160px"
              eager
            />

            <div className="min-w-0 flex-1">
              <h1 className="font-display text-3xl leading-tight tracking-tight text-sakred-espresso sm:text-4xl">
                {practitioner.name}
              </h1>
              {practitioner.credentials && (
                <p className="mt-1 text-sm text-sakred-ink/55">{practitioner.credentials}</p>
              )}
              {practitioner.headline && (
                <p className="mt-3 max-w-xl text-base leading-relaxed text-sakred-ink/70">
                  {practitioner.headline}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <VerificationBadge state={practitioner.verification} size="md" />
                {practitioner.yearsPracticing ? (
                  <span className="rounded-full border border-sakred-stone bg-sakred-surface px-3 py-1 text-xs text-sakred-ink/65">
                    {practitioner.yearsPracticing} years practising
                  </span>
                ) : null}
                {practitioner.languages?.length ? (
                  <span className="rounded-full border border-sakred-stone bg-sakred-surface px-3 py-1 text-xs text-sakred-ink/65">
                    {practitioner.languages.join(", ")}
                  </span>
                ) : null}
              </div>

              {practitioner.modalities.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {practitioner.modalities.map((modality) => (
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
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-14 px-4 py-14 sm:px-6 lg:px-8">
        {practitioner.sakredNote && (
          <Reveal>
            <section className="rounded-2xl border border-sakred-gold/30 bg-sakred-gold/[0.07] p-6 sm:p-8">
              <h2 className="font-display text-2xl text-sakred-espresso">
                Why Sakred recommends them
              </h2>
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-sakred-ink/75">
                {practitioner.sakredNote}
              </p>
            </section>
          </Reveal>
        )}

        {practitioner.bio && (
          <Reveal>
            <section>
              <h2 className="font-display text-2xl text-sakred-espresso">About</h2>
              <div className="mt-3 max-w-2xl space-y-4 text-base leading-relaxed text-sakred-ink/70">
                {practitioner.bio.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {practitioner.locations.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 font-display text-2xl text-sakred-espresso">
              <MapPin className="h-5 w-5 text-sakred-gold" aria-hidden="true" />
              Where they practise
            </h2>
            <StaggerChildren as="ul" className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {practitioner.locations.map((location) => (
                <StaggerItem as="li" key={location.id} className="min-w-0">
                  <ProviderCard location={location} />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </section>
        )}

        <Reveal>
          <section className="rounded-2xl border border-sakred-stone bg-sakred-surface p-6">
            <h2 className="font-display text-2xl text-sakred-espresso">Verification</h2>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <VerificationBadge state={practitioner.verification} size="md" />
              {practitioner.verifiedAt && (
                <span className="text-xs text-sakred-ink/50">
                  Last checked{" "}
                  {new Date(practitioner.verifiedAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-sakred-ink/65">
              {VERIFICATION_COPY[practitioner.verification].detail}
            </p>
            <p className="mt-3 text-xs text-sakred-ink/45">
              Directory information, not a clinical endorsement. Sakred Health does not
              provide medical advice, diagnosis or treatment.
            </p>
          </section>
        </Reveal>
      </div>
    </SiteLayout>
  );
}

/**
 * `Person` with `worksFor`, not `Physician`.
 *
 * Most of the network is not made up of physicians, and `Physician` is a
 * specific claim about licensure that we are in no position to make on every
 * practitioner's behalf. `knowsAbout` carries the modalities instead.
 */
function buildJsonLd(practitioner: HealthPractitioner, slug: string) {
  const url = `${SITE_URL}/practitioners/${slug}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": url,
      name: practitioner.name,
      url,
      ...(practitioner.credentials ? { honorificSuffix: practitioner.credentials } : {}),
      ...(practitioner.headline ? { jobTitle: practitioner.headline } : {}),
      ...(practitioner.bio ? { description: practitioner.bio } : {}),
      ...(practitioner.photo ? { image: practitioner.photo.url } : {}),
      ...(practitioner.modalities.length
        ? { knowsAbout: practitioner.modalities.map((m) => m.name) }
        : {}),
      ...(practitioner.locations.length
        ? {
            worksFor: practitioner.locations.map((location) => ({
              "@type": "LocalBusiness",
              name: location.name,
              url: `${SITE_URL}/locations/${location.slug}`,
              address: {
                "@type": "PostalAddress",
                addressLocality: location.city,
                addressRegion: location.region,
              },
            })),
          }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Discover", item: `${SITE_URL}/discover` },
        { "@type": "ListItem", position: 3, name: practitioner.name, item: url },
      ],
    },
  ];
}
