import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../_lib/auth.js";
import { getBlogPosts, createBlogPost } from "../_lib/storage.js";
import { insertBlogPostSchema } from "../../shared/schema.js";

/** Same formula as readingMinutes() in client/src/data/blog-categories.ts. */
function readingMinutes(content: string | null | undefined): number {
  if (!content) return 1;
  const words = content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

function summarize<T extends { content: string | null }>(post: T): T & { readingMinutes: number } {
  return { ...post, content: "", readingMinutes: readingMinutes(post.content) };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    try {
      const posts = await getBlogPosts();
      // ?summary=1 is the listing view (/blog, /resources): every field but the
      // article body, which is 90% of the payload and only fed a word count.
      // The count comes back as readingMinutes instead.
      if (req.query.summary) {
        res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=600");
        return res.json(posts.map(summarize));
      }
      return res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      return res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  }

  if (req.method === "POST") {
    try {
      const parsed = insertBlogPostSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid blog post data",
          details: parsed.error.errors,
        });
      }
      const post = await createBlogPost(parsed.data);
      return res.status(201).json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      return res.status(500).json({ error: "Failed to create blog post" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
