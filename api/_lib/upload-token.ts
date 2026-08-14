/**
 * Short-lived upload tokens for anonymous application media.
 *
 * The problem: a website applicant has no account, so there is no session to
 * prove "this upload belongs to that application". Without something, the media
 * endpoint would accept `{submissionId, image}` from anyone — and a submission
 * id is a UUID, which is unguessable but not secret, and gets logged, emailed
 * and pasted into support threads.
 *
 * So the practitioner-application route mints a token bound to the submission
 * it just created, and the media route accepts nothing else. The token is:
 *
 *   - HMAC-signed with a server secret (never leaves the server)
 *   - scoped to one submission id
 *   - valid for 30 minutes — long enough to pick photos, short enough that a
 *     token from a shared screenshot is dead by the time anyone tries it
 *   - useless for anything except attaching media to that one row
 *
 * It confers no read access. There is no endpoint that will hand back a
 * submission, or its media, in exchange for one.
 *
 * ── Fails closed ─────────────────────────────────────────────────────
 *
 * No secret configured means no tokens are minted, which means the upload step
 * is not offered and the form tells the applicant to email their photos. An
 * unauthenticated write path into a private bucket is not something to enable
 * by accident.
 */
import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.SUBMISSION_TOKEN_SECRET || process.env.SESSION_SECRET || "";

/** Minutes. Generous for a slow phone upload, short for a leaked token. */
const TTL_MS = 30 * 60_000;

export const isUploadTokenConfigured = (): boolean => Boolean(SECRET);

const b64url = (input: Buffer | string): string =>
  Buffer.from(input).toString("base64url");

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

/**
 * Mints a token for a submission.
 *
 * Returns null when unconfigured — callers must treat that as "uploads are not
 * available", not as "uploads are open".
 */
export function mintUploadToken(submissionId: string, now = Date.now()): string | null {
  if (!SECRET) return null;
  const payload = b64url(JSON.stringify({ s: submissionId, e: now + TTL_MS }));
  return `${payload}.${sign(payload)}`;
}

export interface TokenCheck {
  ok: boolean;
  submissionId?: string;
  reason?: "unconfigured" | "malformed" | "bad_signature" | "expired";
}

/**
 * Verifies a token and returns the submission it is scoped to.
 *
 * Signature first, then expiry: checking expiry on an unverified payload would
 * mean trusting an attacker-supplied timestamp to decide whether to trust an
 * attacker-supplied token.
 */
export function verifyUploadToken(token: unknown, now = Date.now()): TokenCheck {
  if (!SECRET) return { ok: false, reason: "unconfigured" };
  if (typeof token !== "string" || !token) return { ok: false, reason: "malformed" };

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return { ok: false, reason: "malformed" };

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return { ok: false, reason: "bad_signature" };
  }

  try {
    const { s, e } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof s !== "string" || typeof e !== "number") return { ok: false, reason: "malformed" };
    if (e < now) return { ok: false, reason: "expired" };
    return { ok: true, submissionId: s };
  } catch {
    return { ok: false, reason: "malformed" };
  }
}
