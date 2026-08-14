/**
 * GET /api/network/locations/:slug — one published practice, plus the handful
 * of nearby practices its page rails on.
 *
 * 404 and "network unavailable" are different answers and get different status
 * codes: a 404 means we looked and this practice is not published; a 503 means
 * we could not look. The page renders a different thing for each, and a
 * crawler must not be told a URL is permanently gone because of a missing
 * connection string.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../../_lib/auth.js";
import {
  getLocationBySlug,
  getNearbyLocations,
  isNetworkConfigured,
} from "../../_lib/health-network.js";

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
    const location = await getLocationBySlug(slug);
    if (!location) return res.status(404).json({ error: "Not found" });

    const nearby = await getNearbyLocations(location, 3);

    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    return res.json({ location, nearby, available: true });
  } catch (error) {
    console.error("[network/locations] failed:", error);
    return res.status(500).json({ error: "Failed to load location" });
  }
}
