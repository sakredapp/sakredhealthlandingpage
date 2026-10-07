import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkEmail, checkPhone, visitorIp } from "./_lib/lead-check.js";

/**
 * The browser's door to the real-time lead check (owner GO 2026-10-07).
 *
 *   POST /api/lead-check?product=<id>&check=email   { email }
 *   POST /api/lead-check?product=<id>&check=phone   { phone }
 *
 * Same-origin, the campaign slug is attached server-side from the product id,
 * and no key lives on this site. Answers carry only what the form shows.
 * Every failure is "accepted".
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const product = String(req.query.product || "");
  const check = String(req.query.check || "");
  const body = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const ip = visitorIp(req.headers);

  if (check === "email") {
    const email = typeof body.email === "string" ? body.email : "";
    return res.status(200).json(await checkEmail(product, email, 3500, ip));
  }
  if (check === "phone") {
    const phone = typeof body.phone === "string" ? body.phone : "";
    const r = await checkPhone(product, phone, 5000, ip);
    return res.status(200).json({
      valid: r.valid,
      ...(r.message ? { message: r.message } : {}),
      ...(r.pending ? { pending: true } : {}),
      ...(r.blocking === false ? { blocking: false } : {}),
    });
  }
  return res.status(400).json({ error: "Unknown check" });
}
