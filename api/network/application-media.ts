/**
 * POST /api/network/application-media
 *
 * Application photos, uploaded through the server into the app's existing
 * private media store. No second bucket, no website media table.
 *
 *   browser (base64 image + upload token)
 *     ↓
 *   this route
 *     ↓  verify token → decode → strip metadata → resize → re-encode JPEG
 *     ↓
 *   private bucket: network-application-media/web/<submission_id>/<uuid>.jpg
 *     ↓
 *   attach_public_application_media(...)  →  health_submission_media
 *
 * ── Why the server touches the bytes ─────────────────────────────────
 *
 * A signed direct-to-storage URL would be less code and would hand an anonymous
 * caller a writable handle on a private bucket, together with whatever the
 * camera put in the file. Practitioner photos are frequently taken on a phone
 * inside the practice, which means the EXIF commonly carries GPS coordinates
 * and a device serial. Re-encoding here is what guarantees that never reaches
 * storage: sharp writes no metadata unless asked, so the output is pixels.
 *
 * `.rotate()` is called before resizing because dropping EXIF also drops the
 * orientation flag — without it, half the phone uploads would arrive sideways.
 *
 * ── What this endpoint cannot do ─────────────────────────────────────
 *
 * It cannot publish. Media arrives `approved = false` and stays there until an
 * admin selects it. It cannot attach to an arbitrary submission — the token is
 * scoped to one id. It cannot read anything back: there is no GET.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import sharp from "sharp";
import { setCorsHeaders } from "../_lib/auth.js";
import { checkPayloadSize, checkRateLimits, clientIp } from "../_lib/abuse.js";
import { verifyUploadToken } from "../_lib/upload-token.js";
import { attachApplicationMedia, mediaStoragePath } from "../_lib/network-intake.js";
import { writeClient, APPLICATION_MEDIA_BUCKET } from "../_lib/network-clients.js";
import {
  LIMITS,
  MEDIA_MAX_BYTES,
  type MediaKind,
} from "../../shared/network-submissions.js";

/** Longest edge, pixels. A reviewer needs to see the room, not print it. */
const MAX_EDGE = 1600;
const JPEG_QUALITY = 82;

const KINDS: MediaKind[] = ["headshot", "logo", "practice"];

export const config = {
  api: {
    // The default 1MB body parser would reject every real photo.
    bodyParser: { sizeLimit: "18mb" },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = clientIp(req);

  const tooLarge = checkPayloadSize(req.body, LIMITS.mediaRequestBytes);
  if (tooLarge) {
    return res.status(tooLarge.status).json({ error: "That image is too large. Please send one under 12MB." });
  }

  const { token, kind, data } = (req.body ?? {}) as {
    token?: unknown;
    kind?: unknown;
    data?: unknown;
  };

  /**
   * Token first, before any work. An invalid token must cost an attacker a
   * round trip and cost us a string comparison — not an image decode.
   */
  const check = verifyUploadToken(token);
  if (!check.ok || !check.submissionId) {
    if (check.reason === "unconfigured") {
      console.error(
        "[application-media] SUBMISSION_TOKEN_SECRET is not set — uploads are disabled."
      );
      return res.status(503).json({ error: "Photo uploads are unavailable right now." });
    }
    return res.status(403).json({
      error:
        check.reason === "expired"
          ? "That upload link has expired. Please resubmit the form to upload photos."
          : "That upload link isn't valid.",
    });
  }

  if (typeof kind !== "string" || !KINDS.includes(kind as MediaKind)) {
    return res.status(400).json({ error: "Unknown image type." });
  }
  if (typeof data !== "string" || !data) {
    return res.status(400).json({ error: "No image received." });
  }

  // Keyed on the submission, not the IP: several practitioners behind one
  // clinic NAT should not throttle each other, and the token already binds
  // this request to one application.
  const throttled = await checkRateLimits([
    { kind: "media:submission", identifier: check.submissionId, limit: 12, windowSeconds: 3600 },
    { kind: "media:ip", identifier: ip, limit: 40, windowSeconds: 3600 },
  ]);
  if (throttled) return res.status(throttled.status).json({ error: throttled.error });

  const raw = decodeImage(data);
  if (!raw) return res.status(400).json({ error: "That file isn't a readable image." });
  if (raw.byteLength > MEDIA_MAX_BYTES) {
    return res.status(413).json({ error: "That image is too large. Please send one under 12MB." });
  }

  let jpeg: Buffer;

  try {
    const pipeline = sharp(raw, { failOn: "error" })
      // Applies the EXIF orientation flag while we still have it, because the
      // re-encode below deliberately throws that metadata away.
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true });

    const output = await pipeline.toBuffer({ resolveWithObject: true });
    jpeg = output.data;
  } catch (error: any) {
    // Includes decompression-bomb rejections, which sharp raises by default.
    console.warn("[application-media] rejected an unreadable image:", error?.message ?? error);
    return res.status(400).json({ error: "We couldn't process that image. Please try another." });
  }

  const db = writeClient();
  if (!db) return res.status(503).json({ error: "Photo uploads are unavailable right now." });

  const path = mediaStoragePath(check.submissionId);

  const { error: uploadError } = await db.storage
    .from(APPLICATION_MEDIA_BUCKET)
    .upload(path, jpeg, {
      contentType: "image/jpeg",
      // Never overwrite: a fresh uuid per upload means a collision would mean
      // something is very wrong, and silently replacing a file is not the way
      // to find out.
      upsert: false,
    });

  if (uploadError) {
    console.error("[application-media] upload failed:", uploadError.message);
    return res.status(502).json({ error: "We couldn't store that image. Please try again." });
  }

  /* The attach function takes the path and nothing else about the file. Byte
     size and dimensions are readable from the object that is already in
     storage, and a caller asserting them would be a claim rather than a fact. */
  const attached = await attachApplicationMedia({
    submissionId: check.submissionId,
    kind: kind as MediaKind,
    path,
  });

  if (!attached.ok) {
    /**
     * The bytes are in private storage but no row points at them, so no admin
     * will ever see the file. Remove it rather than leave an orphan in a bucket
     * nobody audits.
     */
    await db.storage.from(APPLICATION_MEDIA_BUCKET).remove([path]).catch(() => {});
    console.error("[application-media] attach failed, uploaded object removed:", path);
    return res.status(502).json({ error: "We couldn't attach that image. Please try again." });
  }

  return res.json({ ok: true, kind, path });
}

/**
 * Base64 in, bytes out.
 *
 * Accepts a bare base64 string or a `data:` URL, and refuses anything that
 * isn't an image MIME type. The content type is not trusted beyond this point —
 * sharp decides what the file actually is.
 */
function decodeImage(input: string): Buffer | null {
  // `[\s\S]` rather than `.` with the /s flag: the repo's tsconfig has no
  // `target`, so it compiles as ES5 and rejects the flag.
  const match = input.match(/^data:([^;,]+);base64,([\s\S]*)$/);
  const payload = match ? match[2] : input;

  if (match && !/^image\//i.test(match[1])) return null;

  try {
    const buffer = Buffer.from(payload, "base64");
    return buffer.byteLength ? buffer : null;
  } catch {
    return null;
  }
}
