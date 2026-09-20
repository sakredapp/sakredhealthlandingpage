/**
 * /for-practitioners.
 *
 * The most important thing on this page is what it does *not* say. The CTA is
 * "Request consideration", not "Get Sakred Verified" — a practitioner may
 * submit themselves for review, but cannot award themselves a trust state, and
 * cannot buy one (brief §20). Every line here is written so that a practitioner
 * who reads it and then reads the verification ladder finds the same promise
 * twice.
 */
import { SiteLayout } from "@/components/site/SiteLayout";
import { PractitionerApplication } from "@/components/health/PractitionerApplication";
import { EditorialImage } from "@/components/health/EditorialImage";
import { VerificationBadge } from "@/components/health/VerificationBadge";
import {
  StampHeading,
  Reveal,
  StaggerChildren,
  StaggerItem,
} from "@/components/motion";
import { HEALTH_IMAGES } from "@/data/health-images";
import { VERIFICATION_COPY, VERIFICATION_ORDER } from "@shared/health-network";
import { useSeo, SITE_URL } from "@/lib/seo";

const OFFERINGS = [
  {
    title: "Public discovery",
    body: "A profile that appears on the map and in search — with your modalities, your hours, and the way you actually describe your practice.",
  },
  {
    title: "A real professional profile",
    body: "Photography of your space, your practitioners, your credentials. Not a directory row with a phone number in it.",
  },
  {
    title: "Protocol delivery",
    body: "Coming to the network: assign the plan a client leaves with, so the days between appointments stop being a black box.",
  },
  {
    title: "Community context",
    body: "People already talk about where to go and who to see. Being in the network means those conversations can point at you.",
  },
  {
    title: "No pay-to-buy verification",
    body: "There is no tier to purchase and no placement to sponsor. What we checked is what the badge says we checked.",
  },
];

export default function ForPractitioners() {
  useSeo({
    title: "For Practitioners — Join the Sakred Health Network",
    description:
      "Sakred Health is building a curated network across traditional, holistic and integrative care. Request consideration for your practice — verification is earned, never purchased.",
    canonical: "/for-practitioners",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "For Practitioners — Sakred Health Network",
      url: `${SITE_URL}/for-practitioners`,
      description:
        "How practitioners and practices are considered for the Sakred Health Network.",
    },
  });

  return (
    <SiteLayout solidHeader>
      {/* ---- hero ---- */}
      <header className="border-b border-sakred-stone bg-sakred-surface-alt">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-sakred-gold-deep">
              For practitioners
            </p>
            <StampHeading
              as="h1"
              text="Help people find care they can"
              accent="feel confident choosing."
              className="font-display text-3xl leading-tight tracking-tight text-sakred-espresso sm:text-4xl lg:text-5xl"
            />
            <p className="mt-5 max-w-lg text-base leading-relaxed text-sakred-ink/70">
              Sakred Health is building a curated network across traditional, holistic,
              integrative and functional care. Submit yourself or your practice for
              consideration.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#apply"
                className="inline-flex items-center rounded-full border border-sakred-gold bg-gradient-to-r from-sakred-gold via-sakred-gold-light to-sakred-gold px-6 py-3 text-sm font-medium text-sakred-espresso transition-transform duration-micro hover:-translate-y-0.5"
              >
                Request consideration
              </a>
              <a
                href="/discover"
                className="text-sm font-medium text-sakred-ink/65 hover:text-sakred-espresso"
              >
                See the network →
              </a>
            </div>

            {/* Stated up front, before anyone fills anything in — not buried
                under the submit button where it reads as a disclaimer. */}
            <p className="mt-6 max-w-lg border-l-2 border-sakred-gold/40 pl-4 text-sm leading-relaxed text-sakred-ink/60">
              Submission does not guarantee listing, review, recommendation or
              verification by Sakred Health.
            </p>
          </div>

          <EditorialImage
            photo={HEALTH_IMAGES.practitioners}
            className="aspect-[5/4] w-full rounded-3xl"
            sizes="(max-width: 1024px) 100vw, 560px"
          />
        </div>
      </header>

      {/* ---- what being in the network means ---- */}
      <section className="surface-atlas py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="max-w-xl font-display text-2xl leading-tight text-sakred-espresso sm:text-3xl">
            What being in the network means
          </h2>

          <StaggerChildren as="ul" className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {OFFERINGS.map((offering) => (
              <StaggerItem as="li" key={offering.title}>
                <div className="h-full rounded-2xl border border-sakred-stone bg-sakred-surface p-6 lift-card">
                  <h3 className="font-display text-lg leading-snug text-sakred-espresso">
                    {offering.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-sakred-ink/65">
                    {offering.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ---- how review works ---- */}
      <section className="bg-sakred-canvas py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <h2 className="font-display text-2xl leading-tight text-sakred-espresso sm:text-3xl">
              How review works
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-sakred-ink/65">
              You can ask to be considered. You can&rsquo;t award yourself a state, and
              there is nothing to buy. Each level below is a check somebody at Sakred
              performs, in order.
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-sakred-ink/55">
              Not every practice reaches every level, and that is by design — a badge
              everyone has is a badge that tells a patient nothing.
            </p>
          </div>

          <ol className="space-y-4">
            {VERIFICATION_ORDER.map((state, index) => (
              <Reveal key={state} delay={index * 0.07}>
                <li className="rounded-2xl border border-sakred-stone bg-sakred-surface p-5">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="font-display text-lg text-sakred-gold">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <VerificationBadge state={state} size="md" showTooltip={false} />
                  </div>
                  <p className="text-sm leading-relaxed text-sakred-ink/70">
                    {VERIFICATION_COPY[state].detail}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- the application ---- */}
      <section id="apply" className="scroll-mt-20 bg-sakred-surface-alt py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-9">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-sakred-gold-deep">
              Request consideration
            </p>
            <h2 className="font-display text-2xl leading-tight text-sakred-espresso sm:text-3xl">
              Tell us about your practice
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-sakred-ink/65">
              A short form, then a conversation. We&rsquo;ll ask about what you practise,
              who you see and how you work — and we&rsquo;ll tell you plainly whether
              it&rsquo;s a fit.
            </p>
          </div>

          <PractitionerApplication />
        </div>
      </section>

      {/* ---- recommend someone else ---- */}
      <section className="surface-cafe py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-base leading-relaxed text-[#F5EFE3]/80">
            Not your own practice?{" "}
            <a
              href="/recommend"
              className="font-medium text-sakred-gold underline decoration-sakred-gold/40 underline-offset-4"
            >
              Recommend someone else
            </a>{" "}
            instead — it goes to the same team.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
