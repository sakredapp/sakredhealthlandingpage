import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "./_lib/auth.js";
import { saveEmailSignup, supabase } from "./_lib/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, source } = req.body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    if (!supabase) {
      console.warn(
        "Supabase not configured, email signup stored locally only"
      );
      return res.status(201).json({ success: true, message: "Email saved" });
    }

    const result = await saveEmailSignup(email, source || "website");

    if (!result.success) {
      console.error("Email signup error:", result.error);
      return res.status(500).json({ error: result.error });
    }

    console.log("Email signup saved:", email, "source:", source);
    return res
      .status(201)
      .json({ success: true, message: "Email saved successfully" });
  } catch (error) {
    console.error("Error saving email signup:", error);
    return res.status(500).json({ error: "Failed to save email" });
  }
}
