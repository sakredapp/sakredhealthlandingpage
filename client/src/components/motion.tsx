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
  useTransform,
  type MotionValue,
  type TargetAndTransition,
  type Variants,
} from "framer-motion";

/** The "settle" curve. One easing for the whole site keeps motion feeling like one system. */
export const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The site's timing scale (brief §26). Seconds, because that is what
 * framer-motion takes. Nothing should invent a duration outside this table —
 * if a new interaction doesn't fit one of these, it is the wrong interaction.
 */
export const DUR = {
  /** Micro interaction: hover, toggle, chip select. */
  micro: 0.16,
  /** A card, panel or list item arriving. */
  card: 0.44,
  /** The workhorse scroll reveal. */
  reveal: 0.62,
  /** The hero's opening sequence, start to finish. */
  hero: 1.0,
} as const;

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
 * 6 · Stagger container / child
 * ------------------------------------------------------------------ */

const staggerParent = (step: number, delay: number): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: step, delayChildren: delay } },
});

const staggerChild = (y: number): Variants => ({
  hidden: { opacity: 0, y },
  visible: { opacity: 1, y: 0, transition: { duration: DUR.card, ease: EASE } },
});

interface StaggerProps {
  children: ReactNode;
  className?: string;
  /** Seconds between children. */
  step?: number;
  delay?: number;
  y?: number;
  as?: "div" | "ul" | "ol";
}

/**
 * Deals its children in one after another when the group scrolls into view.
 *
 * Wrap each child in `<StaggerItem>`. Unlike calling `Reveal` in a `.map()`
 * with a computed delay, the timing lives in one place, so a row of four and a
 * grid of twelve are visibly the same gesture.
 */
export function StaggerChildren({
  children,
  className,
  step = 0.07,
  delay = 0,
  as = "div",
}: StaggerProps) {
  const reduced = useReducedMotion();
  const Tag = as === "ul" ? motion.ul : as === "ol" ? motion.ol : motion.div;

  return (
    <Tag
      className={className}
      variants={staggerParent(reduced ? 0 : step, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      {children}
    </Tag>
  );
}

/** One child of a `StaggerChildren` group. */
export function StaggerItem({
  children,
  className,
  y = 16,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  as?: "div" | "li";
}) {
  const Tag = as === "li" ? motion.li : motion.div;
  return (
    <Tag className={className} variants={staggerChild(y)}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ *
 * 7 · Parallax image
 * ------------------------------------------------------------------ */

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Total travel in px across the whole scroll-through. Keep it under ~60. */
  distance?: number;
  /** Skip lazy-loading for an above-the-fold hero image. */
  eager?: boolean;
  sizes?: string;
}

/**
 * A photo that drifts against the page as it scrolls past.
 *
 * The image is deliberately over-sized (`h-[118%]`, pulled up by 9%) so the
 * frame is never uncovered at either end of the travel. Motion is on the
 * image only — any caption or text layered over the frame stays put, because
 * text sliding under a reader's eye is the thing that makes parallax feel
 * cheap.
 */
export function ParallaxImage({
  src,
  alt,
  className,
  distance = 44,
  eager = false,
  sizes,
}: ParallaxImageProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-distance / 2, distance / 2]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.img
        src={src}
        alt={alt}
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        style={reduced ? undefined : { y }}
        className="absolute inset-x-0 -top-[9%] h-[118%] w-full object-cover"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * 8 · Lift card
 * ------------------------------------------------------------------ */

/**
 * Scroll-reveal plus the shared hover lift, in one wrapper.
 *
 * The lift itself is CSS (`.lift-card` in index.css) rather than framer state:
 * a hover that costs a React render per pointer event is a hover that stutters
 * on a grid of twenty cards.
 */
export function LiftCard({
  children,
  className,
  delay = 0,
  /** Set when the card is already inside a `StaggerChildren` group. */
  inStagger = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  inStagger?: boolean;
}) {
  const reduced = useReducedMotion();
  const classes = `lift-card ${className ?? ""}`;

  if (inStagger) {
    return (
      <motion.div className={classes} variants={staggerChild(16)}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={classes}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: DUR.card, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 * 9 · Map pin reveal
 * ------------------------------------------------------------------ */

interface MapPinRevealProps {
  children: ReactNode;
  /** Position within the pin's container. */
  style?: CSSProperties;
  /** 0-based order in the drop sequence. */
  index?: number;
  /** Seconds before the first pin drops. */
  delay?: number;
  /** One soft pulse after landing — reserve for the one or two hero pins. */
  pulse?: boolean;
  className?: string;
}

/**
 * A pin that drops onto the atlas, settles, and (optionally) pulses exactly
 * once.
 *
 * "Once" is the whole point (brief §2): a pin that pulses forever stops
 * meaning "look here" within about four seconds and becomes a distraction the
 * eye has to actively suppress for the rest of the visit.
 */
export function MapPinReveal({
  children,
  style,
  index = 0,
  delay = 0,
  pulse = false,
  className,
}: MapPinRevealProps) {
  const reduced = useReducedMotion();
  const start = delay + index * 0.13;

  if (reduced) {
    return (
      <div style={style} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      style={style}
      className={className}
      initial={{ opacity: 0, scale: 0.4, y: -14 }}
      animate={
        pulse
          ? { opacity: 1, scale: [0.4, 1.14, 1, 1.09, 1], y: 0 }
          : { opacity: 1, scale: [0.4, 1.1, 1], y: 0 }
      }
      transition={{
        duration: pulse ? 1.5 : 0.62,
        ease: EASE,
        delay: start,
        times: pulse ? [0, 0.28, 0.44, 0.78, 1] : [0, 0.62, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 * 10 · Section transition (scroll-linked handoff)
 * ------------------------------------------------------------------ */

/**
 * Returns the 0→1 scroll progress of an element passing through the viewport,
 * spring-smoothed.
 *
 * This is what makes the homepage read as one continuous story rather than a
 * stack of rectangles (brief §2, §10): the hero's selected map pin, the trust
 * section's provider card, and the "how it works" panels are all driven off
 * progress values like this one, so a single scroll gesture carries one object
 * through several states instead of swapping three unrelated ones.
 */
export function useSectionProgress(ref: React.RefObject<HTMLElement>): MotionValue<number> {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  return useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
}

/**
 * A band that settles into place as it enters — the "one continuous surface"
 * feel, applied to a whole section rather than its contents.
 *
 * Very restrained on purpose: 12px and a hair of scale. Enough that the page
 * feels like it has depth, not so much that a fast scroll turns into a slide
 * deck.
 */
export function SectionTransition({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.section
      id={id}
      className={className}
      initial={reduced ? false : { opacity: 0, y: 12, scale: 0.995 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: DUR.reveal, ease: EASE }}
    >
      {children}
    </motion.section>
  );
}

/* ------------------------------------------------------------------ *
 * 11 · Reveal text
 * ------------------------------------------------------------------ */

/**
 * Word-by-word reveal for body copy and pull quotes — `StampHeading` without
 * the gold accent handling, for when the text is a paragraph rather than a
 * headline.
 *
 * Reduced motion renders the string as one plain node, not a pile of spans.
 */
export function RevealText({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <p className={className}>{text}</p>;

  const words = text.trim().split(/\s+/);
  return (
    <motion.p
      className={className}
      variants={stampContainer(delay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {words.map((word, i) => (
        <span key={i}>
          <motion.span variants={stampWord} className="inline-block">
            {word}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </motion.p>
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
