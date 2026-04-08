import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../_lib/auth.js";
import { createAbTestVariant } from "../_lib/storage.js";
import { insertAbTestVariantSchema } from "../../shared/schema.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const parsed = insertAbTestVariantSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid variant data",
        details: parsed.error.errors,
      });
    }
    const variant = await createAbTestVariant(parsed.data);
    return res.status(201).json(variant);
  } catch (error) {
    console.error("Error creating A/B test variant:", error);
    return res
      .status(500)
      .json({ error: "Failed to create A/B test variant" });
  }
}
