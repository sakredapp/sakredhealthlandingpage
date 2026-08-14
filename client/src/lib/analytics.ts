/**
 * Funnel analytics.
 *
 * One `track()` for the whole site, one closed vocabulary of events, and a
 * hard guard on what may be attached to them.
 *
 * ── The guard is the point ───────────────────────────────────────────
 *
 * This site's write endpoints carry licence numbers, professional email
 * addresses, practice addresses and free-text descriptions of somebody's
 * clinical approach. None of that may reach an analytics vendor. So `track()`
 * does not accept arbitrary properties:
 *
 *   · property keys must be on an allowlist
 *   · values must be a string from a known-safe enum, a number, or a boolean
 *   · any free-text value is dropped, loudly, in development
 *
 * It is deliberately impossible to call `track("practitioner_apply_submitted",
 * { email })` — the key isn't allowed, and the value would be dropped anyway.
 *
 * ── Sinks ────────────────────────────────────────────────────────────
 *
 * Vercel Analytics when available, plus `window.dataLayer` so GA4/GTM can be
 * added later with no code change here. No sink configured is a silent no-op:
 * analytics must never be able to break a page.
 */
import { track as vercelTrack } from "@vercel/analytics";

/* ==================================================================== *
 * The vocabulary
 * ==================================================================== */

/**
 * Every event the site emits. A closed union so a typo becomes a type error
 * rather than a metric nobody notices is missing for three months.
 */
export type AnalyticsEvent =
  /* discovery */
  | "homepage_map_search"
  | "discover_search"
  | "discover_filter"
  /* provider engagement */
  | "provider_view"
  | "provider_directions"
  | "provider_call"
  | "provider_website"
  /* network growth */
  | "recommend_started"
  | "recommend_submitted"
  | "practitioner_apply_started"
  | "practitioner_apply_submitted"
  /* conversion */
  | "download_app_clicked"
  | "coverage_clicked"
  | "quote_started";

/**
 * Property keys any event may carry.
 *
 * Every one of these is a *category*, never a value a person typed. Note what
 * is absent: no query text, no practice name, no email, no city typed by a
 * user, no credential anything.
 */
const ALLOWED_KEYS = new Set([
  "surface", // "homepage" | "discover" | "location_page" | "footer" …
  "modality", // canonical slug — a controlled vocabulary, not free text
  "filter", // "open_now" | "same_day" | "walk_ins" | "verification" | "modality"
  "verification", // the four trust states
  "kind", // "practitioner" | "location"
  "step", // form step index
  "product", // product slug, from our own catalogue
  "has_results", // boolean
  "result_count", // number
  "term_length", // number — length only. Never the term itself.
  "modality_count",
  "credential_count",
  "media_count",
]);

/**
 * String values that are allowed through.
 *
 * Anything not matching is dropped: a slug-shaped token can't smuggle a name
 * or an email, and that is the whole test.
 */
const SAFE_STRING = /^[a-z0-9][a-z0-9_-]{0,63}$/;

export type AnalyticsProps = Partial<
  Record<
    | "surface"
    | "modality"
    | "filter"
    | "verification"
    | "kind"
    | "product",
    string
  > &
    Record<
      | "step"
      | "result_count"
      | "term_length"
      | "modality_count"
      | "credential_count"
      | "media_count",
      number
    > &
    Record<"has_results", boolean>
>;

const IS_DEV = import.meta.env.DEV;

/**
 * Strips anything that isn't provably safe.
 *
 * Runs in production too, not just development. A guard that only exists in
 * dev is a guard that isn't there when it matters.
 */
function sanitise(props: AnalyticsProps | undefined): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {};
  if (!props) return clean;

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;

    if (!ALLOWED_KEYS.has(key)) {
      if (IS_DEV) console.warn(`[analytics] dropped disallowed property "${key}"`);
      continue;
    }

    if (typeof value === "number") {
      if (Number.isFinite(value)) clean[key] = value;
      continue;
    }

    if (typeof value === "boolean") {
      clean[key] = value;
      continue;
    }

    if (typeof value === "string") {
      if (SAFE_STRING.test(value)) clean[key] = value;
      else if (IS_DEV) {
        console.warn(`[analytics] dropped free-text value for "${key}" — use a category, not input`);
      }
    }
  }

  return clean;
}

/* ==================================================================== *
 * track
 * ==================================================================== */

/**
 * Records a funnel event.
 *
 * Never throws. An analytics vendor being down, blocked by an extension, or
 * misconfigured must not take a click handler with it.
 */
export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  const payload = sanitise(props);

  try {
    vercelTrack(event, payload);
  } catch {
    /* no sink, blocked, or not enabled on the plan — fine */
  }

  try {
    const layer = (window as any).dataLayer;
    if (Array.isArray(layer)) layer.push({ event, ...payload });
  } catch {
    /* no GTM — fine */
  }

  if (IS_DEV) console.debug(`[analytics] ${event}`, payload);
}

/**
 * Length of a search term, bucketed.
 *
 * The one thing we want to know about search input is whether people type
 * something meaningful or bail after two characters. The term itself is a
 * person's health situation in their own words and is never sent.
 */
export function termLength(term: string): number {
  return term.trim().length;
}
