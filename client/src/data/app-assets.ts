/**
 * The app's own screenshots and store links.
 *
 * One source for the /app page, the homepage download band and the download
 * dialog, so a screenshot swap doesn't have to be made in three places (and
 * therefore get made in two).
 *
 * The originals live in the public `appdemoscreenshots` bucket at 1320px wide
 * (2.1 MB for the set). The site serves resized AVIF/WebP/JPEG copies from
 * `client/public/img/app/` made by `scripts/fetch-app-screens.mjs`: the largest
 * slot is 272 CSS px, and the full-size JPEGs held /app's main content back
 * 13-16 s on a phone. Replacing a screen: swap it in the bucket, re-run the
 * script, and update `name`/`height` here.
 */
const IMG = "/img/app";

/** Widths the script emits. */
export const APP_SCREEN_WIDTHS = [320, 640] as const;

export const APP_STORE_URL = "https://apps.apple.com/us/app/sakred-health/id6756814847";
export const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.sakredunion.app";

export interface AppScreen {
  /** File stem in /img/app — `<name>-<width>.<avif|webp|jpg>`. */
  name: string;
  /** Plain JPEG at 640w, for anything that can't take a <picture>. */
  image: string;
  /** Intrinsic size at 320w, so the frame reserves its space before load. */
  width: number;
  height: number;
  label: string;
  /** What the screen shows — used as alt text, so it must describe, not label. */
  alt: string;
}

/**
 * Ordered to match the app's own pillars (discover → protocols → community →
 * resources → policies), not to match how the old marketing page argued for
 * detox protocols.
 */
export const APP_SCREENS: AppScreen[] = [
  {
    name: "home",
    image: `${IMG}/home-640.jpg`,
    width: 320,
    height: 655,
    label: "Home",
    alt: "The Sakred Health app home screen showing the day's overview",
  },
  {
    name: "today",
    image: `${IMG}/today-640.jpg`,
    width: 320,
    height: 674,
    label: "Today",
    alt: "Today's plan in the Sakred Health app, listing the day's practices",
  },
  {
    name: "protocols",
    image: `${IMG}/protocols-640.jpg`,
    width: 320,
    height: 695,
    label: "Protocols",
    alt: "A multi-day protocol laid out day by day in the Sakred Health app",
  },
  {
    name: "tracking",
    image: `${IMG}/tracking-640.jpg`,
    width: 320,
    height: 656,
    label: "Tracking",
    alt: "Progress through a protocol shown across the week",
  },
  {
    name: "library",
    image: `${IMG}/library-640.jpg`,
    width: 320,
    height: 658,
    label: "Library & Community",
    alt: "The library and community section of the Sakred Health app",
  },
  {
    name: "market",
    image: `${IMG}/market-640.jpg`,
    width: 320,
    height: 659,
    label: "Real Foods Market",
    alt: "The Real Foods Market inside the Sakred Health app",
  },
  {
    name: "policies",
    image: `${IMG}/policies-640.jpg`,
    width: 320,
    height: 610,
    label: "Policies",
    alt: "The policy portal showing coverage details and documents",
  },
];

/** Generated at build-time from /app — see the note in scripts/. */
export const APP_QR_SRC = "/app-qr.svg";
