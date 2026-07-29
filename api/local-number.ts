import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "./_lib/auth.js";

/**
 * Resolves the visitor's local texting number (DID) so the number they text
 * matches the local number the CRM will call/text them from.
 *
 * Numbers are pulled LIVE from the CRM (per CRM dev): the CRM swaps burned
 * numbers on their side, so we never redeploy for a number change. Response
 * shape: { "numbers": { "TX": "+13252991182", "OH": "+12163698215", ... } }.
 *
 * State resolution:
 *   - ?state=TX  -> explicit (state landing pages pass their own state)
 *   - otherwise  -> Vercel geo header (x-vercel-ip-country-region) for US visitors
 *
 * Until the CRM endpoint is live this returns number: null and the "Text us"
 * button keeps its /get-coverage fallback — nothing ships broken.
 */
const NUMBERS_URL = "https://www.sakredcrm.com/api/landing-numbers";
const TTL_MS = 5 * 60 * 1000; // CRM caches 5 min; mirror it.

let cache: { at: number; numbers: Record<string, string> } | null = null;

async function getNumbers(): Promise<Record<string, string>> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.numbers;
  try {
    const r = await fetch(NUMBERS_URL, { headers: { accept: "application/json" } });
    if (!r.ok) throw new Error(`landing-numbers ${r.status}`);
    const data = (await r.json()) as { numbers?: Record<string, string> };
    const numbers = data?.numbers ?? {};
    cache = { at: Date.now(), numbers };
    return numbers;
  } catch (err) {
    console.error("local-number: failed to fetch CRM numbers", err);
    return cache?.numbers ?? {}; // serve stale if we have it, else empty
  }
}

function formatUS(e164: string): string {
  const m = e164.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const stateParam = String(
    Array.isArray(req.query.state) ? req.query.state[0] : req.query.state || "",
  ).toUpperCase();
  const country = String(req.headers["x-vercel-ip-country"] || "").toUpperCase();
  const region = String(req.headers["x-vercel-ip-country-region"] || "").toUpperCase();

  const state = stateParam || (country === "US" ? region : "");
  const numbers = await getNumbers();
  const number = state && numbers[state] ? numbers[state] : "";

  // Per-visitor / per-state — never let the shared CDN cache one answer for all.
  res.setHeader("Cache-Control", "private, no-store");
  return res.json({
    number: number || null,
    display: number ? formatUS(number) : null,
    state: state || null,
    source: number ? (stateParam ? "state" : "geo") : "none",
  });
}
