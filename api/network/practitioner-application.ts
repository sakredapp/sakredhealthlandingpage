/**
 * POST /api/network/practitioner-application
 *
 * The public practitioner intake boundary.
 *
 *   browser
 *     ↓
 *   this server route          ← the only thing the browser can call
 *     ↓
 *   payload cap → honeypot → rate limit → Turnstile → validation
 *     ↓
 *   canonical intake RPC / health_network_submissions
 *
 * The browser never talks to Supabase and never sees a key. There is no
 * anonymous SECURITY DEFINER RPC exposed to the internet — the app's intake
 * function is reached only from here, server-side, after every check has run.
 *
 * Nothing in the request body can influence provenance, status, verification,
 * publication, matched IDs or admin fields: this route builds a validated DTO
 * and hands that to the intake module, which constructs the record field by
 * field. See the header of `api/_lib/network-intake.ts`.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { setCorsHeaders } from "../_lib/auth.js";
import {
  checkHoneypot,
  checkPayloadSize,
  checkRateLimits,
  clientIp,
  verifyTurnstile,
} from "../_lib/abuse.js";
import { submitPractitionerApplication } from "../_lib/network-intake.js";
import { mintUploadToken } from "../_lib/upload-token.js";
import { LIMITS } from "../../shared/network-submissions.js";

/* ==================================================================== *
 * Validation
 * ==================================================================== */

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal("")).transform((v) => v || undefined);

/** A URL we're willing to store. http(s) only — no `javascript:`, no `data:`. */
const optionalUrl = z
  .string()
  .trim()
  .max(LIMITS.url)
  .optional()
  .or(z.literal(""))
  .transform((v) => v || undefined)
  .refine((v) => !v || /^https?:\/\//i.test(v), {
    message: "Links must start with http:// or https://",
  });

const credentialSchema = z.object({
  credentialType: z.string().trim().min(1).max(LIMITS.shortText),
  number: optionalText(LIMITS.shortText),
  region: optionalText(LIMITS.shortText),
  issuingBoard: optionalText(LIMITS.shortText),
  expiresOn: optionalText(32),
  verificationUrl: optionalUrl,
});

/**
 * Social profiles.
 *
 * An object, not a free array: the reviewer wants to know which network a link
 * belongs to without parsing it, and a state-board registry page is worth
 * considerably more to a credential check than an Instagram.
 */
const socialSchema = z
  .object({
    instagram: optionalUrl,
    facebook: optionalUrl,
    linkedin: optionalUrl,
    youtube: optionalUrl,
    directory: optionalUrl,
    other: optionalUrl,
  })
  .partial()
  .optional();

const schema = z.object({
  /* 1 · about you */
  fullName: z.string().trim().min(2).max(LIMITS.name),
  submitterRole: z.enum(["practitioner", "practice_staff", "owner", "other"]).optional(),
  professionalTitle: optionalText(LIMITS.shortText),
  designations: optionalText(LIMITS.shortText),
  email: z.string().trim().email().max(LIMITS.email),
  phone: optionalText(LIMITS.shortText),
  personalWebsite: optionalUrl,

  /* 2 · your practice */
  practiceName: optionalText(LIMITS.name),
  addressLine1: optionalText(LIMITS.shortText),
  city: optionalText(LIMITS.shortText),
  region: optionalText(LIMITS.shortText),
  postalCode: optionalText(32),
  country: optionalText(LIMITS.shortText),
  practicePhone: optionalText(LIMITS.shortText),
  practiceWebsite: optionalUrl,
  bookingUrl: optionalUrl,

  /* 3 · how you practise */
  modalities: z.array(z.string().trim().max(80)).max(LIMITS.modalities).default([]),
  otherModality: optionalText(LIMITS.shortText),

  /* 4 · credentials */
  credentials: z.array(credentialSchema).max(LIMITS.credentials).default([]),

  /* 5 · about your work — research input only. Never Sakred's voice. */
  professionalBio: optionalText(LIMITS.longText),
  whyBelongs: optionalText(LIMITS.longText),
  approachToCare: optionalText(LIMITS.longText),

  /* 6 · links. Photos are a separate, token-scoped upload — see
     api/network/application-media.ts. Nothing about media is accepted here,
     so nothing here can name a file the applicant doesn't own. */
  socialLinks: socialSchema,

  /* 7 · consent — the one box that is genuinely required */
  consentAuthorised: z.literal(true, {
    errorMap: () => ({ message: "Please confirm you're authorised to submit this information." }),
  }),

  /* anti-abuse */
  turnstileToken: z.string().max(4000).optional(),
  website_url: z.string().max(200).optional(),
});

/* ==================================================================== *
 * Handler
 * ==================================================================== */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = clientIp(req);

  const tooLarge = checkPayloadSize(req.body, LIMITS.requestBytes);
  if (tooLarge) return res.status(tooLarge.status).json({ error: tooLarge.error });

  const parsed = schema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({
      error: "Please check the highlighted fields and try again.",
      details: parsed.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }

  const input = parsed.data;

  // Answered with a 200 on purpose — a bot that can tell it was caught can
  // iterate until it isn't.
  if (checkHoneypot(input.website_url)) {
    console.warn("[practitioner-application] honeypot tripped, dropping submission");
    return res.json({ ok: true });
  }

  /**
   * Two windows. The per-IP one stops a single source flooding the queue; the
   * per-email one stops the same practitioner double-submitting an application
   * a reviewer then has to de-duplicate by hand.
   */
  const throttled = await checkRateLimits([
    { kind: "practitioner:ip", identifier: ip, limit: 5, windowSeconds: 3600 },
    { kind: "practitioner:email", identifier: input.email, limit: 3, windowSeconds: 86_400 },
  ]);
  if (throttled) return res.status(throttled.status).json({ error: throttled.error });

  const challenge = await verifyTurnstile(input.turnstileToken, ip);
  if (challenge) return res.status(challenge.status).json({ error: challenge.error });

  const result = await submitPractitionerApplication(
    {
      fullName: input.fullName,
      submitterRole: input.submitterRole,
      professionalTitle: input.professionalTitle,
      designations: input.designations,
      email: input.email,
      phone: input.phone,
      personalWebsite: input.personalWebsite,
      practiceName: input.practiceName,
      addressLine1: input.addressLine1,
      city: input.city,
      region: input.region,
      postalCode: input.postalCode,
      country: input.country,
      practicePhone: input.practicePhone,
      practiceWebsite: input.practiceWebsite,
      bookingUrl: input.bookingUrl,
      modalities: input.modalities,
      otherModality: input.otherModality,
      credentials: input.credentials,
      professionalBio: input.professionalBio,
      whyBelongs: input.whyBelongs,
      approachToCare: input.approachToCare,
      socialLinks: input.socialLinks,
      consentAuthorised: input.consentAuthorised,
    },
    { ip, userAgent: String(req.headers["user-agent"] ?? "").slice(0, 300) }
  );

  if (result.ok) {
    /**
     * The upload token is minted only when the queue handed back a real row id.
     * No id means the photo step is not offered at all — better than showing an
     * upload box that quietly attaches files to nothing.
     */
    const uploadToken = result.submissionId ? mintUploadToken(result.submissionId) : null;

    if (result.submissionId && !uploadToken) {
      console.warn(
        "[practitioner-application] no SUBMISSION_TOKEN_SECRET — photo uploads not offered."
      );
    }
    return res.json({ ok: true, uploadToken: uploadToken ?? undefined });
  }

  if (result.reason === "unavailable") {
    /**
     * The queue is unreachable and this application is about to be lost.
     * Log enough to follow up by hand — but mask credential numbers: a licence
     * number sitting in a log aggregator is a liability, and the name and
     * email are enough to ask the applicant to resubmit.
     */
    console.error(
      "[practitioner-application] QUEUE UNREACHABLE — application not saved:",
      JSON.stringify({
        fullName: input.fullName,
        email: input.email,
        practiceName: input.practiceName,
        city: input.city,
        region: input.region,
        modalities: input.modalities,
        credentialTypes: input.credentials.map((c) => c.credentialType),
        credentialNumbers: "[redacted]",
      })
    );
    return res.status(503).json({
      error:
        "We can't record applications right now. Please try again shortly — nothing was saved.",
    });
  }

  if (result.reason === "source_unmigrated") {
    // The queue exists but doesn't recognise our provenance value. Refusing is
    // correct: the alternative is filing the row under a source that misleads
    // the person whose whole job is to weigh where it came from.
    return res.status(503).json({
      error:
        "We can't record applications right now. Please try again shortly — nothing was saved.",
    });
  }

  return res
    .status(500)
    .json({ error: "Something went wrong saving that. Please try again." });
}
