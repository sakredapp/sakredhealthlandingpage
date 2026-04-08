import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../../_lib/auth.js";
import { getBlogPostById } from "../../_lib/storage.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  const postId = Array.isArray(id) ? id[0] : id;

  if (!postId) {
    return res.status(400).json({ error: "Missing id parameter" });
  }

  try {
    const post = await getBlogPostById(postId);
    if (!post) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    return res.json(post);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return res.status(500).json({ error: "Failed to fetch blog post" });
  }
}
