/**
 * Abuse protection for the public write endpoints.
 *
 * `/for-practitioners` and `/recommend` are the only routes on this site where
 * an anonymous stranger can put a row into a system a human then reads. That
 * makes them the two routes worth attacking, and the two worth protecting
 * properly.
 *
 * Four independent layers, cheapest first:
 *
 *   1. payload size    reject before parsing
 *   2. honeypot        free, catches naive bots
 *   3. rate limit      durable, per-IP and per-email
 *   4. Turnstile       the real gate
 *
 * ── Fail-closed vs fail-open ─────────────────────────────────────────
 *
 * Turnstile fails CLOSED in production: if the secret isn't configured we
 * refuse submissions rather than run an unprotected public write endpoint.
 * That is deliberately noisy — an operator would rather see a broken form than
 * discover the queue full of spam a week later.
 *
 * Rate limiting fails OPEN, loudly. It is defence in depth behind Turnstile,
 * and taking the practitioner funnel down because a throttle table is briefly
 * unreachable would be a worse outcome than a burst of un-throttled traffic.
 */
import { createHash, createHmac } from "crypto";
import type { VercelRequest } from "@vercel/node";
import { sql } from "drizzle-orm";
import { getDb } from "./db.js";

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const IS_PRODUCTION =
  process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";

export interface GuardFailure {
  status: number;
  error: string;
  /** Internal reason, for logs and the submission result. Never sent verbatim. */
  reason: "too_large" | "honeypot" | "throttled" | "challenge";
}

/* ==================================================================== *
 * 1 · Client identity
 * ==================================================================== */

/**
 * The caller's IP.
 *
 * On Vercel, `x-forwarded-for` is set by the platform edge and the left-most
 * entry is the real client. Reading `x-real-ip` first because Vercel sets it
 * to the same value without the proxy chain, so there is nothing to parse.
 */
export function clientIp(req: VercelRequest): string {
  const real = req.headers["x-real-ip"];
  if (typeof real === "string" && real) return real;

  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return raw?.split(",")[0]?.trim() || "unknown";
}

/* ==================================================================== *
 * 2 · Payload size
 * ==================================================================== */

/**
 * Rejects oversized bodies.
 *
 * Vercel has already parsed the body by the time a handler runs, so this is a
 * belt-and-braces check on the serialised size rather than a true streaming
 * limit — it stops a 5MB "application" being written into the queue, which is
 * the outcome that actually matters here.
 */
export function checkPayloadSize(body: unknown, maxBytes: number): GuardFailure | null {
  const size = Buffer.byteLength(JSON.stringify(body ?? {}), "utf8");
  if (size <= maxBytes) return null;
  return {
    status: 413,
    error: "That submission is too large. Please shorten the longer answers.",
    reason: "too_large",
  };
}

/* ==================================================================== *
 * 3 · Rate limiting
 * ==================================================================== */

/**
 * Durable counters, in the site's own Postgres.
 *
 * Per-lambda memory is useless for this: Vercel runs many instances, so an
 * in-process counter throttles roughly one instance's worth of traffic and
 * nothing else.
 *
 * ── The table is a migration, not a side effect ──────────────────────
 *
 * An earlier version of this file ran `CREATE TABLE IF NOT EXISTS` on first
 * use. It was convenient and it was wrong: production schema changing as a
 * side effect of an anonymous HTTP request means the shape of the database
 * depends on which code path happened to run first, and it puts DDL rights on
 * the connection a public endpoint uses. The table now ships as
 * `migrations/0001_submission_throttle.sql` and is declared in
 * `shared/schema.ts`. If it is absent, rate limiting degrades to off — loudly —
 * rather than creating it.
 *
 * ── What we store ────────────────────────────────────────────────────
 *
 * Never a raw IP address or email. Identifiers are normalised and then HMACed
 * with a server secret, so the table holds an opaque key that is useful for
 * counting and useless for anything else. Rows carry `expires_at` and are
 * cleaned opportunistically — a throttle table that grows forever is a slow
 * leak of exactly the data we just took care not to keep.
 */
const IDENTIFIER_SECRET =
  process.env.SUBMISSION_TOKEN_SECRET || process.env.SESSION_SECRET || "";

let warnedNoSecret = false;

/**
 * An opaque, stable key for an identifier.
 *
 * Keyed with a server secret so the stored digests can't be checked against a
 * dictionary — an unkeyed SHA-256 of an IPv4 address is reversible by anyone
 * willing to spend an afternoon on 2^32 hashes, which would make "we don't
 * store IPs" a technicality rather than a fact.
 */
function identifierKey(kind: string, identifier: string): string {
  const normalised = `${kind}:${identifier.trim().toLowerCase()}`;

  if (!IDENTIFIER_SECRET) {
    if (!warnedNoSecret) {
      warnedNoSecret = true;
      console.warn(
        "[abuse] SUBMISSION_TOKEN_SECRET (or SESSION_SECRET) is not set — rate-limit " +
          "identifiers are hashed but not keyed, so the digests are brute-forceable. " +
          "Set SUBMISSION_TOKEN_SECRET."
      );
    }
    return createHash("sha256").update(normalised).digest("hex");
  }

  return createHmac("sha256", IDENTIFIER_SECRET).update(normalised).digest("hex");
}

export interface RateLimitRule {
  /** What is being limited: "practitioner:ip", "practitioner:email". */
  kind: string;
  /** The raw identifier. Hashed before it touches the database. */
  identifier: string;
  limit: number;
  windowSeconds: number;
}

/**
 * Counts a hit and reports whether the caller is over the limit.
 *
 * One statement: the upsert resets the window and returns the post-increment
 * count atomically, so two concurrent requests can't both read "1" and both
 * decide they're fine.
 */
async function hit(rule: RateLimitRule): Promise<{ over: boolean; count: number }> {
  const keyHash = identifierKey(rule.kind, rule.identifier);

  try {
    const db = getDb();
    const result: any = await db.execute(sql`
      INSERT INTO submission_throttle (key_hash, kind, hits, window_start, expires_at)
      VALUES (
        ${keyHash},
        ${rule.kind},
        1,
        now(),
        now() + (${rule.windowSeconds} || ' seconds')::interval
      )
      ON CONFLICT (key_hash) DO UPDATE SET
        hits = CASE
          WHEN submission_throttle.expires_at < now() THEN 1
          ELSE submission_throttle.hits + 1
        END,
        window_start = CASE
          WHEN submission_throttle.expires_at < now() THEN now()
          ELSE submission_throttle.window_start
        END,
        expires_at = CASE
          WHEN submission_throttle.expires_at < now()
          THEN now() + (${rule.windowSeconds} || ' seconds')::interval
          ELSE submission_throttle.expires_at
        END
      RETURNING hits
    `);

    const rows = result?.rows ?? result ?? [];
    const count = Number(rows[0]?.hits ?? 0);
    return { over: count > rule.limit, count };
  } catch (error: any) {
    const message: string = error?.message ?? String(error);

    if (/submission_throttle.*does not exist|relation .* does not exist/i.test(message)) {
      console.error(
        "[abuse] submission_throttle is missing — rate limiting is DISABLED. " +
          "Apply migrations/0001_submission_throttle.sql (or run npm run db:push)."
      );
    } else {
      // Fails open, loudly. See the header note.
      console.error("[abuse] rate limit check failed (allowing request):", message);
    }
    return { over: false, count: 0 };
  }
}

/**
 * Drops expired counters.
 *
 * Sampled rather than scheduled: one in fifty submissions pays for the sweep,
 * which keeps the table small without a cron job for a handful of rows. Errors
 * are swallowed — failing to tidy up must never fail a submission.
 */
async function sweepExpired(): Promise<void> {
  if (Math.random() > 0.02) return;
  try {
    await getDb().execute(sql`DELETE FROM submission_throttle WHERE expires_at < now()`);
  } catch {
    /* tidy-up only */
  }
}

/**
 * Applies several rules and fails on the first one exceeded.
 *
 * Every rule is still counted even after one trips, so a caller can't dodge
 * the per-email limit by tripping the per-IP one first.
 */
export async function checkRateLimits(rules: RateLimitRule[]): Promise<GuardFailure | null> {
  const results = await Promise.all(rules.map(hit));
  void sweepExpired();

  const tripped = results.findIndex((r) => r.over);
  if (tripped === -1) return null;

  // The kind, never the identifier: this log line is the one place a raw IP
  // would otherwise leak back out of the system that took care not to store it.
  console.warn(
    `[abuse] rate limit tripped: ${rules[tripped].kind} (${results[tripped].count} in ${rules[tripped].windowSeconds}s)`
  );
  return {
    status: 429,
    error: "That's a few too many submissions in a short window. Please try again later.",
    reason: "throttled",
  };
}

/* ==================================================================== *
 * 4 · Turnstile
 * ==================================================================== */

export function isTurnstileConfigured(): boolean {
  return Boolean(TURNSTILE_SECRET);
}

/**
 * Verifies a Cloudflare Turnstile token.
 *
 * Unconfigured is the interesting case:
 *   production      → refuse. An unprotected public write endpoint is not
 *                     something to ship by accident.
 *   non-production  → allow, with a loud warning, so local development and
 *                     previews don't need Cloudflare credentials.
 */
export async function verifyTurnstile(
  token: unknown,
  ip: string
): Promise<GuardFailure | null> {
  if (!TURNSTILE_SECRET) {
    if (IS_PRODUCTION) {
      console.error(
        "[abuse] TURNSTILE_SECRET_KEY is not set in production — REFUSING public submissions. " +
          "Set TURNSTILE_SECRET_KEY (server) and VITE_TURNSTILE_SITE_KEY (client) to open the funnel."
      );
      return {
        status: 503,
        error:
          "Submissions are temporarily unavailable. Please try again shortly, or email us directly.",
        reason: "challenge",
      };
    }
    console.warn("[abuse] TURNSTILE_SECRET_KEY unset — skipping challenge (non-production only).");
    return null;
  }

  if (typeof token !== "string" || !token) {
    return {
      status: 400,
      error: "Please complete the verification check and try again.",
      reason: "challenge",
    };
  }

  try {
    const body = new URLSearchParams({ secret: TURNSTILE_SECRET, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      // A hung verification must not hold a function open for its full timeout.
      signal: AbortSignal.timeout(8000),
    });

    const result: { success?: boolean; "error-codes"?: string[] } = await response.json();
    if (result.success) return null;

    console.warn("[abuse] Turnstile rejected:", result["error-codes"]?.join(", ") ?? "unknown");
    return {
      status: 400,
      error: "That verification check didn't pass. Please refresh and try again.",
      reason: "challenge",
    };
  } catch (error: any) {
    /**
     * Cloudflare unreachable. Fails CLOSED, matching the configured-and-broken
     * posture elsewhere: if we cannot tell a human from a bot, we do not write
     * to the queue.
     */
    console.error("[abuse] Turnstile verification error (refusing):", error?.message ?? error);
    return {
      status: 503,
      error: "We couldn't complete the verification check. Please try again shortly.",
      reason: "challenge",
    };
  }
}

/* ==================================================================== *
 * 5 · Honeypot
 * ==================================================================== */

/**
 * A field people leave blank and bots fill in.
 *
 * Returns a failure the caller is expected to answer with a *success* response
 * — a bot that learns which submissions were rejected learns how to get past
 * this, and the field costs nothing to keep working.
 */
export function checkHoneypot(value: unknown): GuardFailure | null {
  if (typeof value === "string" && value.trim()) {
    return { status: 200, error: "", reason: "honeypot" };
  }
  return null;
}
