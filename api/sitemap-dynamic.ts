import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "./_lib/auth.js";
import { getBlogPosts } from "./_lib/storage.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const posts = await getBlogPosts();
    const baseUrl = "https://sakredhealth.com";

    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "weekly" },
      { loc: "/get-coverage", priority: "0.9", changefreq: "weekly" },
      { loc: "/blog", priority: "0.9", changefreq: "daily" },
      { loc: "/app", priority: "0.8", changefreq: "weekly" },
      { loc: "/food-chart", priority: "0.8", changefreq: "monthly" },
      { loc: "/privacy-policy", priority: "0.3", changefreq: "monthly" },
      { loc: "/terms-of-service", priority: "0.3", changefreq: "monthly" },
      { loc: "/ai-privacy", priority: "0.3", changefreq: "monthly" },
      { loc: "/delete-account", priority: "0.2", changefreq: "monthly" },
      { loc: "/delete-data", priority: "0.2", changefreq: "monthly" },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    for (const page of staticPages) {
      xml += `
  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    }

    for (const post of posts) {
      const lastmod = post.updatedAt
        ? new Date(post.updatedAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
      xml += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }

    xml += `
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    return res.send(xml);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return res.status(500).send("Error generating sitemap");
  }
}
