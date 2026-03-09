import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../../_lib/auth";
import { getAbTestVariants } from "../../_lib/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { testName } = req.query;
  const name = Array.isArray(testName) ? testName[0] : testName;

  if (!name) {
    return res.status(400).json({ error: "Missing testName parameter" });
  }

  try {
    const variants = await getAbTestVariants(name);
    return res.json(variants);
  } catch (error) {
    console.error("Error fetching A/B test variants:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch A/B test variants" });
  }
}
