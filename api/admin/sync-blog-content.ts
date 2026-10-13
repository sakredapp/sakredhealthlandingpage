/**
 * POST /api/admin/sync-blog-content
 *
 * Writes the blog articles that shipped with THIS deployment
 * (scripts/blog-content/*.md) into the blog_posts table.
 *
 * ── Why this is an endpoint ──────────────────────────────────────────
 *
 * This sync used to run inside the build command. Production builds now run on
 * our own build box, and Vercel does not hand Sensitive variables (DATABASE_URL)
 * to a build that runs outside Vercel. A function has DATABASE_URL at runtime,
 * so the deploy workflow (.github/workflows/vercel-prebuilt.yml) calls this
 * once, right after a production deploy. Same code as before
 * (scripts/sync-blog-content.mjs), run one step later.
 *
 * ── Why it needs no password ─────────────────────────────────────────
 *
 * It takes no input. All it can do is make the table match the articles in
 * this deployment, and when they already match it writes nothing. A stranger
 * calling it costs a few reads, so it is limited to one run a minute per
 * instance and answers with the last result in between.
 *
 * Production only: a preview deployment shares the production database and
 * must never publish a branch's draft articles into it.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { existsSync } from "fs";
import { join } from "path";
import { syncBlogContent, type BlogSyncResult } from "../../scripts/sync-blog-content.mjs";

const MIN_GAP_MS = 60_000;
let lastRunAt = 0;
let lastResult: BlogSyncResult | undefined;
let running: Promise<BlogSyncResult> | undefined;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (process.env.VERCEL_ENV !== "production") {
    return res.status(200).json({ ok: true, skipped: "not a production deployment" });
  }

  if (lastResult && Date.now() - lastRunAt < MIN_GAP_MS) {
    return res.status(200).json({ ok: true, repeated: true, ...lastResult });
  }

  try {
    if (!running) {
      // Bundled beside the function by `functions.includeFiles` in vercel.json.
      const bundled = join(process.cwd(), "scripts", "blog-content");
      running = syncBlogContent(existsSync(bundled) ? { contentDir: bundled } : {}).finally(() => {
        running = undefined;
      });
    }
    const result = await running;
    lastResult = result;
    lastRunAt = Date.now();
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    console.error("[sync-blog-content] failed:", error);
    return res.status(500).json({ ok: false, error: "Blog content sync failed" });
  }
}
