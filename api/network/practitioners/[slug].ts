/**
 * GET /api/network/practitioners/:slug — one published practitioner and the
 * locations they practise from.
 *
 * Same 404-vs-503 split as the location route: "not published" and "cannot
 * check" must never collapse into the same answer.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../../_lib/auth.js";
import { getPractitionerBySlug, isNetworkConfigured } from "../../_lib/health-network.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const raw = req.query.slug;
  const slug = Array.isArray(raw) ? raw[0] : raw;
  if (!slug) return res.status(400).json({ error: "Missing slug" });

  if (!isNetworkConfigured()) {
    return res.status(503).json({ error: "Network unavailable", available: false });
  }

  try {
    const practitioner = await getPractitionerBySlug(slug);
    if (!practitioner) return res.status(404).json({ error: "Not found" });

    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    return res.json({ practitioner, available: true });
  } catch (error) {
    console.error("[network/practitioners] failed:", error);
    return res.status(500).json({ error: "Failed to load practitioner" });
  }
}
