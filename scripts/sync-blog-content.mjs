// Syncs scripts/blog-content/*.md into the blog_posts table at build time.
// Upserts by slug and only writes rows whose content actually changed, so
// re-deploys are no-ops. Never fails the build: any error logs and exits 0.
import { readFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import pg from "pg";

const CONTENT_DIR = join(dirname(fileURLToPath(import.meta.url)), "blog-content");

function parseArticle(raw, file) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing frontmatter block`);
  const meta = {};
  for (const line of m[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    }
    meta[key] = value;
  }
  for (const req of ["slug", "title", "excerpt"]) {
    if (!meta[req]) throw new Error(`${file}: frontmatter missing "${req}"`);
  }
  return { ...meta, content: m[2].trim() };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("[sync-blog] DATABASE_URL not set, skipping blog content sync.");
    return;
  }
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  if (files.length === 0) return;

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    connectionTimeoutMillis: 15000,
    ssl: { rejectUnauthorized: false },
  });

  try {
    let updated = 0, inserted = 0, unchanged = 0;
    for (const file of files) {
      const a = parseArticle(readFileSync(join(CONTENT_DIR, file), "utf8"), file);
      const { rows } = await pool.query(
        "SELECT id, content, title FROM blog_posts WHERE slug = $1",
        [a.slug]
      );
      if (rows.length > 0) {
        if (rows[0].content === a.content && rows[0].title === a.title) {
          unchanged++;
          continue;
        }
        await pool.query(
          `UPDATE blog_posts SET title=$2, excerpt=$3, content=$4, tags=$5,
             seo_title=$6, seo_description=$7, seo_keywords=$8, updated_at=NOW()
           WHERE slug=$1`,
          [a.slug, a.title, a.excerpt, a.content, a.tags || null,
           a.seoTitle || null, a.seoDescription || null, a.seoKeywords || null]
        );
        updated++;
        console.log(`[sync-blog] updated: ${a.slug}`);
      } else {
        await pool.query(
          `INSERT INTO blog_posts
             (title, slug, excerpt, content, author, featured_image, featured_image_alt,
              tags, published, published_at, seo_title, seo_description, seo_keywords, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,NOW(),$9,$10,$11,'published')`,
          [a.title, a.slug, a.excerpt, a.content, a.author || "Sakred Wellness Team",
           a.featuredImage || null, a.featuredImageAlt || null, a.tags || null,
           a.seoTitle || null, a.seoDescription || null, a.seoKeywords || null]
        );
        inserted++;
        console.log(`[sync-blog] inserted: ${a.slug}`);
      }
    }
    console.log(`[sync-blog] done: ${inserted} inserted, ${updated} updated, ${unchanged} unchanged.`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[sync-blog] sync failed (build continues):", err.message);
});
