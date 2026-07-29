import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "./_lib/auth.js";

/**
 * Per-product lead forwarder.
 *
 * SECURITY: the CRM campaign slug self-authenticates the webhook, so it's a
 * credential — it lives ONLY in server env vars here, never in client code.
 * The browser sends the public product id (`product`); we map it to the real
 * campaign slug server-side and POST from the backend. No x-webhook-secret is
 * needed — the slug is the auth.
 *
 * Set these env vars in Vercel (values from the CRM dev). Only configured
 * products accept form leads; unconfigured ones return 503 so the UI can tell
 * the visitor to text/call instead (no lead is silently dropped):
 *   CRM_CAMPAIGN_MORTGAGE_PROTECTION
 *   CRM_CAMPAIGN_HEALTH_INSURANCE
 *   CRM_CAMPAIGN_FINAL_EXPENSE        (when the CRM adds it)
 *   CRM_CAMPAIGN_LIFE_INSURANCE       (when the CRM adds it)
 *   CRM_CAMPAIGN_RETIREMENT_ANNUITIES (when the CRM adds it)
 */
const CRM_LEADS_URL = "https://www.sakredcrm.com/api/webhooks/leads";

const CAMPAIGN_ENV: Record<string, string> = {
  "mortgage-protection": "CRM_CAMPAIGN_MORTGAGE_PROTECTION",
  "health-insurance": "CRM_CAMPAIGN_HEALTH_INSURANCE",
  "final-expense": "CRM_CAMPAIGN_FINAL_EXPENSE",
  "life-insurance": "CRM_CAMPAIGN_LIFE_INSURANCE",
  "retirement-annuities": "CRM_CAMPAIGN_ANNUITY",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = (req.body || {}) as Record<string, unknown>;

    const product = String(body.product || "").trim().toLowerCase();
    const envName = CAMPAIGN_ENV[product];
    if (!envName) return res.status(400).json({ error: "Unknown product" });

    const campaign = process.env[envName];
    if (!campaign) {
      // Campaign not wired up yet — tell the client to fall back to text/call.
      return res.status(503).json({
        error: "Online inquiries for this product aren't available yet — please text or call us.",
        unconfigured: true,
      });
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

    // SMS consent is REQUIRED on every intake — no lead is forwarded without a
    // real, checked consent box. This is our TCPA record. The form UI also
    // requires the checkbox; this is the server-side guarantee behind it.
    if (body.sms_consent !== true) {
      return res.status(400).json({ error: "SMS consent is required" });
    }

    // Forward everything the form sent (minus the product id) with core fields
    // normalized. Extra fields pass straight through; the CRM captures them.
    const { product: _omit, ...rest } = body;
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
      headers: { "Content-Type": "application/json" },
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
