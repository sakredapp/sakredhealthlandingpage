import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../../_lib/auth.js";
import { getAllBlogPosts } from "../../_lib/storage.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const posts = await getAllBlogPosts();
    return res.json(posts);
  } catch (error) {
    console.error("Error fetching all blog posts:", error);
    return res.status(500).json({ error: "Failed to fetch blog posts" });
  }
}
