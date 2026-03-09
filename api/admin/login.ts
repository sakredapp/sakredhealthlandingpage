import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders, generateAdminToken } from "../../_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  return res.json({ success: true, token: generateAdminToken() });
}
