/**
 * Cartographic marginalia — the small details that keep the atlas metaphor
 * alive between the big set pieces.
 *
 * Used sparingly and on purpose. The point of these is that you notice them on
 * the second or third visit, not the first: a section wallpapered in decoration
 * has no negative space left, and negative space is most of what makes the
 * daylight palette work.
 *
 * Everything here is `aria-hidden`, non-interactive, and stops moving under
 * `prefers-reduced-motion`.
 */
import { motion, useReducedMotion } from "framer-motion";

/**
 * A run of surveyor's tick marks with a coordinate label.
 *
 * Reads as the edge of a printed map sheet. Deliberately not real coordinates —
 * a real lat/long would be a claim about a place, and this is scenery.
 */
export function AtlasTicks({
  className,
  label,
  vertical = false,
  count = 7,
}: {
  className?: string;
  /** Short string, e.g. "N 41°". Optional. */
  label?: string;
  vertical?: boolean;
  count?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none ${
        vertical ? "flex flex-col items-start gap-2" : "flex items-end gap-2"
      } ${className ?? ""}`}
    >
      <div className={vertical ? "flex flex-col gap-1.5" : "flex items-end gap-1.5"}>
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className="block bg-sakred-espresso/20"
            style={
              vertical
                ? { width: i % 3 === 0 ? 9 : 5, height: 1 }
                : { height: i % 3 === 0 ? 9 : 5, width: 1 }
            }
          />
        ))}
      </div>
      {label && (
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-sakred-espresso/25">
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * A pair of thin gold contour arcs.
 *
 * Drifts very slowly — 24s for a ~10px excursion, which is slow enough to read
 * as "the page is breathing" rather than as something moving.
 */
export function AtlasContours({
  className,
  drift = true,
}: {
  className?: string;
  drift?: boolean;
}) {
  const reduced = useReducedMotion();

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 600 200"
      preserveAspectRatio="none"
      className={`pointer-events-none select-none ${className ?? ""}`}
    >
      <motion.g
        fill="none"
        stroke="#C5A059"
        strokeOpacity="0.22"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        animate={reduced || !drift ? undefined : { x: [0, -9, 0], y: [0, 5, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M-20 120c90-42 160 18 248-8s136-74 232-50 148 14 168-6" />
        <path d="M-20 148c94-40 164 18 252-8s140-70 228-46 146 12 166-8" />
        <path d="M-20 176c98-38 168 18 256-8s144-66 224-42 144 10 164-10" />
      </motion.g>
    </svg>
  );
}

/**
 * A single drifting map-coordinate mark: a hairline crosshair with a gold dot.
 *
 * One per section at most. It's a full stop, not a texture.
 */
export function AtlasCrosshair({ className }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 40 40"
      className={`pointer-events-none select-none ${className ?? ""}`}
      animate={reduced ? undefined : { y: [0, -6, 0] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
    >
      <g stroke="#1C1A17" strokeOpacity="0.14" strokeWidth="1">
        <line x1="20" y1="4" x2="20" y2="15" />
        <line x1="20" y1="25" x2="20" y2="36" />
        <line x1="4" y1="20" x2="15" y2="20" />
        <line x1="25" y1="20" x2="36" y2="20" />
      </g>
      <circle cx="20" cy="20" r="2.5" fill="#C5A059" fillOpacity="0.5" />
      <circle cx="20" cy="20" r="7" fill="none" stroke="#C5A059" strokeOpacity="0.25" />
    </motion.svg>
  );
}
