import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "./_lib/auth.js";
import { getDemoVideos } from "./_lib/storage.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    try {
      const videos = await getDemoVideos();
      return res.json(videos);
    } catch (error) {
      console.error("Error fetching demo videos:", error);
      return res.status(500).json({ error: "Failed to fetch demo videos" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
