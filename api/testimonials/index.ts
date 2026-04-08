import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../_lib/auth.js";
import {
  getTestimonials,
  getFeaturedTestimonials,
  createTestimonial,
} from "../_lib/storage.js";
import { insertTestimonialSchema } from "../../shared/schema.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    try {
      const featured = req.query.featured === "true";
      const data = featured
        ? await getFeaturedTestimonials()
        : await getTestimonials();
      return res.json(data);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      return res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  }

  if (req.method === "POST") {
    try {
      const parsed = insertTestimonialSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid testimonial data",
          details: parsed.error.errors,
        });
      }
      const testimonial = await createTestimonial(parsed.data);
      return res.status(201).json(testimonial);
    } catch (error) {
      console.error("Error creating testimonial:", error);
      return res.status(500).json({ error: "Failed to create testimonial" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
