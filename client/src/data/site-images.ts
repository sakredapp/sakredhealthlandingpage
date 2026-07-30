/**
 * Photography used across the marketing pages.
 *
 * Drop image URLs here to warm up the site — sections that use an image simply
 * don't render the photo (and stay looking finished) while its URL is empty, so
 * this file is safe to ship half-filled.
 *
 * Host them the same way as the app screenshots: upload to the public Supabase
 * bucket and paste the public URL. Use real licensed photography only — either
 * client photos you own or stock you've licensed. Please don't paste hotlinked
 * images from a search engine; that's a copyright exposure for a real agency.
 *
 * Recommended: warm, natural-light, candid family/lifestyle shots — a family at
 * a kitchen table, parents with kids on a porch, an older couple walking. Avoid
 * stiff studio "insurance stock." Landscape ~1600x1100 for bands, ~1200x1500
 * portrait for the about page.
 */
export interface SiteImage {
  src: string;
  /** Describe who/what is pictured — required for accessibility and SEO. */
  alt: string;
}

// Public Supabase bucket holding the landing-page family photography.
// Filenames carry per-file timestamps, so each entry keeps its full suffix.
const BUCKET =
  "https://dupymdjsuvirkwadanjt.supabase.co/storage/v1/object/public/landingpagefamilyimages";
const img = (suffix: string, alt: string): SiteImage => ({
  src: `${BUCKET}/ChatGPT%20Image%20Jul%2029,%202026,%20${suffix}.png`,
  alt,
});

// Second set lives in the bucket's secondset/ folder.
const img2 = (suffix: string, alt: string): SiteImage => ({
  src: `${BUCKET}/secondset/ChatGPT%20Image%20Jul%2029,%202026,%20${suffix}.png`,
  alt,
});

// NOTE: the other five images in the bucket ROOT (1, 3, 4, 8, 9) are reserved
// for a different site — do not wire them into this one.
export const SITE_IMAGES = {
  /** Wide band on the home page, between the products and the calculator. */
  homeFamilyBand: img(
    "04_45_52%20PM%20(2)",
    "Three generations of a family sharing dinner on the back patio of their home at golden hour",
  ),
  /** Portrait beside the About page story. */
  aboutStory: img(
    "04_45_52%20PM%20(5)",
    "A mother holding her baby in the kitchen while packing a lunchbox with fresh fruit and vegetables",
  ),
  /** Three small supporting shots on the About page (holistic wellness). */
  aboutGrid: [
    img(
      "04_45_54%20PM%20(10)",
      "A mother chopping fresh vegetables for dinner while her two kids help in the kitchen",
    ),
    img(
      "04_45_53%20PM%20(7)",
      "A family stretching together on the living room floor, a mother guiding her young daughter",
    ),
    img(
      "04_45_53%20PM%20(6)",
      "An older couple laughing together on the front steps of their home",
    ),
  ] as SiteImage[],

  /** Beside the Who We Help accordion on the home page. */
  whoWeHelp: img2(
    "05_16_32%20PM%20(7)",
    "Parents stretching on the living room floor while their toddler plays between them",
  ),
  /** Beside the how-it-works step walker (home + state pages). */
  howItWorks: img2(
    "05_16_32%20PM%20(8)",
    "A father kneeling to tie his daughter's shoe at the front door as she heads to school",
  ),
  /** Small overlapping photo on the home family band. */
  familyBandOverlay: img2(
    "05_16_33%20PM%20(10)",
    "Kids helping their mother cook dinner in the family kitchen",
  ),
} satisfies Record<string, SiteImage | SiteImage[]>;

/** Photo shown on a product detail page, keyed by product slug. */
export const PRODUCT_PAGE_IMAGES: Record<string, SiteImage> = {
  "life-insurance": img2(
    "05_16_32%20PM%20(6)",
    "A mother and teenage daughter talking on the front steps of their home after a morning workout",
  ),
  "final-expense": img2(
    "05_16_33%20PM%20(9)",
    "An adult daughter sharing tea and a long conversation with her elderly mother at home",
  ),
};

export const hasImage = (img: SiteImage | undefined): boolean => !!img?.src;
