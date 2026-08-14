/**
 * THE SAKRED HEALTH NETWORK — canonical read contract.
 * =====================================================================
 *
 * This file is the *only* description of network data on the website. It is
 * deliberately types-and-helpers, with no database client and no fixtures:
 *
 *   ADMIN
 *        ↓
 *   canonical health network  (health_organizations, health_locations,
 *        ↓                     health_practitioners, health_modalities,
 *   ┌──────────────┐           verification, health_network_submissions)
 *   │              │
 *  APP          WEBSITE  ← reads published rows only, never writes them
 *
 * The website does not own a directory. It does not cache one, seed one, or
 * keep a "temporary" copy of one. It reads published rows from the same
 * database the app reads, so one publication event updates both surfaces.
 *
 * ── Why this file exists separately from the tables ──────────────────
 *
 * At the time the site was rebuilt the canonical tables had not shipped yet;
 * they are being built alongside the app. Rather than invent a placeholder
 * directory (which would have to be deleted later, and which would put
 * fictional practitioners in front of real people in the meantime), the whole
 * site is built against this contract. `api/_lib/health-network.ts` implements
 * it; when the tables are absent or unconfigured, every read returns empty and
 * the pages render their real "we're building the network here" states.
 *
 * So: the site is complete today and truthful today, and lights up the moment
 * the app publishes. Nothing here needs to change for that to happen.
 *
 * ── Field naming ─────────────────────────────────────────────────────
 *
 * Postgres columns are snake_case; everything above the data layer is
 * camelCase. The mapping happens once, in the reader. If a column name below
 * turns out to differ from what the app shipped, change it in the reader's
 * SELECT list — not in this file, and not in the 20 components downstream.
 */

/* ==================================================================== *
 * Verification
 * ==================================================================== */

/**
 * The four public trust states, in ascending order.
 *
 * These are *earned* states, not tiers anyone can buy — see the copy on
 * /for-practitioners, which asks practitioners to "request consideration"
 * rather than to "get verified". A practitioner can submit themselves for
 * review; they cannot self-award a state.
 */
export type VerificationState =
  | "listed"
  | "credential_verified"
  | "sakred_reviewed"
  | "sakred_verified";

export const VERIFICATION_ORDER: VerificationState[] = [
  "listed",
  "credential_verified",
  "sakred_reviewed",
  "sakred_verified",
];

interface VerificationCopy {
  label: string;
  /** One line, public-facing. Deliberately modest — see note below. */
  description: string;
  /** Shown on the homepage trust ladder. */
  detail: string;
}

/**
 * Public verification copy.
 *
 * Every line here is written to be defensible. "Credentials checked" is not
 * "credentials guaranteed"; "reviewed against Sakred's care standards" is not
 * an endorsement of clinical outcomes. Overpromising here is the fastest way
 * to make the badge worthless — and the badge is the product.
 */
export const VERIFICATION_COPY: Record<VerificationState, VerificationCopy> = {
  listed: {
    label: "Listed",
    description: "Basic directory information confirmed.",
    detail:
      "The practice exists, the details are current, and someone at Sakred has confirmed them.",
  },
  credential_verified: {
    label: "Credential Verified",
    description: "Relevant professional credentials checked.",
    detail:
      "We checked the licences and certifications relevant to what they practise against the issuing bodies.",
  },
  sakred_reviewed: {
    label: "Sakred Reviewed",
    description: "Reviewed against Sakred's care standards.",
    detail:
      "Someone from Sakred has looked at how they practise — not just that they may.",
  },
  sakred_verified: {
    label: "Sakred Verified",
    description: "Highest applicable trust state.",
    detail:
      "Credentials, practice review, and ongoing standing. The highest state we apply.",
  },
};

export function verificationRank(state: VerificationState): number {
  return VERIFICATION_ORDER.indexOf(state);
}

/** True when a state is at or above `min` — for the Verification filter. */
export function meetsVerification(
  state: VerificationState,
  min: VerificationState
): boolean {
  return verificationRank(state) >= verificationRank(min);
}

/* ==================================================================== *
 * Modalities
 * ==================================================================== */

export interface Modality {
  id: string;
  /** URL segment: `/discover/traditional-chinese-medicine`. */
  slug: string;
  name: string;
  /** Compact form for chips and card meta rows ("TCM"). */
  shortName?: string | null;
  /** Editorial context shown on the modality page. Never auto-generated. */
  description?: string | null;
  /** Grouping for the filter panel ("Traditional", "Integrative", "Bodywork"). */
  category?: string | null;
  /** Published locations carrying this modality. Drives which pages we index. */
  locationCount?: number;
}

/* ==================================================================== *
 * Hours
 * ==================================================================== */

/** 0 = Sunday … 6 = Saturday, matching `Date#getDay`. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface OpeningPeriod {
  day: Weekday;
  /** 24h "HH:MM" in the location's own timezone. */
  opens: string;
  closes: string;
}

export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/**
 * The location's current local wall-clock time, as `{ day, minutes }`.
 *
 * Timezone matters more than it looks: a visitor in London checking an Austin
 * practice at 2am their time must be told the practice is open, because it is.
 * `Intl` does the conversion without pulling in a date library.
 */
function localNow(timezone: string | null | undefined, now: Date) {
  if (!timezone) {
    return { day: now.getDay() as Weekday, minutes: now.getHours() * 60 + now.getMinutes() };
  }
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);

    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    // Intl renders midnight as "24" in some ICU versions; normalise it.
    const hour = Number(get("hour")) % 24;
    return {
      day: (dayIndex >= 0 ? dayIndex : now.getDay()) as Weekday,
      minutes: hour * 60 + Number(get("minute")),
    };
  } catch {
    return { day: now.getDay() as Weekday, minutes: now.getHours() * 60 + now.getMinutes() };
  }
}

export interface OpenState {
  /** `null` when the location has published no hours — which is not "closed". */
  open: boolean | null;
  /** "Open until 7 PM" · "Closed · opens Tuesday 9 AM" · null when unknown. */
  label: string | null;
}

const fmtTime = (mins: number): string => {
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const suffix = h24 < 12 ? "AM" : "PM";
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
};

/**
 * Resolves a location's open/closed state and the line shown on its card.
 *
 * Returns `open: null` rather than `false` when there are no published hours.
 * A practice with no hours on file is not a closed practice, and showing it as
 * closed would quietly bury it — the card just omits the line instead.
 *
 * Overnight periods (a clinic open 20:00–01:00) are handled by treating a
 * `closes <= opens` period as running into the following day.
 */
export function resolveOpenState(
  hours: OpeningPeriod[] | null | undefined,
  timezone: string | null | undefined,
  now: Date = new Date()
): OpenState {
  if (!hours || hours.length === 0) return { open: null, label: null };

  const { day, minutes } = localNow(timezone, now);
  const yesterday = ((day + 6) % 7) as Weekday;

  for (const p of hours) {
    const opens = toMinutes(p.opens);
    const closes = toMinutes(p.closes);
    const overnight = closes <= opens;

    if (p.day === day && minutes >= opens && (overnight || minutes < closes)) {
      return { open: true, label: `Open until ${fmtTime(closes)}` };
    }
    // An overnight period started yesterday and is still running this morning.
    if (overnight && p.day === yesterday && minutes < closes) {
      return { open: true, label: `Open until ${fmtTime(closes)}` };
    }
  }

  // Closed now — find the next opening, searching forward up to a full week.
  for (let ahead = 0; ahead < 8; ahead++) {
    const probe = ((day + ahead) % 7) as Weekday;
    const candidates = hours
      .filter((p) => p.day === probe && (ahead > 0 || toMinutes(p.opens) > minutes))
      .sort((a, b) => toMinutes(a.opens) - toMinutes(b.opens));

    const next = candidates[0];
    if (!next) continue;

    const when =
      ahead === 0 ? "today" : ahead === 1 ? "tomorrow" : WEEKDAY_NAMES[probe];
    return { open: false, label: `Closed · opens ${when} ${fmtTime(toMinutes(next.opens))}` };
  }

  return { open: false, label: "Closed" };
}

/* ==================================================================== *
 * Photos
 * ==================================================================== */

export interface NetworkPhoto {
  url: string;
  /** Required. A photo with no alt text is a photo we cannot publish. */
  alt: string;
  width?: number | null;
  height?: number | null;
  /** Attribution line, when the licence requires one. */
  credit?: string | null;
}

/* ==================================================================== *
 * Practitioners
 * ==================================================================== */

export interface PractitionerSummary {
  id: string;
  slug: string;
  name: string;
  /** Post-nominals as the practitioner presents them: "L.Ac., DAOM". */
  credentials?: string | null;
  /** One line: "Sports recovery and orthopaedic acupuncture". */
  headline?: string | null;
  photo?: NetworkPhoto | null;
  modalities: Modality[];
  verification: VerificationState;
}

export interface HealthPractitioner extends PractitionerSummary {
  /** See the note on `HealthLocation.canonicalSlug`. */
  canonicalSlug?: string;
  redirect?: boolean;
  /** Long-form professional biography, plain text paragraphs. */
  bio?: string | null;
  /** Editorial, written by Sakred. Rendered only when non-empty — see below. */
  sakredNote?: string | null;
  yearsPracticing?: number | null;
  languages?: string[];
  locations: LocationSummary[];
  verifiedAt?: string | null;
}

/* ==================================================================== *
 * Locations
 * ==================================================================== */

export interface LocationSummary {
  id: string;
  slug: string;
  name: string;
  organizationName?: string | null;
  city: string;
  /** Two-letter state / province code where applicable. */
  region: string;
  lat: number;
  lng: number;
  modalities: Modality[];
  verification: VerificationState;
  photo?: NetworkPhoto | null;
  hours?: OpeningPeriod[] | null;
  timezone?: string | null;
  /** Metres from the search origin. Present only on proximity searches. */
  distanceMeters?: number | null;
  acceptsWalkIns?: boolean;
  offersSameDay?: boolean;
}

/** An outbound link from `health_links` — social, directory, registry. */
export interface NetworkLink {
  type: string;
  label?: string | null;
  url: string;
}

export interface HealthLocation extends LocationSummary {
  organizationId?: string | null;
  organizationSlug?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  postalCode?: string | null;
  country?: string | null;
  phone?: string | null;
  website?: string | null;
  bookingUrl?: string | null;
  /** Practice-authored description of the practice. */
  about?: string | null;
  /**
   * Curated editorial from the canonical record — `good_for`, `cautions` and
   * `what_they_do_well`. Written by a person at Sakred, same standing as
   * `sakredNote`: rendered only when present, never synthesised.
   */
  goodFor?: string | null;
  cautions?: string | null;
  whatTheyDoWell?: string | null;
  /** The app's own answer, from `health_location_is_open_now`. */
  isOpenNow?: boolean | null;
  links?: NetworkLink[];
  /**
   * Where this record actually lives, per the network's slug history.
   *
   * `redirect` is true when the URL that was requested is a retired alias — a
   * practice that has been renamed. The page then replaces the URL with
   * `canonicalSlug` rather than serving the same content under two addresses,
   * which is how a rename costs a practice its search ranking.
   */
  canonicalSlug?: string;
  redirect?: boolean;
  /**
   * "Why Sakred recommends them" — editorial, written by a person.
   *
   * Rendered only when this is a non-empty string. The section is never
   * synthesised from other fields and never templated: a made-up reason for
   * recommending a real clinic is worse than no reason at all.
   */
  sakredNote?: string | null;
  photos: NetworkPhoto[];
  practitioners: PractitionerSummary[];
  verifiedAt?: string | null;
  /** Count of community threads referencing this location, if any. */
  discussionCount?: number;
}

/* ==================================================================== *
 * Organizations
 * ==================================================================== */

export interface HealthOrganization {
  id: string;
  slug: string;
  name: string;
  about?: string | null;
  website?: string | null;
  logo?: NetworkPhoto | null;
  verification: VerificationState;
  locations: LocationSummary[];
}

/* ==================================================================== *
 * Search
 * ==================================================================== */

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface NetworkSearchParams {
  /** Free text across practice name, practitioner name, modality and city. */
  q?: string;
  /** Modality slugs; a location matches if it carries any of them. */
  modalities?: string[];
  /** Viewport search — mutually exclusive with lat/lng + radius. */
  bounds?: MapBounds;
  lat?: number;
  lng?: number;
  /** Metres. */
  radius?: number;
  /**
   * The city segment of `/discover/:modality/:city`.
   *
   * The search function has no city argument, so this is sent as its text
   * query — verified to scope correctly ("naples" returns exactly the Naples
   * practices). `q` wins when both are present: the function takes one text
   * argument and matches it as a single substring, so "acupuncture naples"
   * matches nothing at all.
   */
  city?: string;
  openNow?: boolean;
  sameDay?: boolean;
  walkIns?: boolean;
  minVerification?: VerificationState;
  /** Rows to return. The function clamps its own limit to 1..500. */
  limit?: number;
}

export interface NetworkSearchResult {
  locations: LocationSummary[];
  /** Total matching the filters, ignoring limit/offset. */
  total: number;
  /**
   * False when the network is not configured or the canonical tables are not
   * reachable — as opposed to "configured, reachable, zero matches here".
   *
   * The UI needs to tell these apart: one says "we're building the network in
   * your area", the other is an outage and must not claim anything about
   * coverage.
   */
  available: boolean;
}

export const EMPTY_SEARCH: NetworkSearchResult = {
  locations: [],
  total: 0,
  available: false,
};

/* ==================================================================== *
 * Submissions (the /recommend pipeline)
 * ==================================================================== */

export type SubmissionKind = "practitioner" | "location";

/**
 * A public recommendation. Writes to `health_network_submissions` — the same
 * table the app submits to. There is no website-specific submissions store.
 *
 * A submission is a *lead for review*, never a listing. Nothing here reaches
 * the public directory without passing through admin.
 */
export interface NetworkSubmissionInput {
  kind: SubmissionKind;
  name: string;
  city?: string;
  link?: string;
  modality?: string;
  reason?: string;
  submitterEmail?: string;
  /** Set when a signed-in member submits from the app or a member session. */
  memberId?: string | null;
  /** "website" · "website:location-page" · "app" … */
  source: string;
}

/* ==================================================================== *
 * Presentation helpers
 * ==================================================================== */

/** "1.4 mi" · "600 ft". Imperial: the network is US-first today. */
export function formatDistance(meters: number | null | undefined): string | null {
  if (meters == null || !Number.isFinite(meters)) return null;
  const miles = meters / 1609.344;
  if (miles < 0.19) return `${Math.max(50, Math.round((meters * 3.28084) / 50) * 50)} ft`;
  return `${miles < 10 ? miles.toFixed(1) : Math.round(miles)} mi`;
}

/** A modality list for full pages: "TCM · Acupuncture · Massage". */
export function modalityLine(modalities: Modality[], max = 3): string {
  return modalities
    .slice(0, max)
    .map((m) => m.shortName || m.name)
    .join(" · ");
}

/**
 * The compact card summary: "Acupuncture · Functional Medicine +2".
 *
 * Deliberately summarises rather than rendering a long string and letting CSS
 * cut it. "Acupuncture · Traditional Chinese Medicine · Chinese Herbal Medi…"
 * tells a reader less than naming two and counting the rest, and a mid-word
 * ellipsis reads like a bug rather than an editorial decision.
 *
 * Order is the source's own — the network returns modalities in its canonical
 * order and we do not reorder by name length, alphabet, or anything else. The
 * first two are the first two the network listed.
 *
 * Full location and practitioner pages still show the complete set; this is
 * card presentation only.
 *
 * NOTE: the canonical schema has no short-name column, so `shortName` is always
 * null today and the full name is used. Adding `short_name` to
 * `health_modalities` would let this read "Acupuncture · TCM +2" — requested in
 * docs/health-network-app-contract.md.
 */
export function modalitySummary(modalities: Modality[], max = 2): string {
  if (!modalities.length) return "";
  const shown = modalities.slice(0, max).map((m) => m.shortName || m.name);
  const remaining = modalities.length - shown.length;
  return remaining > 0 ? `${shown.join(" · ")} +${remaining}` : shown.join(" · ");
}

/** "Miami, Florida" for headers; region codes stay short on cards. */
export function locationPlace(city: string, region: string): string {
  return region ? `${city}, ${region}` : city;
}

export const locationPath = (slug: string) => `/locations/${slug}`;
export const practitionerPath = (slug: string) => `/practitioners/${slug}`;
export const modalityPath = (slug: string, city?: string) =>
  city ? `/discover/${slug}/${city}` : `/discover/${slug}`;

/** A slug we are willing to put in a URL: lowercase, hyphenated, no surprises. */
export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ==================================================================== *
 * Slugs \u2014 INTERIM
 * ==================================================================== *
 *
 * `health_organizations` has a `slug` column. `health_locations` and
 * `health_practitioners` do not, so until the app team adds them (an additive
 * migration, tracked in docs/health-network-app-contract.md) the website
 * derives one.
 *
 * The derivation deliberately reproduces the convention the org slugs already
 * follow \u2014 `shin-wellness-miami`, `eastern-medicine-center-scottsdale` \u2014 so
 * that when the canonical column lands, the values match and no indexed URL
 * moves. The reader prefers a real `slug` the moment one exists.
 *
 * This is interim, and it is the weaker option: a practice that renames itself
 * silently changes its own URL, which is not a decision a website should be
 * making on a directory's behalf.
 */

/**
 * `name` plus `city`, unless the name already carries the city.
 *
 * Without the second half you get `eastern-medicine-center-scottsdale-scottsdale`,
 * which is the kind of URL that makes a site look automatically generated \u2014
 * which, here, it would be.
 */
export function deriveLocationSlug(name: string, city?: string | null): string {
  const base = toSlug(name);
  const suffix = city ? toSlug(city) : "";
  if (!suffix || base.includes(suffix)) return base;
  return `${base}-${suffix}`;
}

/** Practitioners are addressed by display name; it already carries post-nominals. */
export const derivePractitionerSlug = (displayName: string): string => toSlug(displayName);
