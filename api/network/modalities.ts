/**
 * GET /api/network/modalities — the modality vocabulary, each with a count of
 * the published locations that carry it.
 *
 * The counts are what the site uses to decide which `/discover/<modality>`
 * pages are real (brief §8). A modality with zero published locations is
 * offered as a filter chip but is not linked as a destination and is not put
 * in the sitemap.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../_lib/auth.js";
import { getModalitiesWithCounts, isNetworkConfigured } from "../_lib/health-network.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const modalities = await getModalitiesWithCounts();
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=86400");
    return res.json({ modalities, available: isNetworkConfigured() });
  } catch (error) {
    console.error("[network/modalities] failed:", error);
    return res.status(500).json({ error: "Failed to load modalities", modalities: [], available: false });
  }
}
