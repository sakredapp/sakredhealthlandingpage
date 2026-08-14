/**
 * POST /api/network/recommend
 *
 * "I know someone Sakred should look at."
 *
 * Same queue as the practitioner funnel, same protections, different
 * provenance — `public` rather than `practitioner`. Admin needs to see which it
 * is at a glance, because a stranger's tip and a practice describing itself
 * need completely different research.
 *
 * `public`, specifically, and not `member`: the person filling this in is an
 * anonymous website visitor, and the app's `member` source means an
 * authenticated Sakred member vouched for someone. Collapsing the two would
 * inflate the trust signal on exactly the rows that deserve it least. See the
 * additive enum migration in docs/health-network-app-contract.md.
 *
 *   browser → this route → payload cap → honeypot → rate limit → Turnstile
 *           → validation → canonical queue
 *
 * Anonymous callers can reach this endpoint. They still cannot write to any
 * canonical provider table: this route can only produce a submission with
 * status "new", and nothing in the body influences that.
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
import { submitRecommendation } from "../_lib/network-intake.js";
import { LIMITS } from "../../shared/network-submissions.js";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal("")).transform((v) => v || undefined);

const schema = z.object({
  kind: z.enum(["practitioner", "location"]),
  name: z.string().trim().min(2).max(LIMITS.name),
  city: optionalText(LIMITS.shortText),
  link: z
    .string()
    .trim()
    .max(LIMITS.url)
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined)
    .refine((v) => !v || /^https?:\/\//i.test(v), {
      message: "Links must start with http:// or https://",
    }),
  modality: optionalText(80),
  reason: optionalText(LIMITS.longText),
  submitterEmail: z
    .string()
    .trim()
    .email()
    .max(LIMITS.email)
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),

  turnstileToken: z.string().max(4000).optional(),
  website_url: z.string().max(200).optional(),
});

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
      error: "Please check the form and try again.",
      details: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  const input = parsed.data;

  if (checkHoneypot(input.website_url)) {
    console.warn("[recommend] honeypot tripped, dropping submission");
    return res.json({ ok: true });
  }

  /* Looser than the practitioner funnel: recommending several practitioners in
     one sitting is a good thing for the network, not suspicious. */
  const throttled = await checkRateLimits([
    { kind: "recommend:ip", identifier: ip, limit: 12, windowSeconds: 3600 },
  ]);
  if (throttled) return res.status(throttled.status).json({ error: throttled.error });

  const challenge = await verifyTurnstile(input.turnstileToken, ip);
  if (challenge) return res.status(challenge.status).json({ error: challenge.error });

  const result = await submitRecommendation(
    {
      kind: input.kind,
      name: input.name,
      city: input.city,
      link: input.link,
      modality: input.modality,
      reason: input.reason,
      submitterEmail: input.submitterEmail,
    },
    { ip, userAgent: String(req.headers["user-agent"] ?? "").slice(0, 300) }
  );

  if (result.ok) return res.json({ ok: true });

  if (result.reason === "unavailable" || result.reason === "source_unmigrated") {
    /**
     * Recoverable from logs: someone took the trouble to send this, and telling
     * them "saved" when it wasn't is worse than asking them to retry. The
     * submitter's email is omitted — the practice name and city are what make
     * the tip re-enterable by hand.
     */
    console.warn(
      "[recommend] QUEUE UNREACHABLE — recommendation not saved:",
      JSON.stringify({
        kind: input.kind,
        name: input.name,
        city: input.city,
        link: input.link,
        modality: input.modality,
        hadSubmitterEmail: Boolean(input.submitterEmail),
      })
    );
    return res.status(503).json({
      error: "We can't record recommendations right now. Please try again shortly.",
    });
  }

  return res.status(500).json({ error: "Something went wrong saving that. Please try again." });
}
