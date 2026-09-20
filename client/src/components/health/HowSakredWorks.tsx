/**
 * "How Sakred works" — discover, choose, continue.
 *
 * One sticky visual on the left, three steps scrolling past it on the right.
 * The visual changes state as each step arrives, so a single scroll gesture
 * carries the same object from a map, to a profile, to a protocol — which is
 * the whole argument the section is making (brief §10).
 *
 * On mobile the sticky column collapses and each step carries its own visual
 * inline. A sticky panel on a phone eats the viewport the copy needs.
 *
 * ── On the illustrated fragments ─────────────────────────────────────
 *
 * The profile fragment draws a card with bars where a name would be, not an
 * invented practice. It is legible as a diagram of the interface rather than
 * as a claim about a real clinic — the same choice the old policy-stack hero
 * made. The protocol fragment does show real strings, because those are
 * Sakred's own product content.
 */
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Check, Compass, FileText, Route } from "lucide-react";
import { DUR, EASE, StampHeading } from "@/components/motion";
import { AtlasCanvas } from "@/components/map/AtlasCanvas";
import { VerificationBadge } from "./VerificationBadge";

/* ------------------------------------------------------------------ *
 * Fragments
 * ------------------------------------------------------------------ */

function MapFragment() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <AtlasCanvas className="h-full w-full" animated />
      {/* Pins land in sequence, once. */}
      {[
        { top: "34%", left: "28%" },
        { top: "52%", left: "58%" },
        { top: "26%", left: "68%" },
        { top: "66%", left: "38%" },
      ].map((position, index) => (
        <motion.span
          key={index}
          style={position}
          initial={{ opacity: 0, scale: 0.4, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.2 + index * 0.12 }}
          className="absolute block h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-sakred-surface bg-sakred-gold shadow-[0_3px_8px_-2px_rgba(28,26,23,0.5)]"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function ProfileFragment() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-sakred-surface-alt p-6">
      <div className="w-full max-w-[19rem] overflow-hidden rounded-2xl border border-sakred-stone bg-sakred-surface shadow-[0_22px_50px_-32px_rgba(28,26,23,0.5)]">
        <div className="aspect-[16/10] w-full bg-gradient-to-br from-sakred-parchment via-sakred-surface-alt to-sakred-stone" />
        <div className="space-y-2.5 p-4">
          <div className="h-3 w-3/5 rounded-full bg-sakred-limestone" />
          <VerificationBadge state="sakred_reviewed" />
          <div className="h-2 w-4/5 rounded-full bg-sakred-stone/70" />
          <div className="h-2 w-2/3 rounded-full bg-sakred-stone/70" />
          <div className="flex gap-1.5 pt-1.5">
            <span className="h-5 w-16 rounded-full border border-sakred-stone" />
            <span className="h-5 w-20 rounded-full border border-sakred-stone" />
          </div>
        </div>
      </div>
    </div>
  );
}

const PROTOCOL_STEPS = [
  { label: "Hydration with minerals", done: true },
  { label: "20-minute walk", done: true },
  { label: "Herbal tea", done: true },
  { label: "Acupressure points", done: false },
  { label: "Evening recovery", done: false },
];

export function ProtocolFragment({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-sakred-surface-alt ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <div className="w-full max-w-[17rem] rounded-[1.6rem] border border-sakred-stone bg-sakred-surface p-4 shadow-[0_22px_50px_-32px_rgba(28,26,23,0.5)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sakred-gold-deep">
          Protocol
        </p>
        <h4 className="mt-1 font-display text-lg leading-tight text-sakred-espresso">
          Post-Treatment Recovery
        </h4>
        <p className="mt-0.5 text-xs text-sakred-ink/55">Day 3 of 7 · 3 of 5 complete</p>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sakred-stone/70">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "60%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
            className="h-full rounded-full bg-gradient-to-r from-sakred-gold to-sakred-gold-light"
          />
        </div>

        <ul className="mt-4 space-y-2.5">
          {PROTOCOL_STEPS.map((step) => (
            <li key={step.label} className="flex items-center gap-2.5">
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                  step.done
                    ? "border-sakred-gold bg-sakred-gold"
                    : "border-sakred-limestone bg-transparent"
                }`}
                aria-hidden="true"
              >
                {step.done && <Check className="h-2.5 w-2.5 text-sakred-espresso" />}
              </span>
              <span
                className={`text-xs ${
                  step.done ? "text-sakred-ink/45 line-through" : "text-sakred-ink/75"
                }`}
              >
                {step.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Section
 * ------------------------------------------------------------------ */

const STEPS = [
  {
    n: "01",
    title: "Discover",
    icon: Compass,
    body: "Search the network around you — by what you're looking for, by where you are, or by who a friend told you to see.",
    Fragment: MapFragment,
  },
  {
    n: "02",
    title: "Choose",
    icon: FileText,
    body: "Understand who they are, what they practise, and why they're here. Credentials, modalities, hours, and what Sakred checked before publishing them.",
    Fragment: ProfileFragment,
  },
  {
    n: "03",
    title: "Continue",
    icon: Route,
    body: "Follow protocols, learn, and stay connected after the appointment — so the plan you left with doesn't dissolve on the drive home.",
    Fragment: ProtocolFragment,
  },
] as const;

function Step({
  step,
  index,
  onEnter,
}: {
  step: (typeof STEPS)[number];
  index: number;
  onEnter: (index: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  /* `amount: 0.6` means the step has to be genuinely centred before it claims
     the sticky panel — otherwise the visual flickers between two states while
     a step is only half on screen. */
  const inView = useInView(ref, { amount: 0.6, margin: "-20% 0px -20% 0px" });
  const reduced = useReducedMotion();

  // In an effect, not in render: claiming the sticky panel is a state update
  // on the parent, and React forbids doing that while a child is rendering.
  useEffect(() => {
    if (inView) onEnter(index);
  }, [inView, index, onEnter]);

  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: DUR.reveal, ease: EASE }}
      className="lg:min-h-[62vh] lg:py-16"
    >
      <div className="flex items-center gap-3">
        <span className="font-display text-2xl text-sakred-gold">{step.n}</span>
        <span className="h-px w-8 bg-sakred-gold/45" aria-hidden="true" />
        <Icon className="h-4 w-4 text-sakred-gold-deep" aria-hidden="true" />
      </div>

      <h3 className="mt-4 font-display text-3xl tracking-tight text-sakred-espresso sm:text-4xl">
        {step.title}
      </h3>
      <p className="mt-3 max-w-md text-base leading-relaxed text-sakred-ink/65">{step.body}</p>

      {/* Mobile: each step carries its own visual, and its own frame — there
          is no sticky panel to inherit one from. */}
      <div className="mt-6 h-64 overflow-hidden rounded-2xl border border-sakred-stone lg:hidden">
        <step.Fragment />
      </div>
    </motion.div>
  );
}

export function HowSakredWorks() {
  const [active, setActive] = useState(0);

  return (
    <section id="how-it-works" className="surface-atlas py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-sakred-gold-deep">
            How Sakred works
          </p>
          <StampHeading
            as="h2"
            text="Three steps, and the last one"
            accent="doesn't end."
            className="font-display text-3xl leading-tight tracking-tight text-sakred-espresso sm:text-4xl"
          />
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Sticky visual — desktop only.
           *
           * ONE frame that persists across all three steps, with only its
           * contents changing. That is the difference between "three
           * screenshots" and "one product evolving": the border, the shadow and
           * the rounded corner never leave the screen, so the eye reads the
           * map becoming a profile becoming a protocol rather than three
           * unrelated panels swapping places. */}
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <div className="relative h-[30rem] overflow-hidden rounded-3xl border border-sakred-stone bg-sakred-surface-alt shadow-[0_30px_70px_-45px_rgba(28,26,23,0.55)]">
                {STEPS.map((step, index) => (
                  <motion.div
                    key={step.n}
                    className="absolute inset-0"
                    initial={false}
                    animate={{
                      opacity: active === index ? 1 : 0,
                      /* The outgoing panel sinks a little and the incoming one
                         rises into place, so the transition has a direction
                         rather than being a dissolve. */
                      y: active === index ? 0 : active > index ? -14 : 14,
                      scale: active === index ? 1 : 0.985,
                    }}
                    transition={{ duration: DUR.card, ease: EASE }}
                    /* Hidden panels must not be reachable — a screen reader
                       shouldn't announce three overlapping diagrams. */
                    aria-hidden={active !== index}
                    style={{ pointerEvents: active === index ? "auto" : "none" }}
                  >
                    <step.Fragment />
                  </motion.div>
                ))}
              </div>

              {/* Step rail under the frame: shows where you are in the story
                  and that there are three states, not three pages. */}
              <div className="mt-5 flex items-center gap-2" aria-hidden="true">
                {STEPS.map((step, index) => (
                  <span
                    key={step.n}
                    className="h-0.5 flex-1 overflow-hidden rounded-full bg-sakred-stone"
                  >
                    <motion.span
                      className="block h-full rounded-full bg-sakred-gold"
                      initial={false}
                      animate={{ scaleX: active >= index ? 1 : 0 }}
                      style={{ transformOrigin: "left" }}
                      transition={{ duration: DUR.card, ease: EASE }}
                    />
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            {STEPS.map((step, index) => (
              <Step key={step.n} step={step} index={index} onEnter={setActive} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
