/**
 * "Care doesn't stop when the appointment ends."
 *
 * Protocols are still here and still matter — they are just no longer the
 * product (brief §12). So this is one band with one phone card, not the six
 * detox-protocol sections the old site led with.
 *
 * Careful with the claim: Sakred organises guidance between visits. It is not
 * an EHR, it does not hold a clinical record, and the copy never suggests a
 * practitioner is monitoring anything through it.
 */
import { Link } from "wouter";
import { StampHeading, Reveal } from "@/components/motion";
import { ProtocolFragment } from "./HowSakredWorks";

const POINTS = [
  {
    title: "Sakred protocols",
    body: "Structured multi-day plans for sleep, digestion, recovery and daily rhythm — sequenced, not dumped on you as a list.",
  },
  {
    title: "Practitioner-assigned plans",
    body: "Coming to the network: the plan you actually left the appointment with, in the same place as everything else.",
  },
  {
    title: "One place between visits",
    body: "What to do today, what you did yesterday, and what to bring up next time you go in.",
  },
];

export function ProtocolsBand() {
  return (
    <section className="bg-sakred-canvas py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:gap-16 lg:px-8">
        <div>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-sakred-gold-deep">
            Between visits
          </p>
          <StampHeading
            as="h2"
            text="Care doesn't stop when"
            accent="the appointment ends."
            className="font-display text-3xl leading-tight tracking-tight text-sakred-espresso sm:text-4xl"
          />
          <p className="mt-4 max-w-lg text-base leading-relaxed text-sakred-ink/65">
            Most of what determines how a course of care goes happens in the days
            between appointments, where nobody is watching. Sakred protocols keep
            that guidance organised.
          </p>

          <dl className="mt-8 space-y-6">
            {POINTS.map((point, index) => (
              <Reveal key={point.title} delay={index * 0.08}>
                <div className="border-l-2 border-sakred-gold/35 pl-4">
                  <dt className="text-sm font-semibold text-sakred-espresso">
                    {point.title}
                  </dt>
                  <dd className="mt-1 max-w-md text-sm leading-relaxed text-sakred-ink/60">
                    {point.body}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>

          <Link
            href="/app"
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-sakred-espresso"
          >
            <span className="border-b border-sakred-gold pb-0.5">See it in the app</span>
            <span aria-hidden="true" className="text-sakred-gold">
              →
            </span>
          </Link>
        </div>

        <Reveal className="h-[28rem]">
          <ProtocolFragment />
        </Reveal>
      </div>
    </section>
  );
}
