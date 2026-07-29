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

const EMPTY: SiteImage = { src: "", alt: "" };

export const SITE_IMAGES = {
  /** Wide band on the home page, between the products and the calculator. */
  homeFamilyBand: EMPTY,
  /** Portrait beside the About page story. */
  aboutStory: EMPTY,
  /** Three small supporting shots on the About page (holistic wellness). */
  aboutGrid: [EMPTY, EMPTY, EMPTY] as SiteImage[],
} satisfies Record<string, SiteImage | SiteImage[]>;

export const hasImage = (img: SiteImage | undefined): boolean => !!img?.src;
