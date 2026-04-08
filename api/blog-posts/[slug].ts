import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../_lib/auth.js";
import {
  getBlogPostBySlug,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
} from "../_lib/storage.js";
import { insertBlogPostSchema } from "../../shared/schema.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const { slug } = req.query;
  const identifier = Array.isArray(slug) ? slug[0] : slug;

  if (!identifier) {
    return res.status(400).json({ error: "Missing slug or id parameter" });
  }

  if (req.method === "GET") {
    try {
      // Try by slug first (public route), then by id
      const post = await getBlogPostBySlug(identifier);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      return res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      return res.status(500).json({ error: "Failed to fetch blog post" });
    }
  }

  if (req.method === "PUT") {
    try {
      const parsed = insertBlogPostSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid blog post data",
          details: parsed.error.errors,
        });
      }
      const post = await updateBlogPost(identifier, parsed.data);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      return res.json(post);
    } catch (error) {
      console.error("Error updating blog post:", error);
      return res.status(500).json({ error: "Failed to update blog post" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const deleted = await deleteBlogPost(identifier);
      if (!deleted) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      return res.status(500).json({ error: "Failed to delete blog post" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
