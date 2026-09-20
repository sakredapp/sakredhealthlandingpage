/**
 * The one way a photo appears on this site.
 *
 * Implements the fallback chain from the image registry: a supplied photo, and
 * — when there isn't one, or when the one there is fails to load — a designed
 * warm-material panel rather than a broken icon or a grey box. That is what
 * lets `health-images.ts` ship half-filled without the page looking unfinished
 * (brief §25).
 *
 * Also the single place that gets lazy-loading, async decoding, and the hover
 * crop right, so no call site has to remember them.
 */
import { useState } from "react";
import type { EditorialPhoto } from "@/data/health-images";
import type { Modality } from "@shared/health-network";
import { ProviderFallback } from "./ProviderFallback";

interface EditorialImageProps {
  photo: EditorialPhoto | undefined;
  /** Aspect + rounding + any positioning. The image fills this box. */
  className?: string;
  /** Above-the-fold images skip lazy-loading, which would delay LCP. */
  eager?: boolean;
  sizes?: string;
  /** Adds the shared hover crop. Off for images that aren't inside a link. */
  interactive?: boolean;
  /** Overrides the fallback's material. Defaults to the parchment plane. */
  fallbackTone?: "parchment" | "stone" | "cafe";
}

const TONES = {
  parchment: "from-sakred-parchment via-sakred-surface-alt to-sakred-stone",
  stone: "from-sakred-stone via-sakred-limestone to-sakred-latte",
  cafe: "from-sakred-cafe via-[#3B3128] to-sakred-espresso",
} as const;

/**
 * The designed stand-in.
 *
 * A warm gradient plus a few gold contour arcs — the same atlas language as
 * the map, so an empty photo slot reads as part of the system instead of as a
 * hole in it.
 */
function DesignedFallback({ tone }: { tone: keyof typeof TONES }) {
  return (
    <div
      className={`absolute inset-0 bg-gradient-to-br ${TONES[tone]}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full opacity-[0.5]"
        role="presentation"
      >
        <g
          fill="none"
          stroke={tone === "cafe" ? "#C5A059" : "#A8842F"}
          strokeOpacity="0.3"
          strokeWidth="1"
        >
          <path d="M-20 210c70-40 128 14 196-16s130-60 244-32" />
          <path d="M-20 238c74-40 132 14 200-16s134-58 240-30" />
          <path d="M-20 266c78-40 136 14 204-16s138-56 236-28" />
          <path d="M-20 96c58 28 112-18 176-4s108 46 244 22" />
        </g>
        <circle
          cx="300"
          cy="88"
          r="26"
          fill="none"
          stroke={tone === "cafe" ? "#C5A059" : "#A8842F"}
          strokeOpacity="0.24"
        />
      </svg>
    </div>
  );
}

export function EditorialImage({
  photo,
  className,
  eager = false,
  sizes,
  interactive = false,
  fallbackTone = "parchment",
}: EditorialImageProps) {
  /**
   * A remote photo that 404s must degrade to the designed panel, not to the
   * browser's broken-image glyph. `errored` is what makes step 2 of the chain
   * fall through to step 3 at runtime rather than only at authoring time.
   */
  const [errored, setErrored] = useState(false);
  const usable = Boolean(photo?.src) && !errored;

  return (
    <div
      className={`relative overflow-hidden bg-sakred-surface-alt ${
        interactive ? "crop-shift" : ""
      } ${className ?? ""}`}
    >
      {usable ? (
        <>
          {/**
           * Bundled assets get a full `<picture>`: AVIF first, then WebP, then
           * the JPEG the `<img>` already points at. Each source carries a
           * srcset at 800/1600 so a phone doesn't download a desktop-width
           * frame. Remote photos (the two legacy entries) render as a plain
           * `<img>` — they have no derivatives to offer.
           */}
          <picture>
            {photo!.bundle && (
              <>
                <source
                  type="image/avif"
                  sizes={sizes}
                  srcSet={`/img/${photo!.bundle}-800.avif 800w, /img/${photo!.bundle}-1600.avif 1600w`}
                />
                <source
                  type="image/webp"
                  sizes={sizes}
                  srcSet={`/img/${photo!.bundle}-800.webp 800w, /img/${photo!.bundle}-1600.webp 1600w`}
                />
              </>
            )}
            <img
              src={photo!.src}
              srcSet={
                photo!.bundle
                  ? `/img/${photo!.bundle}-800.jpg 800w, /img/${photo!.bundle}-1600.jpg 1600w`
                  : undefined
              }
              alt={photo!.alt}
              sizes={sizes}
              loading={eager ? "eager" : "lazy"}
              decoding="async"
              /* Falls through to the designed panel if the file 404s — step 2
                 of the chain degrading to step 3 at runtime, not just at
                 authoring time. */
              onError={() => setErrored(true)}
              className="h-full w-full object-cover"
            />
          </picture>
          {photo!.credit && (
            <span className="pointer-events-none absolute bottom-1.5 right-2 text-[10px] text-white/70 mix-blend-luminosity">
              {photo!.credit}
            </span>
          )}
        </>
      ) : (
        <DesignedFallback tone={fallbackTone} />
      )}
    </div>
  );
}

/**
 * The network's own photography — practice and practitioner photos coming from
 * the canonical `primary_image_url` / `photo_url` rather than from the site
 * registry.
 *
 * Kept separate from `EditorialImage` so it is obvious in a component which
 * images are Sakred's editorial choices and which belong to the practice.
 *
 * ── When there is no photo ───────────────────────────────────────────
 *
 * Falls back to `ProviderFallback`, which picks a material panel from the
 * provider's canonical modality category. Every live provider is currently in
 * this state, so this path is the directory's actual appearance, not an edge
 * case — and one identical panel repeated fourteen times made a curated network
 * look like an unfinished grid.
 *
 * It is never a photograph and never implies one. Real approved media replaces
 * it automatically.
 */
export function NetworkImage({
  photo,
  subject,
  id,
  modalities,
  className,
  eager = false,
  sizes,
  interactive = false,
}: {
  photo: { url: string; alt: string } | null | undefined;
  /** Used as alt text if the record shipped without any. */
  subject: string;
  /** Canonical record id — makes the fallback choice stable across renders. */
  id: string;
  /** Canonical modalities; their `category` selects the visual family. */
  modalities?: Pick<Modality, "slug" | "category">[];
  className?: string;
  eager?: boolean;
  sizes?: string;
  interactive?: boolean;
}) {
  const [errored, setErrored] = useState(false);
  const usable = Boolean(photo?.url) && !errored;

  return (
    <div
      className={`relative overflow-hidden bg-sakred-surface-alt ${
        interactive ? "crop-shift" : ""
      } ${className ?? ""}`}
    >
      {usable ? (
        <img
          src={photo!.url}
          alt={photo!.alt || subject}
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <ProviderFallback id={id} modalities={modalities} />
      )}
    </div>
  );
}
