import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../_lib/auth";
import { trackConversion } from "../_lib/storage";
import { insertAbTestConversionSchema } from "../../shared/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const parsed = insertAbTestConversionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid conversion data",
        details: parsed.error.errors,
      });
    }
    const conversion = await trackConversion(parsed.data);
    return res.status(201).json(conversion);
  } catch (error) {
    console.error("Error tracking conversion:", error);
    return res
      .status(500)
      .json({ error: "Failed to track conversion" });
  }
}
