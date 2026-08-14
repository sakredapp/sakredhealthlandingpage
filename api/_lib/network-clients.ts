/**
 * The two Supabase clients the website is allowed to build against the Health
 * Network, and the rule for which is which.
 *
 * One ambiguous `HEALTH_NETWORK_SUPABASE_KEY` was a real hazard: whichever key
 * you put in it, *every* query in the repo inherited that privilege. If it held
 * the service role, then the public directory — the most-hit, least-privileged
 * surface on the site — was running as a superuser, and RLS was decorative. One
 * forgotten `.eq("published", true)` would have leaked the whole table.
 *
 * So the privilege is split at the client, not at the call site:
 *
 *   readClient()      anon key.          Public directory reads.
 *                     RLS applies.       /discover, provider pages, sitemap.
 *
 *   writeClient()     service role key.  Intake and media only.
 *                     RLS bypassed.      Never reachable from a read path.
 *
 * `api/_lib/health-network.ts` imports only `readClient`. `network-intake.ts`
 * imports only `writeClient`. Neither imports the other's. That is the whole
 * enforcement mechanism, and it is checkable by grep.
 *
 * ── Defence in depth, not instead of ─────────────────────────────────
 *
 * The read path still filters `published = true` and `is_seed = false` in its
 * own SQL. The anon key means a mistake in that filter is caught by RLS instead
 * of being served to the internet. Two independent things have to be wrong
 * before a draft or a demo practitioner reaches a real person.
 *
 * ── Environment ──────────────────────────────────────────────────────
 *
 *   HEALTH_NETWORK_SUPABASE_URL               the app's project
 *   HEALTH_NETWORK_SUPABASE_ANON_KEY          reads
 *   HEALTH_NETWORK_SUPABASE_SERVICE_ROLE_KEY  intake + media
 *
 * Neither key is ever exposed to the browser: no `VITE_` prefix, and nothing in
 * `client/` imports this module.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL_ENV = process.env.HEALTH_NETWORK_SUPABASE_URL;
const ANON_ENV = process.env.HEALTH_NETWORK_SUPABASE_ANON_KEY;
const SERVICE_ENV = process.env.HEALTH_NETWORK_SUPABASE_SERVICE_ROLE_KEY;

/**
 * The pre-split variable.
 *
 * Accepted for reads only, and only with a warning, so a deploy that still
 * carries the old name degrades to "the directory works" rather than "the
 * directory is empty". It is deliberately NOT accepted for writes: a key of
 * unknown privilege is not something to hand the intake path.
 */
const LEGACY_ENV = process.env.HEALTH_NETWORK_SUPABASE_KEY;

const options = { auth: { persistSession: false } } as const;

let readCache: SupabaseClient | null | undefined;
let writeCache: SupabaseClient | null | undefined;
let warnedLegacy = false;

/**
 * A key that is obviously the service role.
 *
 * Supabase JWTs carry `{"role":"service_role"}` in the payload. Decoding the
 * middle segment is enough to catch the configuration mistake that matters —
 * pasting the service key into the read slot — without pretending to validate
 * a signature we have no business validating.
 */
function looksLikeServiceRole(key: string): boolean {
  try {
    const payload = key.split(".")[1];
    if (!payload) return false;
    const json = Buffer.from(payload, "base64").toString("utf8");
    return /"role"\s*:\s*"service_role"/.test(json);
  } catch {
    return false;
  }
}

/**
 * The client every public read uses. Anon key: RLS still applies.
 *
 * Returns null when unconfigured, which is a supported state — the network
 * surfaces render "the network isn't live here" rather than erroring.
 */
export function readClient(): SupabaseClient | null {
  if (readCache !== undefined) return readCache;

  let key = ANON_ENV;

  if (!key && LEGACY_ENV) {
    if (!warnedLegacy) {
      warnedLegacy = true;
      console.warn(
        "[network] using deprecated HEALTH_NETWORK_SUPABASE_KEY for reads. " +
          "Rename it to HEALTH_NETWORK_SUPABASE_ANON_KEY and set " +
          "HEALTH_NETWORK_SUPABASE_SERVICE_ROLE_KEY separately."
      );
    }
    key = LEGACY_ENV;
  }

  if (key && looksLikeServiceRole(key)) {
    console.error(
      "[network] SERVICE ROLE key found in the READ slot. Public directory reads " +
        "would bypass RLS entirely. Put the anon key in " +
        "HEALTH_NETWORK_SUPABASE_ANON_KEY. Reads are DISABLED until this is fixed."
    );
    readCache = null;
    return null;
  }

  readCache = URL_ENV && key ? createClient(URL_ENV, key, options) : null;

  if (!readCache) {
    console.warn(
      "[network] not configured for reads — set HEALTH_NETWORK_SUPABASE_URL and " +
        "HEALTH_NETWORK_SUPABASE_ANON_KEY. Network surfaces will render their unavailable state."
    );
  }
  return readCache;
}

/**
 * The client intake and media use. Service role: RLS is bypassed.
 *
 * No fallback to the anon key and no fallback to the legacy variable. A write
 * path running with insufficient privilege fails in a confusing way at the last
 * step — after the applicant has filled in the form and pressed submit — and
 * "not configured" is a much clearer failure than "permission denied on a table
 * you didn't know existed".
 */
export function writeClient(): SupabaseClient | null {
  if (writeCache !== undefined) return writeCache;

  if (URL_ENV && SERVICE_ENV && !looksLikeServiceRole(SERVICE_ENV)) {
    console.warn(
      "[network] HEALTH_NETWORK_SUPABASE_SERVICE_ROLE_KEY does not look like a " +
        "service_role key. Intake RPCs are service-only and will be refused."
    );
  }

  writeCache = URL_ENV && SERVICE_ENV ? createClient(URL_ENV, SERVICE_ENV, options) : null;

  if (!writeCache) {
    console.warn(
      "[network] not configured for intake — set HEALTH_NETWORK_SUPABASE_URL and " +
        "HEALTH_NETWORK_SUPABASE_SERVICE_ROLE_KEY. Submissions will be refused, not dropped."
    );
  }
  return writeCache;
}

export const isReadConfigured = () => readClient() !== null;
export const isWriteConfigured = () => writeClient() !== null;

/** The bucket the app already owns for application media. Private. */
export const APPLICATION_MEDIA_BUCKET =
  process.env.HEALTH_NETWORK_MEDIA_BUCKET || "network-application-media";
