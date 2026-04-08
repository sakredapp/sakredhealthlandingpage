import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../_lib/auth.js";
import { getVideoAnalytics } from "../_lib/storage.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { videoId } = req.query;
  const id = Array.isArray(videoId) ? videoId[0] : videoId;

  if (!id) {
    return res.status(400).json({ error: "Missing videoId parameter" });
  }

  try {
    const analytics = await getVideoAnalytics(id);
    return res.json(analytics);
  } catch (error) {
    console.error("Error fetching video analytics:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch video analytics" });
  }
}
