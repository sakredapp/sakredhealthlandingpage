/**
 * Shared motion primitives for the Sakred Health marketing pages.
 *
 * Ground rules these components enforce so animation never becomes load-bearing:
 *  1. Motion is additive — the page reads correctly if nothing ever animates.
 *  2. `prefers-reduced-motion` removes the *movement*, never the *information*.
 *     Counters show their final number, headlines render whole, ambient loops stop.
 *  3. Nothing loops off-screen. Every repeating animation is gated on visibility.
 *  4. Move a little: ~18px, ~620ms, one settle curve shared by everything.
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  type TargetAndTransition,
  type Variants,
} from "framer-motion";

/** The "settle" curve. One easing for the whole site keeps motion feeling like one system. */
export const EASE = [0.16, 1, 0.3, 1] as const;

/** Fire reveals slightly before the element reaches the bottom edge, so content is
 *  already settling as it scrolls into view instead of popping in late. */
const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

/**
 * Capped stagger. A row of cards should deal in like a hand; a 20-item list should
 * not animate for three seconds. Index in, delay (seconds) out.
 */
export function stagger(index: number, step = 0.07, cap = 0.42): number {
  return Math.min(index * step, cap);
}

/** Load-time entrance props (for above-the-fold content that never scrolls into view). */
export function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.62, ease: EASE, delay },
  };
}

/* ------------------------------------------------------------------ *
 * 1 · Scroll reveal — the workhorse
 * ------------------------------------------------------------------ */

interface RevealProps {
  children: ReactNode;
  /** Seconds. Use `stagger(i)` for lists. */
  delay?: number;
  /** Travel distance in px. Keep it small. */
  y?: number;
  className?: string;
  style?: CSSProperties;
}

export function Reveal({ children, delay = 0, y = 18, className, style }: RevealProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.62, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 * 2 · Scroll progress bar
 * ------------------------------------------------------------------ */

/**
 * Hairline that fills as you scroll. Sits directly under the fixed nav so it reads
 * as the nav's underline filling in rather than a separate widget.
 */
export function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 40,
    restDelta: 0.001,
  });

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-16 left-0 right-0 z-50 h-0.5 origin-left bg-gradient-to-r from-[#C5A059] to-[#EBD598]"
    />
  );
}

/* ------------------------------------------------------------------ *
 * 3 · Word-by-word headline entrance ("stamp")
 * ------------------------------------------------------------------ */

const GRADIENT_WORD =
  "bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent";

const stampContainer = (delay: number): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: 0.042, delayChildren: delay } },
});

const stampWord: Variants = {
  hidden: { opacity: 0, y: "0.16em", filter: "blur(1.5px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.46, ease: EASE },
  },
};

/** Same motion, no `filter`. Safari has long-standing bugs rendering an element that
 *  combines `background-clip: text` with a filter — it can drop out entirely. The gold
 *  gradient words are exactly that combination, so they settle without the blur. */
const stampWordAccent: Variants = {
  hidden: { opacity: 0, y: "0.16em" },
  visible: { opacity: 1, y: 0, transition: { duration: 0.46, ease: EASE } },
};

interface StampHeadingProps {
  /** Plain leading text. */
  text: string;
  /** Optional trailing phrase rendered in the gold gradient. */
  accent?: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  delay?: number;
}

/**
 * Presses a headline in one word at a time. Words — not letters; letter-by-letter
 * reads as a typewriter, which is a cheaper vibe.
 *
 * Text stays real text: each word is its own span with normal spaces between them,
 * so selection, search, and screen readers are unaffected. Under reduced motion the
 * whole heading renders as plain markup with no spans at all.
 */
export function StampHeading({
  text,
  accent,
  className,
  as = "h2",
  delay = 0,
}: StampHeadingProps) {
  const reduced = useReducedMotion();
  const Tag = as;

  if (reduced) {
    return (
      <Tag className={className}>
        {text}
        {accent ? <> <span className={GRADIENT_WORD}>{accent}</span></> : null}
      </Tag>
    );
  }

  const MotionTag = as === "h1" ? motion.h1 : as === "h3" ? motion.h3 : motion.h2;
  const plain = text.trim().split(/\s+/);
  const gold = accent ? accent.trim().split(/\s+/) : [];

  return (
    <MotionTag
      className={className}
      variants={stampContainer(delay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
    >
      {plain.map((word, i) => (
        <span key={`p-${i}`}>
          <motion.span variants={stampWord} className="inline-block">
            {word}
          </motion.span>
          {i < plain.length - 1 || gold.length > 0 ? " " : null}
        </span>
      ))}
      {gold.map((word, i) => (
        <span key={`a-${i}`}>
          <motion.span variants={stampWordAccent} className={`inline-block ${GRADIENT_WORD}`}>
            {word}
          </motion.span>
          {i < gold.length - 1 ? " " : null}
        </span>
      ))}
    </MotionTag>
  );
}

/* ------------------------------------------------------------------ *
 * 4 · Pointer glow (light-surface adaptation of the dark-panel spotlight)
 * ------------------------------------------------------------------ */

interface GlowCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * A soft gold glow that follows the pointer across a card, giving it a surface.
 *
 * Pointer-only by construction — a touch device never fires `pointermove`, so there
 * is nothing to feature-detect and nothing to clean up. Coordinates are written
 * straight to CSS custom properties, so tracking the pointer costs zero re-renders.
 */
export function GlowCard({ children, className }: GlowCardProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--glow-x", `${event.clientX - rect.left}px`);
    el.style.setProperty("--glow-y", `${event.clientY - rect.top}px`);
    el.classList.add("is-lit");
  }, []);

  const onLeave = useCallback(() => {
    ref.current?.classList.remove("is-lit");
  }, []);

  return (
    <div
      ref={ref}
      className={`glow-card ${className ?? ""}`}
      onPointerMove={reduced ? undefined : onMove}
      onPointerLeave={reduced ? undefined : onLeave}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 5 · Count-up numbers
 * ------------------------------------------------------------------ */

interface CountUpProps {
  /** The real value. Never animate to a number the page cannot stand behind. */
  to: number;
  suffix?: string;
  prefix?: string;
  /** Milliseconds. */
  duration?: number;
  className?: string;
}

/** Rolls a number up to its value when it scrolls into view. */
export function CountUp({
  to,
  suffix = "",
  prefix = "",
  duration = 1400,
  className,
}: CountUpProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [value, setValue] = useState(reduced ? to : 0);

  useEffect(() => {
    if (reduced || !inView) return;

    let frame = 0;
    let start: number | null = null;

    const tick = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setValue(Math.round(to * eased));
      if (p < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, to, duration]);

  return (
    <span ref={ref} className={className}>
      {/* The accessible value is always the real one — assistive tech never hears the ramp. */}
      <span aria-hidden="true">
        {prefix}
        {value.toLocaleString()}
        {suffix}
      </span>
      <span className="sr-only">
        {prefix}
        {to.toLocaleString()}
        {suffix}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Ambient background blobs
 * ------------------------------------------------------------------ */

interface AmbientBlobProps {
  className: string;
  animate: TargetAndTransition;
  /** Seconds per cycle. */
  duration?: number;
}

/**
 * A slow, looping decorative blob — gated so it stops when the user prefers reduced
 * motion and whenever it scrolls off-screen. An animation nobody is looking at still
 * costs a phone its battery.
 */
export function AmbientBlob({ className, animate, duration = 8 }: AmbientBlobProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0 });
  const active = !reduced && inView;

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      className={className}
      animate={active ? animate : undefined}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
