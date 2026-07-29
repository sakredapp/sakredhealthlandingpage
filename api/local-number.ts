import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "./_lib/auth.js";

/**
 * Resolves the visitor's local texting number (DID) from their state so the
 * number they text matches the local number the CRM will call/text them from.
 *
 * Vercel injects the visitor's geo on every request:
 *   x-vercel-ip-country          -> "US"
 *   x-vercel-ip-country-region   -> USPS/ISO state code, e.g. "TX"
 *
 * Fill STATE_DIDS from the CRM (one number per state + DC) and set
 * GENERAL_NUMBER for the fallback. All numbers in E.164, e.g. "+15125550142".
 * Until they're populated the endpoint returns number: null, which keeps the
 * "Text us" button in its safe /get-coverage fallback.
 */
const STATE_DIDS: Record<string, string> = {
  // AL: "+1...", AK: "+1...", AZ: "+1...", ... TX: "+1...", DC: "+1...",
};

const GENERAL_NUMBER = ""; // e.g. "+18005550142"

function formatUS(e164: string): string {
  const m = e164.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const country = String(req.headers["x-vercel-ip-country"] || "").toUpperCase();
  const region = String(req.headers["x-vercel-ip-country-region"] || "").toUpperCase();

  const local = country === "US" && STATE_DIDS[region] ? STATE_DIDS[region] : "";
  const number = local || GENERAL_NUMBER;

  // Per-visitor geo — never let the shared CDN cache one region's answer for all.
  res.setHeader("Cache-Control", "private, no-store");
  return res.json({
    number: number || null,
    display: number ? formatUS(number) : null,
    region: region || null,
    source: local ? "local" : number ? "general" : "none",
  });
}
