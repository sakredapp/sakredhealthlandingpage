/**
 * GET /api/network/search — published locations for the map and /discover.
 *
 * Query parameters mirror `NetworkSearchParams`:
 *   q, city, modalities (comma separated slugs), verification,
 *   openNow, sameDay, walkIns, limit, and one of:
 *     bounds=south,west,north,east   (viewport search)
 *     lat & lng & radius             (proximity search, metres)
 *
 * Cached at the edge for a minute with a long stale window: the directory
 * changes on a publication event, not per request, and the map fires this
 * route on every "Search this area".
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../_lib/auth.js";
import { searchLocations } from "../_lib/health-network.js";
import {
  VERIFICATION_ORDER,
  type MapBounds,
  type NetworkSearchParams,
  type VerificationState,
} from "../../shared/health-network.js";

const one = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

const num = (v: string | string[] | undefined): number | undefined => {
  const raw = one(v);
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
};

const flag = (v: string | string[] | undefined): boolean => one(v) === "true";

/** "south,west,north,east" — the order MapLibre's `getBounds().toArray()` gives. */
function parseBounds(raw: string | undefined): MapBounds | undefined {
  if (!raw) return undefined;
  const parts = raw.split(",").map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return undefined;
  const [south, west, north, east] = parts;
  return { south, west, north, east };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const q = req.query;
  const verification = one(q.verification);

  const params: NetworkSearchParams = {
    q: one(q.q),
    city: one(q.city),
    modalities: one(q.modalities)?.split(",").filter(Boolean),
    bounds: parseBounds(one(q.bounds)),
    lat: num(q.lat),
    lng: num(q.lng),
    radius: num(q.radius),
    openNow: flag(q.openNow),
    sameDay: flag(q.sameDay),
    walkIns: flag(q.walkIns),
    minVerification: VERIFICATION_ORDER.includes(verification as VerificationState)
      ? (verification as VerificationState)
      : undefined,
    limit: num(q.limit),
  };

  try {
    /**
     * "Open now" is resolved in SQL, by `search_health_locations`, against each
     * location's own timezone.
     *
     * This route used to re-filter the results afterwards with the website's
     * own clock. That second pass is gone: two implementations of "open" cannot
     * be kept in agreement, and the one running here was the weaker of the
     * two — the search function returns no timezone column, so every Florida
     * practice was being judged against UTC, four hours ahead of its own front
     * door. The website now reads the timezone alongside the hours and uses it
     * only to render the label, never to decide the result set.
     */
    const result = await searchLocations(params);

    // Empty results are still a correct, cacheable answer.
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=600"
    );
    return res.json(result);
  } catch (error) {
    console.error("[network/search] failed:", error);
    return res.status(500).json({ error: "Search failed", locations: [], total: 0, available: false });
  }
}
