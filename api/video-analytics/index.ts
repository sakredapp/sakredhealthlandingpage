import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../_lib/auth";
import { trackVideoEvent } from "../_lib/storage";
import { insertVideoAnalyticsSchema } from "../../shared/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const parsed = insertVideoAnalyticsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid analytics data",
        details: parsed.error.errors,
      });
    }
    const event = await trackVideoEvent(parsed.data);
    return res.status(201).json(event);
  } catch (error) {
    console.error("Error tracking video event:", error);
    return res
      .status(500)
      .json({ error: "Failed to track video event" });
  }
}
