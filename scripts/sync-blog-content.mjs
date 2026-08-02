// Syncs scripts/blog-content/*.md into the blog_posts table at build time.
// Upserts by slug and only writes rows whose content actually changed, so
// re-deploys are no-ops. Never fails the build: any error logs and exits 0.
import { readFileSync, readdirSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import pg from "pg";

export const CONTENT_DIR = join(dirname(fileURLToPath(import.meta.url)), "blog-content");

export function parseArticle(raw, file) {
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
        `SELECT id, content, title, excerpt, author, featured_image, featured_image_alt,
                tags, seo_title, seo_description, seo_keywords, published_at
           FROM blog_posts WHERE slug = $1`,
        [a.slug]
      );
      if (rows.length > 0) {
        // Compare every field the UPDATE below writes — not just content and title.
        // Frontmatter-only edits (a new featuredImage, a corrected publishedAt) leave
        // the body untouched, and a content-only check silently skips them.
        const r = rows[0];
        const sameList = (x, y) =>
          JSON.stringify(x ?? null) === JSON.stringify(y ?? null);
        const sameDate = (x, y) =>
          !y || (x && new Date(x).getTime() === new Date(y).getTime());
        if (
          r.content === a.content &&
          r.title === a.title &&
          r.excerpt === (a.excerpt ?? null) &&
          r.author === (a.author || "Sakred Wellness Team") &&
          r.featured_image === (a.featuredImage ?? null) &&
          r.featured_image_alt === (a.featuredImageAlt ?? null) &&
          sameList(r.tags, a.tags) &&
          r.seo_title === (a.seoTitle ?? null) &&
          r.seo_description === (a.seoDescription ?? null) &&
          sameList(r.seo_keywords, a.seoKeywords) &&
          sameDate(r.published_at, a.publishedAt)
        ) {
          unchanged++;
          continue;
        }
        await pool.query(
          `UPDATE blog_posts SET title=$2, excerpt=$3, content=$4, tags=$5,
             seo_title=$6, seo_description=$7, seo_keywords=$8, updated_at=NOW(),
             published_at=COALESCE($9::timestamptz, published_at),
             author=$10, featured_image=$11, featured_image_alt=$12
           WHERE slug=$1`,
          [a.slug, a.title, a.excerpt, a.content, a.tags || null,
           a.seoTitle || null, a.seoDescription || null, a.seoKeywords || null,
           a.publishedAt || null, a.author || "Sakred Wellness Team",
           a.featuredImage || null, a.featuredImageAlt || null]
        );
        updated++;
        console.log(`[sync-blog] updated: ${a.slug}`);
      } else {
        await pool.query(
          `INSERT INTO blog_posts
             (title, slug, excerpt, content, author, featured_image, featured_image_alt,
              tags, published, published_at, seo_title, seo_description, seo_keywords, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,COALESCE($12::timestamptz, NOW()),$9,$10,$11,'published')`,
          [a.title, a.slug, a.excerpt, a.content, a.author || "Sakred Wellness Team",
           a.featuredImage || null, a.featuredImageAlt || null, a.tags || null,
           a.seoTitle || null, a.seoDescription || null, a.seoKeywords || null,
           a.publishedAt || null]
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

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((err) => {
    console.error("[sync-blog] sync failed (build continues):", err.message);
  });
}
