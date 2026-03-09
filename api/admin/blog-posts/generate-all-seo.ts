import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../../_lib/auth";
import { getAllBlogPosts, updateBlogPost } from "../../_lib/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const posts = await getAllBlogPosts();
    const updates: { id: string; title: string; success: boolean }[] = [];

    for (const post of posts) {
      try {
        const plainContent =
          post.content
            ?.replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim() || "";
        const contentPreview = plainContent.substring(0, 500);

        const seoTitle = post.seoTitle || `${post.title} | Sakred Health`;
        const seoDescription =
          post.seoDescription ||
          post.excerpt ||
          contentPreview.substring(0, 155) + "...";

        const titleWords = post.title
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 3);
        const tagKeywords = post.tags || [];
        const seoKeywords = post.seoKeywords?.length
          ? post.seoKeywords
          : [...new Set([...tagKeywords, ...titleWords])].slice(0, 10);

        const llmSummary =
          post.llmSummary ||
          `This article discusses ${post.title.toLowerCase()}. ${post.excerpt || contentPreview.substring(0, 200)}`;

        await updateBlogPost(post.id, {
          seoTitle,
          seoDescription,
          seoKeywords,
          llmSummary,
        });

        updates.push({ id: post.id, title: post.title, success: true });
      } catch (err) {
        console.error(`Failed to update SEO for post ${post.id}:`, err);
        updates.push({ id: post.id, title: post.title, success: false });
      }
    }

    const successCount = updates.filter((u) => u.success).length;
    return res.json({
      success: true,
      message: `Updated SEO for ${successCount} of ${posts.length} posts`,
      updates,
    });
  } catch (error) {
    console.error("Error generating bulk SEO:", error);
    return res.status(500).json({ error: "Failed to generate SEO" });
  }
}
