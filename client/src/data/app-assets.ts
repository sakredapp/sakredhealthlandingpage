/**
 * The app's own screenshots and store links.
 *
 * One source for the /app page, the homepage download band and the download
 * dialog, so a screenshot swap doesn't have to be made in three places (and
 * therefore get made in two).
 *
 * Screens are hosted in the public `appdemoscreenshots` bucket. Adding or
 * replacing one means editing the URL here, nothing else.
 */
const BUCKET = "https://auth.sakredhealth.com/storage/v1/object/public/appdemoscreenshots";

export const APP_STORE_URL = "https://apps.apple.com/us/app/sakred-health/id6756814847";
export const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.sakredunion.app";

export interface AppScreen {
  image: string;
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
    image: `${BUCKET}/homescreen%20.jpeg`,
    label: "Home",
    alt: "The Sakred Health app home screen showing the day's overview",
  },
  {
    image: `${BUCKET}/todays%20habits.jpeg`,
    label: "Today",
    alt: "Today's plan in the Sakred Health app, listing the day's practices",
  },
  {
    image: `${BUCKET}/routine%20outline%20.jpeg`,
    label: "Protocols",
    alt: "A multi-day protocol laid out day by day in the Sakred Health app",
  },
  {
    image: `${BUCKET}/routine%20and%20habit%20tracker%20.jpeg`,
    label: "Tracking",
    alt: "Progress through a protocol shown across the week",
  },
  {
    image: `${BUCKET}/library%20overview%20.jpeg`,
    label: "Library & Community",
    alt: "The library and community section of the Sakred Health app",
  },
  {
    image: `${BUCKET}/real%20foods%20market%20.jpeg`,
    label: "Real Foods Market",
    alt: "The Real Foods Market inside the Sakred Health app",
  },
  {
    image: `${BUCKET}/policy%20portal%20.jpeg`,
    label: "Policies",
    alt: "The policy portal showing coverage details and documents",
  },
];

/** Generated at build-time from /app — see the note in scripts/. */
export const APP_QR_SRC = "/app-qr.svg";
