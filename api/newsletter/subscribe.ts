import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../../_lib/auth";
import {
  saveNewsletterSubscriberToSupabase,
  supabase,
} from "../../_lib/supabase";
import {
  subscribeNewsletter,
  getSubscriberByEmail,
} from "../../_lib/storage";
import { insertNewsletterSubscriberSchema } from "../../../shared/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, firstName } = req.body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    // Try Supabase first if configured
    if (supabase) {
      console.log("Saving newsletter subscriber to Supabase:", email);
      const result = await saveNewsletterSubscriberToSupabase(
        email,
        firstName
      );

      if (!result.success) {
        if (result.error === "Email already subscribed") {
          return res.status(409).json({ error: "Email already subscribed" });
        }
        console.error("Supabase error:", result.error);
        // Fall through to local storage as backup
      } else {
        console.log("Successfully saved to Supabase");
        return res.status(201).json({
          success: true,
          message: "Successfully subscribed to newsletter",
        });
      }
    }

    // Fallback to local storage
    const parsed = insertNewsletterSubscriberSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid subscription data",
        details: parsed.error.errors,
      });
    }

    const existing = await getSubscriberByEmail(parsed.data.email);
    if (existing) {
      return res.status(409).json({ error: "Email already subscribed" });
    }

    await subscribeNewsletter(parsed.data);
    return res.status(201).json({
      success: true,
      message: "Successfully subscribed to newsletter",
    });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return res
      .status(500)
      .json({ error: "Failed to subscribe to newsletter" });
  }
}
