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

// Spares already in the bucket (swap in anytime, e.g. on product pages):
//   04_45_52%20PM%20(1) — parents helping daughter with homework in the living room
//   04_45_52%20PM%20(3) — mom reviewing paperwork at the kitchen table with her son
//   04_45_52%20PM%20(4) — older couple reading a plan document together at home
//   04_45_53%20PM%20(9) — adult daughter laughing over tea with her elderly mother
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
      "04_45_53%20PM%20(8)",
      "A father kneeling to tie his daughter's shoe by the front door before school",
    ),
    img(
      "04_45_53%20PM%20(6)",
      "An older couple laughing together on the front steps of their home",
    ),
  ] as SiteImage[],
} satisfies Record<string, SiteImage | SiteImage[]>;

export const hasImage = (img: SiteImage | undefined): boolean => !!img?.src;
