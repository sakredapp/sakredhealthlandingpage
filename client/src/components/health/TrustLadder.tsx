/**
 * "Know who you're choosing." — the section directly under the hero.
 *
 * Structurally this is the handoff the brief asks for (§2, §9): the practice
 * that rose out of a map pin a screen ago is now shown at full size, so the
 * page reads as one object being examined rather than two unrelated bands.
 *
 * The four trust states are drawn as a ladder with a gold line that draws
 * itself in as you arrive. The line matters: it says these are *steps*, in
 * order, each containing the one below it — not four badges a practice can
 * pick from.
 */
import { useRef } from "react";
import { motion, useInView, useReducedMotion, useTransform } from "framer-motion";
import { DUR, EASE, StampHeading, useSectionProgress } from "@/components/motion";
import { AtlasCrosshair, AtlasTicks } from "./AtlasMarks";
import { EditorialImage } from "./EditorialImage";
import { VerificationBadge } from "./VerificationBadge";
import { HEALTH_IMAGES } from "@/data/health-images";
import { VERIFICATION_COPY, VERIFICATION_ORDER } from "@shared/health-network";

export function TrustLadder() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const reduced = useReducedMotion();

  /**
   * The handoff.
   *
   * The hero ends with a small provider card sitting on the map. This section
   * opens with the same object at full size — so rather than fading in, the
   * photo *arrives*: it rises and scales up as the section enters, driven by
   * scroll position rather than by a timer. One continuous gesture carries the
   * card out of the map and into the profile, which is the whole argument for
   * the page reading as one surface instead of a stack of bands.
   */
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useSectionProgress(sectionRef);
  const riseY = useTransform(progress, [0, 0.42], [64, 0]);
  const riseScale = useTransform(progress, [0, 0.42], [0.94, 1]);

  return (
    <section
      ref={sectionRef}
      id="trust"
      className="relative overflow-hidden bg-sakred-surface-alt py-20 sm:py-28"
    >
      {/* marginalia — one crosshair, one tick run, and that is the whole budget */}
      <AtlasTicks className="absolute left-6 top-10 hidden lg:flex" label="N 41" vertical />
      <AtlasCrosshair className="absolute right-10 top-16 hidden h-10 w-10 lg:block" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        {/* ---------------- the practice ---------------- */}
        <motion.div
          className="relative"
          style={reduced ? undefined : { y: riseY, scale: riseScale }}
        >
          <EditorialImage
            photo={HEALTH_IMAGES.trustPractice}
            className="aspect-[4/5] w-full rounded-3xl sm:aspect-[5/4] lg:aspect-[4/5]"
            sizes="(max-width: 1024px) 100vw, 520px"
          />

          {/* A verification chip clipped to the photo — the badge shown in
              context, on a practice, rather than as an abstract legend. */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 14, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: DUR.card, ease: EASE, delay: 0.25 }}
            className="absolute -bottom-4 left-5 rounded-2xl border border-sakred-stone bg-sakred-surface px-4 py-3 shadow-[0_20px_44px_-28px_rgba(28,26,23,0.5)] sm:left-8"
          >
            {/* 11px, matching every other eyebrow on the site. This is
                ordinary explanatory copy, not a photo credit or a legal line,
                so it does not get the microtext treatment those earn. */}
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-sakred-ink/45">
              The badge you&rsquo;re looking for
            </p>
            <VerificationBadge state="sakred_verified" size="md" />
          </motion.div>
        </motion.div>

        {/* ---------------- the ladder ---------------- */}
        <div ref={ref}>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-sakred-gold-deep">
            Verification
          </p>
          <StampHeading
            as="h2"
            text="Know who"
            accent="you're choosing."
            className="font-display text-3xl leading-tight tracking-tight text-sakred-espresso sm:text-4xl"
          />
          <p className="mt-4 max-w-md text-base leading-relaxed text-sakred-ink/65">
            A listing on Sakred means something specific, and we say exactly what.
            Four states, each one a check somebody actually performed.
          </p>

          <ol className="relative mt-9">
            {/* The rail. Drawn with a stroke-dashoffset animation so it grows
                downward through the steps instead of appearing all at once. */}
            <svg
              className="pointer-events-none absolute left-[13px] top-2 h-[calc(100%-1rem)] w-px overflow-visible"
              aria-hidden="true"
              preserveAspectRatio="none"
              viewBox="0 0 1 100"
            >
              <motion.line
                x1="0.5"
                y1="0"
                x2="0.5"
                y2="100"
                stroke="#C5A059"
                strokeOpacity="0.5"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                initial={reduced ? false : { pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : undefined}
                transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
              />
            </svg>

            {VERIFICATION_ORDER.map((state, index) => {
              const copy = VERIFICATION_COPY[state];
              return (
                <motion.li
                  key={state}
                  initial={reduced ? false : { opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : undefined}
                  transition={{ duration: DUR.card, ease: EASE, delay: 0.25 + index * 0.13 }}
                  className="relative flex gap-5 pb-8 pl-0 last:pb-0"
                >
                  <span
                    className={`relative z-10 mt-0.5 flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${
                      index === VERIFICATION_ORDER.length - 1
                        ? "border-sakred-gold bg-sakred-gold text-sakred-espresso"
                        : "border-sakred-gold/45 bg-sakred-surface text-sakred-gold-deep"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="pt-0.5">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sakred-espresso">
                      {copy.label}
                    </h3>
                    <p className="mt-1.5 text-sm font-medium text-sakred-ink/80">
                      {copy.description}
                    </p>
                    <p className="mt-1 max-w-sm text-sm leading-relaxed text-sakred-ink/55">
                      {copy.detail}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ol>

          <p className="mt-8 max-w-md border-l-2 border-sakred-gold/40 pl-4 text-sm leading-relaxed text-sakred-ink/60">
            A practitioner can ask to be considered. They can&rsquo;t buy a state, and
            they can&rsquo;t award themselves one.
          </p>
        </div>
      </div>
    </section>
  );
}
