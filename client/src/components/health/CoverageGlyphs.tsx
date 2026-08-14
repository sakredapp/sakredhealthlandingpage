/**
 * Fine gold line diagrams for the coverage surfaces.
 *
 * Drawn rather than iconographic: a roofline, an income curve, a life line, a
 * retirement horizon. They stand in for the stock photography that insurance
 * pages usually reach for — the handshake, the umbrella, the folded-arms
 * agent — and they hold the palette instead of fighting it (brief §15).
 *
 * Each one draws itself in when it scrolls into view, once, using
 * stroke-dashoffset. They are decorative and marked `aria-hidden`; every one
 * sits next to a heading that says the same thing in words.
 */
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/components/motion";

const VIEWPORT = { once: true, amount: 0.5 } as const;

function Draw({
  d,
  delay = 0,
  length = 260,
}: {
  d: string;
  delay?: number;
  /** Rough path length. Anything ≥ the true length draws cleanly. */
  length?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={reduced ? false : { strokeDasharray: length, strokeDashoffset: length }}
      whileInView={{ strokeDashoffset: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 1.1, ease: EASE, delay }}
    />
  );
}

const shell = "h-full w-full text-sakred-gold";

/** A roofline over a doorway — mortgage protection. */
export function GlyphHome() {
  return (
    <svg viewBox="0 0 120 90" className={shell} aria-hidden="true">
      <Draw d="M12 44 60 12l48 32" length={130} />
      <Draw d="M24 40v38h72V40" delay={0.16} length={150} />
      <Draw d="M50 78V56h20v22" delay={0.32} length={70} />
    </svg>
  );
}

/** A paycheque line that keeps going past a break — life insurance. */
export function GlyphIncome() {
  return (
    <svg viewBox="0 0 120 90" className={shell} aria-hidden="true">
      <Draw d="M10 62c14 0 18-26 30-26s16 22 28 22 18-30 30-30 12 16 12 16" length={180} />
      <Draw d="M10 78h100" delay={0.2} length={110} />
      <motion.circle
        cx="68"
        cy="58"
        r="3.5"
        fill="currentColor"
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.4, ease: EASE, delay: 0.85 }}
      />
    </svg>
  );
}

/** A single steady line closing into a circle — final expense. */
export function GlyphLine() {
  return (
    <svg viewBox="0 0 120 90" className={shell} aria-hidden="true">
      <Draw d="M8 50h26l8-16 10 34 10-24 8 12 8-6h34" length={160} />
      <Draw d="M60 76c0-8 6-14 14-14" delay={0.3} length={40} />
    </svg>
  );
}

/** A pulse resolving into a flat, calm rhythm — health cover. */
export function GlyphHeart() {
  return (
    <svg viewBox="0 0 120 90" className={shell} aria-hidden="true">
      <Draw
        d="M60 74S26 54 26 34a17 17 0 0 1 34-6 17 17 0 0 1 34 6c0 20-34 40-34 40Z"
        length={230}
      />
      <Draw d="M8 44h22l7-11 9 22 7-11h10" delay={0.25} length={100} />
    </svg>
  );
}

/** A form with a subsidy line resolved — ACA marketplace. */
export function GlyphForm() {
  return (
    <svg viewBox="0 0 120 90" className={shell} aria-hidden="true">
      <Draw d="M30 10h44l16 16v54H30Z" length={200} />
      <Draw d="M74 10v16h16" delay={0.18} length={40} />
      <Draw d="M42 44h36M42 56h36M42 68h20" delay={0.34} length={120} />
    </svg>
  );
}

/** A horizon with a sun just clearing it — retirement. */
export function GlyphHorizon() {
  return (
    <svg viewBox="0 0 120 90" className={shell} aria-hidden="true">
      <Draw d="M6 62h108" length={120} />
      <Draw d="M36 62a24 24 0 0 1 48 0" delay={0.2} length={90} />
      <Draw d="M14 74h92M26 82h68" delay={0.4} length={180} />
    </svg>
  );
}

export const COVERAGE_GLYPHS: Record<string, () => JSX.Element> = {
  "mortgage-protection": GlyphHome,
  "life-insurance": GlyphIncome,
  "final-expense": GlyphLine,
  "health-insurance": GlyphHeart,
  "aca-plans": GlyphForm,
  "retirement-annuities": GlyphHorizon,
};
