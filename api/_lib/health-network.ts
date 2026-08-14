/**
 * Server-side reader for the canonical Sakred Health Network.
 *
 * This is the *only* place in the website that talks to the network tables.
 * Everything above it consumes the types in `shared/health-network.ts`, so the
 * shape of the site does not depend on the shape of the schema.
 *
 * ── Pinned against the real schema, 2026-08-13 ───────────────────────
 *
 * Every column name below was read off the live project (`lzoyzrsgjjhffuzgnglu`)
 * rather than assumed. An earlier version of this file carried two or three
 * candidate names per field, guessing at a schema it had never seen; those
 * aliases are gone. If a name here is wrong now, it is wrong loudly.
 *
 * The corrections that mattered:
 *
 *   verification        →  verification_level
 *   lat / lng           →  not columns at all; PostGIS `location`, and
 *                          latitude/longitude come back from the RPCs
 *   address_line1       →  address_line_1
 *   country             →  country_code
 *   offers_same_day     →  same_day_available
 *   photos (jsonb)      →  primary_image_url (a single string)
 *   about               →  short_description, good_for, cautions
 *   sakred_note         →  why_sakred_recommends
 *   practitioner.name   →  display_name
 *   modality.category   →  category_group
 *   slug                →  landed 2026-08-13; canonical, with alias history
 *
 * ── Configuration ────────────────────────────────────────────────────
 *
 * Reads run on the ANON key, via `readClient()` — see `network-clients.ts` for
 * why the privilege is split. RLS therefore applies to every query in this
 * file, on top of the `published` / seed predicates it writes itself. Verified
 * against production: an anon UPDATE of `health_locations` matches zero rows.
 *
 * ── The app owns the business logic ──────────────────────────────────
 *
 * Three functions, and no second implementation of any of them:
 *
 *   search_health_locations(15 args)     ranked PostGIS discovery — viewport,
 *                                        radius, modality, verification, text,
 *                                        open-now. Returns `is_seed` and
 *                                        `distance_meters`.
 *   get_health_location_by_slug(slug)    the whole location payload, alias
 *                                        history resolved, gate enforced.
 *   get_health_practitioner_by_slug(s)   the same, for a practitioner.
 *
 * What used to sit beside them — a fetch-all-and-filter search with its own
 * Haversine, and a flat-table assembly path rebuilding locations out of joins —
 * has been deleted rather than kept as a fallback. Two implementations of
 * "nearest practice" is how the app and the website end up disagreeing in front
 * of a person, and a fallback that runs only when the backend breaks is a
 * fallback nobody has tested.
 *
 * Hours are NORMALISED in `health_location_hours` and carry no offset, so the
 * location's `timezone` is read alongside them — see `timezoneByLocation`.
 */
import { type SupabaseClient } from "@supabase/supabase-js";
import { readClient } from "./network-clients.js";
import {
  EMPTY_SEARCH,
  VERIFICATION_ORDER,
  deriveLocationSlug,
  derivePractitionerSlug,
  type HealthLocation,
  type HealthPractitioner,
  type LocationSummary,
  type MapBounds,
  type Modality,
  type NetworkPhoto,
  type NetworkSearchParams,
  type NetworkSearchResult,
  type OpeningPeriod,
  type PractitionerSummary,
  type VerificationState,
} from "../../shared/health-network.js";

/* ==================================================================== *
 * Tables and functions — the one place a rename has to be reflected
 * ==================================================================== */

/**
 * The tables this file still reads directly — a short list, and deliberately so.
 *
 * The join tables are gone from it. Modality, practitioner and organisation
 * links used to be reassembled here out of `health_location_modalities`,
 * `health_practitioner_locations` and friends; the RPCs return all of that
 * already, and rebuilding it from joins meant maintaining a second, subtly
 * different copy of the app's business logic.
 */
const T = {
  locations: "health_locations",
  practitioners: "health_practitioners",
  modalities: "health_modalities",
  locationHours: "health_location_hours",
  links: "health_links",
} as const;

const RPC_SEARCH = "search_health_locations";
/** Canonical by-slug reads. Handle alias history and enforce the gate themselves. */
const RPC_LOCATION_BY_SLUG = "get_health_location_by_slug";
const RPC_PRACTITIONER_BY_SLUG = "get_health_practitioner_by_slug";

const MAX_LIMIT = 60;

/* ==================================================================== *
 * The seed gate
 * ==================================================================== *
 *
 * The app backend carries demo/seed provider records for development — as of
 * this writing, 15 published fixtures in Austin. They are fictional practices
 * with fictional names, and the public website must never render one as a real
 * practitioner: not on the map, not on a profile page, not in the sitemap, not
 * in structured data.
 *
 * Enforced in SQL, on the server, on every public read. Never by hiding rows in
 * the client: a filter that runs in the browser is a filter that ships the data
 * anyway.
 *
 * ── Fails closed ─────────────────────────────────────────────────────
 *
 * If the seed column cannot be found, production refuses to serve the directory
 * at all rather than serving it unfiltered. An empty map with an honest message
 * is recoverable; a fictional acupuncturist with a real-looking address in
 * front of a real person is not.
 */
const SEED_COLUMN = process.env.HEALTH_NETWORK_SEED_COLUMN || "is_seed";

const IS_PRODUCTION =
  process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";

/** Dev-only opt-in. Deliberately impossible to set in production. */
const ALLOW_SEED = !IS_PRODUCTION && process.env.HEALTH_NETWORK_ALLOW_SEED === "true";

type SeedSupport = "present" | "absent" | "no-table";

let seedProbe: Promise<SeedSupport> | null = null;

function isMissingColumn(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (["42703", "PGRST204"].includes(error.code ?? "")) return true;
  return /column .* does not exist/i.test(error.message ?? "");
}

async function probeSeedColumn(): Promise<SeedSupport> {
  if (seedProbe) return seedProbe;

  seedProbe = (async (): Promise<SeedSupport> => {
    const db = getClient();
    if (!db) return "no-table";

    const { error } = await db.from(T.locations).select(SEED_COLUMN).limit(1);
    if (!error) return "present";
    if (isMissingRelation(error)) return "no-table";
    if (isMissingColumn(error)) {
      console.error(
        `[health-network] SEED GATE: column "${SEED_COLUMN}" not found on ${T.locations}. ` +
          (IS_PRODUCTION
            ? "REFUSING to serve the public directory — demo providers cannot be excluded. Set HEALTH_NETWORK_SEED_COLUMN to the real column name."
            : "Serving unfiltered in non-production. Set HEALTH_NETWORK_SEED_COLUMN before deploying.")
      );
      return "absent";
    }
    console.error("[health-network] SEED GATE probe failed:", error.message);
    return "absent";
  })();

  return seedProbe;
}

interface SeedGate {
  /** False when the directory must not be served at all. */
  ok: boolean;
  /** True when queries must add the `is_seed = false` predicate. */
  filter: boolean;
}

async function seedGate(): Promise<SeedGate> {
  const support = await probeSeedColumn();
  if (support === "no-table") return { ok: false, filter: false };
  if (support === "present") return { ok: true, filter: !ALLOW_SEED };
  return { ok: !IS_PRODUCTION, filter: false };
}

/** Adds the seed predicate to a PostgREST query when the gate calls for it. */
function applySeedFilter(query: any, gate: SeedGate) {
  return gate.filter ? query.eq(SEED_COLUMN, false) : query;
}

/**
 * Drops any row the gate can identify as seed data.
 *
 * `search_health_locations` returns the whole published network including
 * fixtures, so this is not a belt-and-braces second pass — it is the only thing
 * standing between an Austin demo clinic and the public map.
 */
function rejectSeedRows(rows: any[], gate: SeedGate): any[] {
  if (!gate.filter) return rows;
  return rows.filter((row) => row[SEED_COLUMN] !== true);
}

/**
 * Whether RPC results can be trusted to be seed-free.
 *
 * Verified true against production — `search_health_locations` does return
 * `is_seed`. Kept as a guard because the day it stops doing so, this website
 * would start publishing fixtures, and that must be a refusal rather than a
 * regression nobody notices.
 */
function rpcRowsAreSafe(rows: any[], gate: SeedGate): boolean {
  if (!gate.filter) return true;
  if (rows.length === 0) return true;
  return Object.prototype.hasOwnProperty.call(rows[0], SEED_COLUMN);
}

/* ==================================================================== *
 * Client
 * ==================================================================== */

const getClient = readClient;

export function isNetworkConfigured(): boolean {
  return getClient() !== null;
}

/**
 * A PostgREST error meaning "that table/function isn't here" rather than
 * "your query was wrong".
 */
function isMissingRelation(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const code = error.code ?? "";
  if (["42P01", "42883", "PGRST202", "PGRST205"].includes(code)) return true;
  return /does not exist|not found in the schema cache/i.test(error.message ?? "");
}

/**
 * Runs a query, distinguishing "schema not there" from a genuine failure.
 *
 * A real failure is logged loudly and still degrades to the fallback, because a
 * broken directory query must never take the homepage down with it.
 */
async function safe<T>(
  label: string,
  run: (db: SupabaseClient) => Promise<{ data: T | null; error: any }>,
  fallback: T
): Promise<{ value: T; available: boolean }> {
  const db = getClient();
  if (!db) return { value: fallback, available: false };

  try {
    const { data, error } = await run(db);
    if (error) {
      if (isMissingRelation(error)) return { value: fallback, available: false };
      console.error(`[health-network] ${label} failed:`, error.message ?? error);
      return { value: fallback, available: false };
    }
    return { value: (data ?? fallback) as T, available: true };
  } catch (err: any) {
    console.error(`[health-network] ${label} threw:`, err?.message ?? err);
    return { value: fallback, available: false };
  }
}

/* ==================================================================== *
 * Row → domain mapping
 * ==================================================================== */

const asVerification = (v: unknown): VerificationState =>
  VERIFICATION_ORDER.includes(v as VerificationState) ? (v as VerificationState) : "listed";

/**
 * The single image the canonical schema carries per record.
 *
 * `primary_image_url` is one nullable string — not a gallery. Alt text falls
 * back to the subject's name, never to the empty string: a decorative-marked
 * photo of a real clinic is an accessibility bug, not a shortcut.
 */
function asPhoto(url: unknown, subject: string): NetworkPhoto | null {
  if (typeof url !== "string" || !url.trim()) return null;
  return { url, alt: subject };
}

/**
 * One row of `health_location_hours`, or one element of the detail RPC's
 * `hours` array — they have the same shape.
 *
 *   { day_of_week: 0-6, open_time: "09:00:00", close_time: "19:00:00",
 *     is_closed: boolean }
 *
 * A closed day is modelled as a row with `is_closed: true` and null times, so
 * it is dropped rather than parsed. Times arrive as Postgres `time` and are
 * truncated to "HH:MM".
 */
function asPeriod(raw: any): OpeningPeriod | null {
  if (!raw || typeof raw !== "object") return null;
  if (raw.is_closed === true) return null;

  const day = raw.day_of_week;
  const opens = raw.open_time;
  const closes = raw.close_time;

  if (!Number.isInteger(day) || day < 0 || day > 6) return null;
  if (typeof opens !== "string" || typeof closes !== "string") return null;

  const hhmm = (t: string) => t.trim().slice(0, 5);
  if (!/^\d{2}:\d{2}$/.test(hhmm(opens)) || !/^\d{2}:\d{2}$/.test(hhmm(closes))) return null;

  return { day: day as OpeningPeriod["day"], opens: hhmm(opens), closes: hhmm(closes) };
}

/** An hours collection. Empty ⇒ null, which is "unknown", not "closed". */
function asHours(raw: unknown): OpeningPeriod[] | null {
  if (!Array.isArray(raw)) return null;
  const periods = raw.map(asPeriod).filter((p): p is OpeningPeriod => p !== null);
  return periods.length ? periods : null;
}

async function hoursByLocation(locationIds: string[]): Promise<Map<string, OpeningPeriod[]>> {
  const byLocation = new Map<string, OpeningPeriod[]>();
  if (!locationIds.length) return byLocation;

  const { value: rows } = await safe<any[]>(
    "hoursByLocation",
    (db) =>
      db
        .from(T.locationHours)
        .select("location_id, day_of_week, open_time, close_time, is_closed")
        .in("location_id", locationIds) as any,
    []
  );

  for (const row of rows) {
    const period = asPeriod(row);
    if (!period) continue;
    const key = String(row.location_id);
    byLocation.set(key, [...(byLocation.get(key) ?? []), period]);
  }
  return byLocation;
}

/**
 * Each location's IANA timezone.
 *
 * Not one of the 21 columns `search_health_locations` returns, so it is read
 * separately — and it has to be read, because opening hours are stored as wall
 * clock times with no offset. Without it `resolveOpenState` falls back to the
 * server's own clock, which on Vercel is UTC: every Florida practice would have
 * been labelled against a clock four hours ahead of its own front door, so a
 * clinic open until 6pm reads as closed from 2pm onward.
 *
 * Live values are `America/New_York` and `America/Phoenix`. Phoenix is the
 * reason this is a timezone and not a stored offset — Arizona does not observe
 * daylight saving, so half the year the two differ by an hour that no fixed
 * number would get right.
 */
async function timezoneByLocation(locationIds: string[]): Promise<Map<string, string>> {
  const byLocation = new Map<string, string>();
  if (!locationIds.length) return byLocation;

  const { value: rows } = await safe<any[]>(
    "timezoneByLocation",
    (db) => db.from(T.locations).select("id, timezone").in("id", locationIds) as any,
    []
  );

  for (const row of rows) {
    if (row.timezone) byLocation.set(String(row.id), String(row.timezone));
  }
  return byLocation;
}

const asModality = (row: any): Modality => ({
  id: String(row.id),
  slug: row.slug,
  name: row.name,
  shortName: null,
  description: row.description ?? null,
  category: row.category_group ?? null,
});

/**
 * Sakred's own editorial note, or nothing.
 *
 * The one field on a provider page written in Sakred's voice. Rendered only
 * when a human wrote it: never synthesised, never templated, and never
 * populated from an applicant's own `alignment_statement`. A made-up reason for
 * recommending a real clinic is worse than no reason at all; a reason the
 * clinic wrote about itself, presented as ours, is worse than both.
 */
function editorialNote(raw: unknown): string | null {
  return typeof raw === "string" && raw.trim() ? raw : null;
}

/* ==================================================================== *
 * Links
 * ==================================================================== *
 *
 * `health_links` carries social and directory profiles and hangs off any of
 * organization_id / location_id / practitioner_id. As of this writing no link
 * row is location-scoped, and the practice's own site and booking URL live
 * directly on `health_locations` as `website_url` / `booking_url`. So the two
 * links a provider page actually renders come from the location row, and this
 * table is read for the extras.
 */
async function linksByLocation(locationIds: string[]): Promise<Map<string, LinkRow[]>> {
  const out = new Map<string, LinkRow[]>();
  if (!locationIds.length) return out;

  const { value: rows } = await safe<any[]>(
    "linksByLocation",
    (db) =>
      db
        .from(T.links)
        .select("location_id, link_type, label, url, sort_order")
        .in("location_id", locationIds)
        .eq("published", true)
        .order("sort_order") as any,
    []
  );

  for (const row of rows) {
    if (typeof row.url !== "string" || !/^https?:\/\//i.test(row.url)) continue;
    const key = String(row.location_id);
    out.set(key, [
      ...(out.get(key) ?? []),
      { type: String(row.link_type ?? ""), label: row.label ?? null, url: row.url },
    ]);
  }
  return out;
}

interface LinkRow {
  type: string;
  label: string | null;
  url: string;
}

function linksFromPayload(raw: unknown): LinkRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((r: any) => typeof r?.url === "string" && /^https?:\/\//i.test(r.url))
    .map((r: any) => ({
      type: String(r.link_type ?? ""),
      label: r.label ?? null,
      url: r.url as string,
    }));
}

/* ==================================================================== *
 * Modalities
 * ==================================================================== */

let modalityCache: { at: number; list: Modality[] } | null = null;
const MODALITY_TTL_MS = 5 * 60_000;

export async function getModalities(): Promise<Modality[]> {
  if (modalityCache && Date.now() - modalityCache.at < MODALITY_TTL_MS) {
    return modalityCache.list;
  }

  const { value } = await safe<any[]>(
    "getModalities",
    (db) =>
      db
        .from(T.modalities)
        .select("id, slug, name, description, category_group, sort_order, active")
        .eq("active", true)
        .order("sort_order") as any,
    []
  );

  const list = value.map(asModality);
  modalityCache = { at: Date.now(), list };
  return list;
}

/**
 * Modalities with a published, non-seed location count attached.
 *
 * The count decides whether `/discover/<modality>` is worth generating and
 * indexing at all — a category page with nothing on it is a thin page, and a
 * thousand of them is a penalty.
 *
 * Counted from the search RPC's `modality_slugs` rather than the join table,
 * because that is the same set of rows the page itself will render. Counting
 * the join table would include unpublished and seed locations and produce
 * category pages that turn out to be empty.
 */
export async function getModalitiesWithCounts(): Promise<Modality[]> {
  const modalities = await getModalities();
  if (!modalities.length) return [];

  const gate = await seedGate();
  if (!gate.ok) return modalities.map((m) => ({ ...m, locationCount: 0 }));

  const rows = await runSearch(searchArgs({}, gate), gate);
  if (!rows) return modalities.map((m) => ({ ...m, locationCount: 0 }));

  const counts = new Map<string, number>();
  for (const row of rows) {
    for (const slug of row.modality_slugs ?? []) {
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
  }

  return modalities.map((m) => ({ ...m, locationCount: counts.get(m.slug) ?? 0 }));
}

/* ==================================================================== *
 * Search — CANONICAL
 * ==================================================================== *
 *
 * `search_health_locations` IS the network's discovery query, and this is now
 * the only thing the website does to search: build arguments, call it, map the
 * rows. The map's viewport, the radius, the modality chips, the text box and
 * the verification floor are all applied by PostGIS, on indexes, inside the
 * database.
 *
 * ── What was here before ─────────────────────────────────────────────
 *
 * A "download the whole directory and filter it in JavaScript" path, written
 * while the exact argument NAMES were unknown (PostgREST resolves overloads by
 * name, so every guess returned PGRST202 and the no-argument call bound the
 * all-defaulted resolution). It carried a Haversine implementation to rank by
 * distance. Both are gone — not left as a fallback. A silent fallback to a
 * second search implementation is how the app and the website end up quietly
 * disagreeing about which practice is nearest, and how a backend regression
 * gets hidden instead of reported.
 *
 * ── The live identity signature, verified against production ─────────
 *
 *   p_min_lat, p_min_lng, p_max_lat, p_max_lng   double precision  viewport
 *   p_center_lat, p_center_lng                   double precision  origin
 *   p_radius_meters                              double precision
 *   p_modality_slugs                             text[]   (matches ANY)
 *   p_verification_levels                        text[]
 *   p_open_now, p_walk_ins, p_same_day           boolean
 *   p_query                                      text
 *   p_include_seed                               boolean  default false
 *   p_limit                                      integer  clamped 1..500
 *
 * SECURITY INVOKER, STABLE, executable by anon. Returns 21 columns including
 * `distance_meters` (NULL unless an origin is given), `location_slug`,
 * `organization_slug` and `is_seed`.
 */

/** Exactly the arguments the live function declares. No guesses, no aliases. */
interface SearchArgs {
  p_min_lat: number | null;
  p_min_lng: number | null;
  p_max_lat: number | null;
  p_max_lng: number | null;
  p_center_lat: number | null;
  p_center_lng: number | null;
  p_radius_meters: number | null;
  p_modality_slugs: string[] | null;
  p_verification_levels: string[] | null;
  p_open_now: boolean | null;
  p_walk_ins: boolean | null;
  p_same_day: boolean | null;
  p_query: string | null;
  p_include_seed: boolean;
  p_limit: number;
}

/** The function's own ceiling. Asking for more is not an error, just ignored. */
const RPC_MAX_LIMIT = 500;

function searchArgs(over: Partial<SearchArgs>, gate: SeedGate): SearchArgs {
  return {
    p_min_lat: null,
    p_min_lng: null,
    p_max_lat: null,
    p_max_lng: null,
    p_center_lat: null,
    p_center_lng: null,
    p_radius_meters: null,
    p_modality_slugs: null,
    p_verification_levels: null,
    p_open_now: null,
    p_walk_ins: null,
    p_same_day: null,
    p_query: null,
    /* The gate decides, never the caller. `filter` is true whenever seeds must
       be excluded, which in production is always. */
    p_include_seed: !gate.filter,
    p_limit: RPC_MAX_LIMIT,
    ...over,
  };
}

/**
 * Calls the search function and enforces the seed gate on the way out.
 *
 * `p_include_seed: false` already excludes fixtures in SQL. The second pass is
 * not redundancy for its own sake: it is the difference between trusting a
 * remote default and verifying, and the thing it protects against — an Austin
 * demo clinic rendered as a real practice — is not a defect you get to fix
 * after someone drives to the address.
 */
async function runSearch(args: SearchArgs, gate: SeedGate): Promise<any[] | null> {
  const rpc = await safe<any[]>("searchLocations", (db) => db.rpc(RPC_SEARCH, args) as any, []);

  if (!rpc.available) {
    console.error(
      `[health-network] ${RPC_SEARCH} is unavailable. The directory cannot be served: ` +
        "coordinates are PostGIS-only and are not readable as columns."
    );
    return null;
  }

  if (!rpcRowsAreSafe(rpc.value, gate)) {
    console.error(
      `[health-network] ${RPC_SEARCH} no longer returns "${SEED_COLUMN}" — REFUSING to serve ` +
        "the directory rather than risk publishing demo providers."
    );
    return null;
  }

  return rejectSeedRows(rpc.value, gate);
}

/** A `search_health_locations` row → a card. */
function searchRowToSummary(
  row: any,
  hours: OpeningPeriod[] | null,
  timezone: string | null
): LocationSummary {
  const name = row.name ?? "";
  return {
    id: String(row.location_id),
    // Canonical, straight off the RPC. The derivation is a null guard only.
    slug: row.location_slug ?? deriveLocationSlug(name, row.city),
    name,
    organizationName: row.organization_name ?? null,
    city: row.city ?? "",
    region: row.region ?? "",
    lat: Number(row.latitude),
    lng: Number(row.longitude),
    modalities: (row.modality_slugs ?? []).map((slug: string) => modalityBySlug(slug)),
    verification: asVerification(row.verification_level),
    photo: asPhoto(row.primary_image_url, name),
    hours,
    timezone,
    /* Ranked by PostGIS. NULL whenever no origin was supplied — which is the
       function telling us it has no opinion, not a distance of zero. */
    distanceMeters: row.distance_meters != null ? Number(row.distance_meters) : null,
    acceptsWalkIns: Boolean(row.accepts_walk_ins),
    offersSameDay: Boolean(row.same_day_available),
  };
}

/** Resolves a modality slug against the cached vocabulary. */
let modalityIndex = new Map<string, Modality>();
function modalityBySlug(slug: string): Modality {
  return (
    modalityIndex.get(slug) ?? { id: slug, slug, name: slug, shortName: null, category: null }
  );
}

/**
 * An optional boolean filter, in the function's own terms.
 *
 * `true` means "require it". `null` means "do not filter". `false` would mean
 * "require the absence of it", which no chip on this site is asking for — an
 * unticked "Open now" is not a request for closed practices. Sending `false`
 * for an inactive toggle is the classic way to turn an off switch into a
 * filter nobody chose.
 */
const requireIf = (on: boolean | undefined): boolean | null => (on ? true : null);

/**
 * Escapes LIKE wildcards so typed text is treated as text.
 *
 * `p_query` is matched as a pattern, so a visitor typing a single `%` was
 * handed the entire directory, and `_` matched any character. Neither is a
 * security hole — the call is parameterised, and `' OR 1=1--` returns zero rows
 * with no error — but "50% off" behaving as a wildcard expression is the sort
 * of thing that looks like the search is broken.
 *
 * Verified at the boundary, no change to the SQL function and no change to
 * ordinary searches:
 *
 *   "%"            14 → 0        "acupuncture"   10 → 10
 *   "_"            14 → 0        "naples"         4 → 4
 *   "a%"           14 → 0        "' OR 1=1--"     0 → 0
 *
 * The backslash is escaped in the same pass and must come first in the class,
 * or escaping `%` would produce a sequence the next replacement re-escapes.
 *
 * This is a boundary fix, not a search implementation. Real tokenisation —
 * "acupuncture naples" matching both terms — belongs in the canonical function,
 * not here.
 */
function escapeLikePattern(text: string): string {
  return text.replace(/([\\%_])/g, "\\$1");
}

export async function searchLocations(
  params: NetworkSearchParams
): Promise<NetworkSearchResult> {
  if (!isNetworkConfigured()) return EMPTY_SEARCH;

  const gate = await seedGate();
  if (!gate.ok) return EMPTY_SEARCH;

  const b = params.bounds;
  const hasOrigin = params.lat != null && params.lng != null;

  /**
   * A verification floor expands to the set of levels at or above it, because
   * the function takes a list of acceptable levels rather than a minimum.
   * VERIFICATION_ORDER is ascending, so everything from the floor onward.
   */
  const levels = params.minVerification
    ? VERIFICATION_ORDER.slice(VERIFICATION_ORDER.indexOf(params.minVerification))
    : null;

  const rows = await runSearch(
    searchArgs(
      {
        p_min_lat: b ? b.south : null,
        p_min_lng: b ? b.west : null,
        p_max_lat: b ? b.north : null,
        p_max_lng: b ? b.east : null,
        p_center_lat: hasOrigin ? params.lat! : null,
        p_center_lng: hasOrigin ? params.lng! : null,
        p_radius_meters: hasOrigin && params.radius != null ? params.radius : null,
        p_modality_slugs: params.modalities?.length ? params.modalities : null,
        p_verification_levels: levels?.length ? [...levels] : null,
        p_open_now: requireIf(params.openNow),
        p_walk_ins: requireIf(params.walkIns),
        p_same_day: requireIf(params.sameDay),
        /**
         * One text argument, one substring match — verified: "acupuncture
         * naples" matches nothing, so the term and a city cannot be
         * concatenated. A typed term is live intent and wins; the city from a
         * `/discover/:modality/:city` URL is used only when nothing is typed.
         */
        p_query: escapeLikePattern(params.q || params.city || "") || null,
        p_limit: Math.min(params.limit ?? MAX_LIMIT, RPC_MAX_LIMIT),
      },
      gate
    ),
    gate
  );
  if (!rows) return EMPTY_SEARCH;

  const ids = rows.map((r) => String(r.location_id));
  const [modalities, hourMap, zoneMap] = await Promise.all([
    getModalities(),
    hoursByLocation(ids),
    timezoneByLocation(ids),
  ]);
  modalityIndex = new Map(modalities.map((m) => [m.slug, m]));

  const locations = rows.map((r) => {
    const id = String(r.location_id);
    return searchRowToSummary(r, hourMap.get(id) ?? null, zoneMap.get(id) ?? null);
  });

  /* `total` is what this query returned, capped by p_limit. It is the number
     the map prints next to "practices in this view", so it must describe the
     pins that are actually on screen rather than a count from a wider set. */
  return { locations, total: locations.length, available: true };
}

/* ==================================================================== *
 * Slug resolution — CANONICAL
 * ==================================================================== *
 *
 * `health_locations.slug` and `health_practitioners.slug` landed on 2026-08-13,
 * so this is now an indexed WHERE clause rather than the table scan it had to
 * be while the website was deriving slugs from display names.
 *
 * `deriveLocationSlug` / `derivePractitionerSlug` survive only as a last-resort
 * fallback for a row whose slug is somehow null. They are no longer the
 * addressing scheme, and nothing should be built on them — see
 * docs/slug-cutover-audit.md for what changed and why 15 of 31 differed.
 */
/*
 * `resolveLocationId` is GONE too.
 *
 * It resolved a slug to a row so the old two-step detail read could then ask
 * `get_health_location_detail` for the payload. `get_health_location_by_slug`
 * does both in one call, resolves alias history on the way, and enforces the
 * published/non-seed gate itself. Nothing needs a slug→id step any more.
 */
/*
 * The id→slug join maps that used to live here are GONE.
 *
 * They existed only because `search_health_locations` and
 * `get_health_location_detail` omitted the newly-canonical slug, so every card
 * needed a second query to know its own URL. The app team has since added
 * `location_slug` / `organization_slug` to the search result and
 * `location.slug` / `practitioners[].slug` to the detail payload, so the joins
 * are dead weight and two fewer round trips per request.
 */

/* ==================================================================== *
 * Single records
 * ==================================================================== */

/**
 * One published location, by canonical slug.
 *
 * `get_health_location_by_slug` is the app's own by-slug read: it resolves the
 * slug, follows the alias history if the practice has been renamed, enforces
 * published/non-seed itself, and returns the full detail envelope — all in one
 * round trip. Verified against production: a seed slug comes back null.
 *
 * It also returns `redirect` and `canonical_slug`, which is how an old URL
 * keeps working instead of 404ing. See `HealthLocation.redirect`.
 *
 * The gate still runs here. The RPC filtering seeds is welcome, but "the
 * database will handle it" is not something this site delegates — two
 * independent things have to fail before a demo practice reaches a real person.
 */
export async function getLocationBySlug(slug: string): Promise<HealthLocation | null> {
  const gate = await seedGate();
  if (!gate.ok) return null;

  const [bySlug, vocabulary] = await Promise.all([
    safe<any>(
      "getLocationBySlug:rpc",
      (db) => db.rpc(RPC_LOCATION_BY_SLUG, { p_slug: slug }) as any,
      null
    ),
    getModalities(),
  ]);

  const byName = new Map(vocabulary.map((m) => [m.name.toLowerCase(), m]));

  /**
   * No fallback.
   *
   * A two-step `slug → id → get_health_location_detail` route lived here while
   * it was uncertain whether the by-slug function was deployed everywhere. It
   * is deployed, and it is what handles alias history and enforces the
   * published/non-seed gate at source — the fallback did neither. Keeping it
   * would mean a backend regression degrades quietly into a path that serves
   * pages without alias resolution, and nobody finds out. If this function goes
   * missing, provider pages 404 and that is the correct, visible failure.
   */
  if (!bySlug.available || !bySlug.value?.location) return null;

  const built = fromDetailPayload(bySlug.value, bySlug.value.location, gate, byName);
  if (!built) return null;

  return {
    ...built,
    canonicalSlug: bySlug.value.canonical_slug ?? built.slug,
    redirect: bySlug.value.redirect === true,
  };
}

/**
 * Builds a location from `get_health_location_detail`.
 *
 * The real envelope is
 *   { hours, links, is_saved, location, modalities, organization,
 *     practitioners, verifications }
 * with `location` carrying `latitude` / `longitude` / `is_open_now` / `is_seed`,
 * which the flat table does not.
 */
function fromDetailPayload(
  payload: any,
  fallbackRow: any,
  gate: SeedGate,
  /** Canonical vocabulary keyed by lowercased name — the payload uses names. */
  byName: Map<string, Modality>
): HealthLocation | null {
  const data = Array.isArray(payload) ? payload[0] : payload;
  if (!data || typeof data !== "object" || !data.location) return null;

  const base = { ...fallbackRow, ...data.location };

  // The gate reaches the payload too: an RPC that hands back a seed row is
  // still a seed row, and this page has a real address on it.
  if (gate.filter && base[SEED_COLUMN] === true) return null;
  if (base.published === false) return null;

  const org = data.organization ?? null;
  const name = base.name ?? "";
  const hours = asHours(data.hours);
  const modalities: Modality[] = Array.isArray(data.modalities)
    ? data.modalities.map(asModality)
    : [];

  const practitioners: PractitionerSummary[] = (
    Array.isArray(data.practitioners) ? data.practitioners : []
  ).map((p: any) => ({
    id: String(p.id),
    slug: p.slug ?? derivePractitionerSlug(p.display_name ?? ""),
    name: p.display_name ?? "",
    // The canonical schema has no separate post-nominals field; the display
    // name already carries them ("Mei-Ling Halloran, L.Ac.").
    credentials: null,
    headline: p.professional_title ?? null,
    photo: asPhoto(p.photo_url, p.display_name ?? ""),
    /**
     * The detail payload lists a practitioner's modalities by NAME, not slug.
     * They have to be resolved against the canonical vocabulary rather than
     * slugified: "Traditional Chinese Medicine" slugifies to
     * `traditional-chinese-medicine`, but the canonical slug is `tcm`, so a
     * derived one would link every TCM practitioner to a modality page that
     * does not exist. An unresolvable name renders as an unlinked label.
     */
    modalities: (p.modalities ?? [])
      .map((m: string) => byName.get(m.toLowerCase()) ?? null)
      .filter((m: Modality | null): m is Modality => m !== null),
    verification: asVerification(p.verification_level),
  }));

  return {
    id: String(base.id),
    slug: base.slug ?? deriveLocationSlug(name, base.city),
    name,
    organizationName: org?.name ?? null,
    city: base.city ?? "",
    region: base.region ?? "",
    lat: Number(base.latitude),
    lng: Number(base.longitude),
    modalities,
    verification: asVerification(base.verification_level),
    photo: asPhoto(base.primary_image_url, name),
    hours,
    timezone: base.timezone ?? null,
    distanceMeters: null,
    acceptsWalkIns: Boolean(base.accepts_walk_ins),
    offersSameDay: Boolean(base.same_day_available),

    organizationId: base.organization_id ?? null,
    organizationSlug: org?.slug ?? null,
    addressLine1: base.address_line_1 ?? null,
    addressLine2: base.address_line_2 ?? null,
    postalCode: base.postal_code ?? null,
    country: base.country_code ?? null,
    phone: base.phone ?? null,
    website: base.website_url ?? null,
    bookingUrl: base.booking_url ?? null,
    about: org?.short_description ?? null,
    goodFor: base.good_for ?? org?.good_for ?? null,
    cautions: base.cautions ?? org?.cautions ?? null,
    whatTheyDoWell: org?.what_they_do_well ?? null,
    // Editorial only. Location note wins; the org's is the fallback.
    sakredNote: editorialNote(base.why_sakred_recommends ?? org?.why_sakred_recommends),
    /**
     * A practice with no published hours is not a closed practice.
     *
     * `health_location_is_open_now` returns `false` in that case — it cannot
     * distinguish "shut right now" from "we were never told when they open",
     * and several real records (Naples Center, Eastern Medicine) have no hours
     * on file. Passing that through would put "Closed" on the page of a
     * practice that is very likely open, which is worse for the practice than
     * saying nothing and worse for the visitor than an honest silence.
     */
    isOpenNow: hours ? (typeof base.is_open_now === "boolean" ? base.is_open_now : null) : null,
    links: linksFromPayload(data.links),
    photos: [asPhoto(base.primary_image_url, name)].filter(Boolean) as NetworkPhoto[],
    practitioners,
    verifiedAt: null,
    discussionCount: 0,
  };
}

/*
 * The direct-read assembly path is GONE.
 *
 * `assembleLocation` rebuilt a location from the flat tables — organisation,
 * modalities, practitioners, hours, open state — as a fallback for a
 * deployment where the detail RPC was missing. With it go `isOpenNow`,
 * `getOrganizationLite`, `modalitiesByLocation`, `getPractitionersForLocation`
 * and `modalitiesByPractitioner`, which existed only to serve it.
 *
 * Removed deliberately rather than left in place. It was a second, subtly
 * different reader for the same records — it reassembled the app's business
 * logic out of joins — so if the canonical RPC ever broke, the site would have
 * degraded quietly onto a path nobody had exercised in months. A visible 404 is
 * a better outcome than pages served by dead code.
 */

/**
 * One published practitioner, by canonical slug.
 *
 * `get_health_practitioner_by_slug` returns the practitioner, their canonical
 * modalities (with real slugs, so a TCM practitioner links to `/discover/tcm`
 * rather than a slugified display name), the locations they practise at, and
 * the alias-history fields.
 *
 * Location cards are still enriched through the search RPC: the by-slug payload
 * gives ids, names and coordinates but not verification level, image or open
 * state, and a card missing its trust badge is a card that quietly understates
 * the network.
 */
export async function getPractitionerBySlug(slug: string): Promise<HealthPractitioner | null> {
  const gate = await seedGate();
  if (!gate.ok) return null;

  const bySlug = await safe<any>(
    "getPractitionerBySlug:rpc",
    (db) => db.rpc(RPC_PRACTITIONER_BY_SLUG, { p_slug: slug }) as any,
    null
  );

  /* No fallback — see getLocationBySlug. The by-slug function is the only
     read that resolves alias history and enforces the gate at source. */
  if (!bySlug.available || !bySlug.value?.practitioner) return null;

  const data = bySlug.value;
  const p = data.practitioner;

  if (gate.filter && p[SEED_COLUMN] === true) return null;

  const ids = new Set<string>((data.locations ?? []).map((l: any) => String(l.id)));
  const locations = await locationCardsFor(ids, gate);
  const name = p.display_name ?? "";

  return {
    id: String(p.id),
    slug: p.slug ?? derivePractitionerSlug(name),
    canonicalSlug: data.canonical_slug ?? p.slug,
    redirect: data.redirect === true,
    name,
    // The canonical schema has no separate post-nominals field; the display
    // name already carries them ("Matthew Enright, AP, DOM").
    credentials: null,
    headline: p.professional_title ?? null,
    bio: p.bio ?? null,
    sakredNote: editorialNote(p.why_sakred_recommends),
    photo: asPhoto(p.photo_url, name),
    yearsPracticing: null,
    languages: [],
    modalities: (data.modalities ?? []).map((m: any) => ({
      id: m.slug,
      slug: m.slug,
      name: m.name,
      shortName: null,
      category: null,
    })),
    verification: asVerification(p.verification_level),
    verifiedAt: null,
    locations,
  };
}

/**
 * Full location cards for a set of ids.
 *
 * Sourced from the search RPC rather than the flat table because that is the
 * only read carrying coordinates, open state and the seed flag together.
 *
 * This is the one selection the website still makes in memory, and it is a
 * genuine gap in the read contract rather than leftover search code: the
 * function filters by place, modality and text, but takes no set of ids. The
 * caller is a practitioner's "where they practise" list — a handful of rows
 * chosen from the published set, not a query. If the network grows past what a
 * single unfiltered call returns, this needs `p_location_ids` from the app
 * team; it must not grow a second search of its own.
 */
async function locationCardsFor(
  ids: Set<string>,
  gate: SeedGate
): Promise<LocationSummary[]> {
  if (!ids.size) return [];

  const network = await runSearch(searchArgs({}, gate), gate);
  const mine = (network ?? []).filter((r) => ids.has(String(r.location_id)));
  if (!mine.length) return [];

  const rowIds = mine.map((r) => String(r.location_id));
  const [hourMap, zoneMap, all] = await Promise.all([
    hoursByLocation(rowIds),
    timezoneByLocation(rowIds),
    getModalities(),
  ]);
  modalityIndex = new Map(all.map((m) => [m.slug, m]));

  return mine.map((r) => {
    const id = String(r.location_id);
    return searchRowToSummary(r, hourMap.get(id) ?? null, zoneMap.get(id) ?? null);
  });
}

/**
 * Nearby published locations, excluding the one being viewed.
 *
 * A real radius around a real origin, ranked by PostGIS. This used to be a
 * degree-shaped box, which is not a circle anywhere outside the equator and
 * had no notion of which of its results was actually closest.
 */
const NEARBY_RADIUS_METERS = 60_000; // ≈ 37 miles

export async function getNearbyLocations(
  origin: LocationSummary,
  limit = 3
): Promise<LocationSummary[]> {
  if (!Number.isFinite(origin.lat) || !Number.isFinite(origin.lng)) return [];
  const result = await searchLocations({
    lat: origin.lat,
    lng: origin.lng,
    radius: NEARBY_RADIUS_METERS,
    // One extra, because the origin itself comes back at zero metres.
    limit: limit + 1,
  });
  return result.locations.filter((l) => l.id !== origin.id).slice(0, limit);
}

/* ==================================================================== *
 * Sitemap support
 * ==================================================================== */

/** Every published, non-seed slug. Unpublished and seed rows never appear. */
export async function getPublishedSlugs(): Promise<{
  locations: { slug: string; updatedAt: string | null }[];
  practitioners: { slug: string; updatedAt: string | null }[];
}> {
  const gate = await seedGate();
  if (!gate.ok) return { locations: [], practitioners: [] };

  const [locations, practitioners] = await Promise.all([
    safe<any[]>(
      "sitemapLocations",
      (db) =>
        applySeedFilter(
          db.from(T.locations).select("slug, name, city, updated_at").eq("published", true),
          gate
        ) as any,
      []
    ),
    safe<any[]>(
      "sitemapPractitioners",
      (db) =>
        applySeedFilter(
          db.from(T.practitioners).select("slug, display_name, updated_at").eq("published", true),
          gate
        ) as any,
      []
    ),
  ]);

  return {
    locations: locations.value.map((r) => ({
      slug: r.slug ?? deriveLocationSlug(r.name ?? "", r.city),
      updatedAt: (r.updated_at as string) ?? null,
    })),
    practitioners: practitioners.value.map((r) => ({
      slug: r.slug ?? derivePractitionerSlug(r.display_name ?? ""),
      updatedAt: (r.updated_at as string) ?? null,
    })),
  };
}

/* ==================================================================== *
 * Submissions — deliberately NOT here
 * ==================================================================== *
 *
 * This module is read-only, and it holds the ANON key, so it could not write
 * even if it tried. The queue lives in `api/_lib/network-intake.ts`.
 */
