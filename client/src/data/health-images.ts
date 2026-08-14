/**
 * Editorial photography for the Sakred Health network pages.
 *
 * ── The three-step chain (brief §25) ─────────────────────────────────
 *
 *   1. owned / curated   a photo Sakred shot or licensed, in the bucket
 *   2. controlled remote a specific, chosen URL — never a random-image API
 *   3. designed fallback the atlas / material treatment in EditorialImage
 *
 * Every slot below is allowed to be empty. `EditorialImage` renders a designed
 * warm-material panel in place of a missing photo, so a half-filled registry
 * looks deliberate rather than broken — the same convention `site-images.ts`
 * already uses for the insurance photography.
 *
 * ── Filling these in ─────────────────────────────────────────────────
 *
 * Upload to the public Supabase bucket (same as the app screenshots) and paste
 * the URL. Use licensed photography only: Sakred's own shoots, practice photos
 * you have written permission to use, or properly licensed stock.
 *
 * What these pages want (and what to avoid) is spelled out per slot. As a
 * rule: real rooms, real materials, real hands. No doctors with folded arms,
 * no stethoscopes, no staged hospital smiles, no generic green leaves.
 *
 * NOTE ON ALT TEXT: every slot carries its alt text here, not at the call
 * site, so a photo cannot be swapped in later without someone writing a
 * description of what is actually in it.
 */
export interface EditorialPhoto {
  /** Empty string = not yet supplied. The component falls back by design. */
  src: string;
  /** Describes what is pictured. Required whenever `src` is set. */
  alt: string;
  /** Attribution line, when the licence requires one. */
  credit?: string;
  /**
   * Basename of a locally bundled asset in `client/public/img/`, without width
   * or extension — e.g. "protocol-tea" resolves to protocol-tea-{800,1600}.
   * {avif,webp,jpg}.
   *
   * When set, `EditorialImage` renders a `<picture>` with AVIF/WebP sources
   * and a srcset, and `src` is only the JPEG fallback. Bundled beats remote for
   * anything on the critical path: no third-party DNS, no third-party seeing
   * the visitor, and an asset that cannot change underneath us.
   */
  bundle?: string;
}

const photo = (src: string, alt: string, credit?: string): EditorialPhoto => ({
  src,
  alt,
  credit,
});

/**
 * A photo bundled by `scripts/fetch-editorial-images.mjs`.
 *
 * Provenance for all of these lives in `client/public/img/CREDITS.json`.
 */
const bundled = (name: string, alt: string, credit: string): EditorialPhoto => ({
  bundle: name,
  src: `/img/${name}-1600.jpg`,
  alt,
  credit,
});

/** Licensed Unsplash photography already in use elsewhere on the site. */
const unsplash = (id: string, w: number) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const HEALTH_IMAGES = {
  /**
   * Homepage trust section — the large featured practice visual sitting beside
   * the verification ladder.
   *
   * Wants: a real treatment room, lit by a window. Wood, linen, plants, a
   * folded towel. Nobody in frame, or one practitioner mid-preparation.
   */
  trustPractice: bundled(
    "treatment-acupuncture",
    "A practitioner placing an acupuncture needle in a patient's hand during a treatment",
    "Antonika Chanel"
  ),

  /**
   * "How Sakred works", step 02 — Choose.
   *
   * Wants: a practitioner in their own space, working. Hands and materials,
   * not a portrait to camera.
   */
  howChoose: photo(
    unsplash("photo-1544161515-4ab6ce6db874", 1400),
    "A practitioner applying oil during a bodywork treatment in a bright, calm treatment room"
  ),

  /**
   * Protocols band — the between-visits section.
   *
   * Wants: the quiet domestic end of care. A cup of herbal tea on a wooden
   * counter, a rolled mat by a window, morning light.
   */
  protocols: bundled(
    "protocol-tea",
    "Three cups of herbal tea arranged on a weathered wooden table, seen from above",
    "Sixteen Miles Out"
  ),

  /**
   * Community band backdrop.
   *
   * DELIBERATELY EMPTY. Every free candidate for "people talking" was either an
   * Unsplash+ (paid-licence) asset or a posed stock scene, and a stock person
   * placed next to community copy reads as a Sakred member who never existed.
   * The designed fallback carries the band until there is a real photograph of
   * real people at a real Sakred event.
   */
  community: photo("", ""),

  /**
   * Resources — Library.
   *
   * Wants: parchment and paper. Stacked books on a warm surface, an open page,
   * a reading lamp. Botanical illustration is welcome here.
   */
  library: bundled(
    "library-botanical-book",
    "An old botanical reference book lying open on a wooden table at a plate of pressed-flower illustrations",
    "Annie Spratt"
  ),

  /**
   * Resources — Real Foods Market. Sits on the deep café plane, so the photo
   * should be dark and rich rather than bright.
   */
  market: photo(
    unsplash("photo-1596591606975-97ee5cef3a1e", 1400),
    "Fresh blackberries, raspberries and blueberries filling the frame"
  ),

  /**
   * Resources — Food Chart. Sits on the clean atlas plane.
   *
   * Wants: an overhead flat-lay of whole ingredients on a pale surface, or
   * nothing at all — the chart itself is the visual.
   */
  foodChart: photo("", ""),

  /**
   * Coverage band on the homepage, and the /products hero.
   *
   * Wants: architecture and home. A porch, a kitchen at golden hour, a family
   * in their own environment. Not a house-shaped icon, not a handshake.
   */
  coverage: bundled(
    "coverage-home-porch",
    "A craftsman bungalow with a deep covered front porch, brick pillars and planted borders",
    "Roger Starnes Sr"
  ),

  /**
   * /for-practitioners hero.
   *
   * Wants: a practice interior with the practitioner's own tools in it —
   * an apothecary wall, a needle tray, a treatment table being made up.
   */
  practitioners: bundled(
    "apothecary-mortar",
    "A stone mortar and pestle holding dried petals and botanicals, photographed from above",
    "Katherine Hanlon"
  ),

  /**
   * Download band near the footer. Optional: the band is built from the
   * app screenshots and the warm-stone plane, and reads fine with no photo.
   */
  appBand: photo("", ""),
} satisfies Record<string, EditorialPhoto>;

export type HealthImageSlot = keyof typeof HEALTH_IMAGES;

export const hasPhoto = (photo: EditorialPhoto | undefined): boolean =>
  Boolean(photo?.src);
