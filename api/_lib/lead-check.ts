/**
 * The real-time lead check, proxied to the CRM (owner GO 2026-10-07). Same
 * pattern as familyequityprotection#50 and brand-landers#19.
 *
 * Both checks ride the CRM's `/api/phone-validation` for the product's own
 * campaign: `?check=email` (MillionVerifier) and the plain phone lookup
 * (Telnyx). The CRM holds the keys, the cache, the policy AND the copy; this
 * module only carries the answer back. No key lives on this site.
 *
 * Fails open everywhere: no campaign, a timeout, a CRM error — the lead goes
 * through and nothing is shown.
 */

/** The Sakred CRM. Overridable only so a local build can point at a mock. */
export const CRM_BASE_URL = process.env.CRM_BASE_URL || "https://www.sakredcrm.com";

/**
 * Public product id (route slug) -> env names holding its CRM campaign slug,
 * tried in order. ACA falls back to the health campaign until the CRM stands
 * up a dedicated ACA campaign.
 */
export const CAMPAIGN_ENV: Record<string, string[]> = {
  "mortgage-protection": ["CRM_CAMPAIGN_MORTGAGE_PROTECTION"],
  "health-insurance": ["CRM_CAMPAIGN_HEALTH_INSURANCE"],
  "aca-plans": ["CRM_CAMPAIGN_ACA", "CRM_CAMPAIGN_HEALTH_INSURANCE"],
  "final-expense": ["CRM_CAMPAIGN_FINAL_EXPENSE"],
  "life-insurance": ["CRM_CAMPAIGN_LIFE_INSURANCE"],
  "retirement-annuities": ["CRM_CAMPAIGN_ANNUITY"],
};

/** The campaign slug for a product, or null when unknown / not configured. */
export function campaignFor(product: string): string | null {
  const names = CAMPAIGN_ENV[String(product || "").trim().toLowerCase()];
  if (!names) return null;
  return names.map((n) => process.env[n]).find(Boolean) ?? null;
}

export type EmailCheck = {
  result: "ok" | "invalid" | "typo" | "disposable" | "accepted";
  /** Present only when the visitor should look again. Server copy. */
  message?: string;
  /** The corrected address, when the fix is certain. */
  suggestion?: string;
};

export type PhoneCheck = {
  valid: boolean;
  /** Telnyx's vocabulary, for logs only — never shown to a visitor. */
  lineType?: string | null;
  /** Present only when invalid. Comes from the CRM — never write your own. */
  message?: string;
  /** True when we could not check at all and let the number through. */
  pending?: boolean;
  /**
   * False = the CRM's soft policy: `valid: false` is advice for the visitor,
   * never a reason to refuse the lead. Absent = the hard mobile-only gate.
   */
  blocking?: boolean;
  /** False = a landline: calls only, the CRM never texts it. */
  textable?: boolean;
};

const ACCEPT: EmailCheck = { result: "accepted" };
const ALLOW: PhoneCheck = { valid: true, pending: true };
const RESULTS = new Set(["ok", "invalid", "typo", "disposable", "accepted"]);

function crmUrl(campaign: string, check?: "email"): URL {
  const url = new URL("/api/phone-validation", CRM_BASE_URL);
  url.searchParams.set("campaign", campaign);
  if (check) url.searchParams.set("check", check);
  return url;
}

function headers(visitorIp?: string | null): Record<string, string> {
  return {
    "content-type": "application/json",
    // Name the visitor, or every visitor shares this server's IP in the CRM's
    // per-IP throttle.
    ...(visitorIp ? { "x-visitor-ip": visitorIp } : {}),
  };
}

export async function checkEmail(
  product: string,
  email: string,
  timeoutMs = 3500,
  visitorIp?: string | null,
): Promise<EmailCheck> {
  const campaign = campaignFor(product);
  if (!campaign || !email) return ACCEPT;
  try {
    const res = await fetch(crmUrl(campaign, "email"), {
      method: "POST",
      headers: headers(visitorIp),
      body: JSON.stringify({ email: email.trim().slice(0, 254) }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return ACCEPT;
    const data = (await res.json()) as Partial<EmailCheck>;
    if (!data || typeof data.result !== "string" || !RESULTS.has(data.result)) return ACCEPT;
    return {
      result: data.result,
      ...(typeof data.message === "string" && data.message ? { message: data.message } : {}),
      ...(typeof data.suggestion === "string" && data.suggestion ? { suggestion: data.suggestion } : {}),
    };
  } catch {
    return ACCEPT;
  }
}

export async function checkPhone(
  product: string,
  phone: string,
  timeoutMs = 5000,
  visitorIp?: string | null,
): Promise<PhoneCheck> {
  const campaign = campaignFor(product);
  if (!campaign || !phone) return ALLOW;
  try {
    const res = await fetch(crmUrl(campaign), {
      method: "POST",
      headers: headers(visitorIp),
      body: JSON.stringify({ phone: phone.slice(0, 40) }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return ALLOW;
    const data = (await res.json()) as PhoneCheck;
    // A malformed body is not a rejection. Only an explicit `valid: false`
    // stops a lead, and only when the CRM says it blocks.
    if (typeof data?.valid !== "boolean") return ALLOW;
    return data;
  } catch {
    return ALLOW;
  }
}

/** The visitor's IP from a Vercel request's headers. */
export function visitorIp(h: Record<string, string | string[] | undefined>): string | null {
  const fwd = h["x-forwarded-for"];
  const first = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(",")[0]?.trim();
  if (first) return first;
  const real = h["x-real-ip"];
  return (Array.isArray(real) ? real[0] : real) || null;
}
