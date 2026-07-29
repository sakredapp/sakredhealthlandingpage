import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "./_lib/auth.js";

/**
 * Per-product lead forwarder. The product is set by the CRM CAMPAIGN SLUG in
 * the webhook URL (never a product_intent field). We forward server-side so the
 * webhook secret never touches the browser.
 *
 * POST body: { campaign, first_name, last_name, phone, email, state, ...extra }
 * Extra fields (zip, city, date_of_birth/age, coverage_amount, notes,
 * trustedform_cert_url, jornaya_lead_id, ...) are passed through — the CRM
 * captures anything extra automatically.
 */
const CRM_LEADS_URL = "https://www.sakredcrm.com/api/webhooks/leads";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const webhookSecret = process.env.CRM_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CRM_WEBHOOK_SECRET is not set");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const body = (req.body || {}) as Record<string, unknown>;

    // Campaign slug is what tells the CRM the product. Keep it URL-safe.
    const campaign = String(body.campaign || "").trim().toLowerCase();
    if (!/^[a-z0-9-]{2,40}$/.test(campaign)) {
      return res.status(400).json({ error: "Missing or invalid campaign" });
    }

    const first = String(body.first_name || "").trim();
    const last = String(body.last_name || "").trim();
    const email = String(body.email || "").trim();
    const state = String(body.state || "").trim().toUpperCase();
    const phone = String(body.phone || "").replace(/\D/g, "");

    if (!first) return res.status(400).json({ error: "First name is required" });
    if (!last) return res.status(400).json({ error: "Last name is required" });
    if (phone.length !== 10) return res.status(400).json({ error: "A valid 10-digit phone is required" });
    if (!email.includes("@")) return res.status(400).json({ error: "A valid email is required" });
    if (!/^[A-Z]{2}$/.test(state)) return res.status(400).json({ error: "State is required" });
    if (body.sms_consent !== true) return res.status(400).json({ error: "SMS consent is required" });

    // Forward everything the form sent (minus campaign, which goes in the URL),
    // normalizing the core fields. Extra fields pass straight through.
    const { campaign: _omit, ...rest } = body;
    const payload = {
      ...rest,
      first_name: first,
      last_name: last,
      phone,
      email,
      state,
      sms_consent: true,
      form_consent_source: "sakred_health_landing_page",
      form_consent_timestamp: new Date().toISOString(),
    };

    const url = `${CRM_LEADS_URL}?campaign=${encodeURIComponent(campaign)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-webhook-secret": webhookSecret },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("CRM lead webhook error:", response.status, text);
      return res.status(502).json({ error: "Failed to submit. Please try again." });
    }

    const result = await response.json().catch(() => ({}));
    return res.status(200).json({ success: true, prospect_id: result.prospect_id ?? null });
  } catch (err) {
    console.error("product-lead error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
