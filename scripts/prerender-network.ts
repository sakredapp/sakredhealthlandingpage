/**
 * Prerenders published Health Network pages to static HTML.
 *
 * `/locations/<slug>` and `/practitioners/<slug>` are the pages meant to earn
 * organic search, and a client-rendered SPA route is a weak way to do that. So
 * each published record gets a real HTML file with its own title, description,
 * canonical, OG tags and JSON-LD. React still mounts and replaces the body for
 * actual visitors — same pattern as prerender-pages.ts and prerender-blog.mjs.
 *
 * ── One reader, one schema ───────────────────────────────────────────
 *
 * This used to be a second Supabase client with its own SELECT lists and its
 * own idea of the column names. That is how a build script ends up quietly
 * emitting different data from the site it is prerendering: a rename gets fixed
 * in one place and not the other, and nobody notices because static HTML
 * doesn't throw. It now consumes `api/_lib/health-network.ts` — the same reader
 * the API routes use, with the same seed gate and the same pinned columns.
 *
 * ── Three outcomes, three behaviours ─────────────────────────────────
 *
 *   not configured   log and exit 0. A build before credentials exist is not a
 *                    broken build.
 *   configured, but  exit 1. Something is wrong — wrong project, revoked key,
 *   reads fail       renamed table — and shipping a deploy that silently drops
 *                    every provider page out of the index is far worse than a
 *                    red build.
 *   configured, ok   write the files, log the count.
 *
 * ── Published, non-seed only ─────────────────────────────────────────
 *
 * The reader's seed gate applies here exactly as it does to a rendered page. A
 * seed row written to disk is a seed row submitted to Google, and unlike a bad
 * API response it stays wrong after the bug is fixed.
 */
/* FIRST. Populates process.env before the reader below initialises — an
   unconfigured reader prerenders nothing and says so in one quiet log line. */
import "./load-env.js";

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  getLocationBySlug,
  getPractitionerBySlug,
  getPublishedSlugs,
  isNetworkConfigured,
} from "../api/_lib/health-network.js";
import { renderLocationHtml, renderPractitionerHtml } from "../api/_lib/network-page-html.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");

async function main() {
  if (!isNetworkConfigured()) {
    console.log(
      "[prerender-network] not configured (HEALTH_NETWORK_SUPABASE_URL/_ANON_KEY unset) — skipping. Provider pages are rendered on request by api/network/canonical.ts instead (same HTML, edge cached)."
    );
    return;
  }

  if (!existsSync(join(DIST, "index.html"))) {
    console.error("[prerender-network] dist/index.html missing — run after `vite build`.");
    process.exit(1);
  }

  const template = readFileSync(join(DIST, "index.html"), "utf8");
  const slugs = await getPublishedSlugs();

  if (!slugs.locations.length && !slugs.practitioners.length) {
    /**
     * Configured but empty. Either the network genuinely has nothing published
     * or the seed gate refused to serve — both mean no provider page should
     * exist, and neither should quietly pass for a healthy build.
     */
    console.warn(
      "[prerender-network] configured, but zero published non-seed records were returned. " +
        "No provider pages written. If the network is not empty, this is a failure."
    );
    return;
  }

  let written = 0;
  let skipped = 0;

  for (const { slug } of slugs.locations) {
    const location = await getLocationBySlug(slug);
    if (!location) {
      console.error(`[prerender-network] /locations/${slug} resolved to nothing — skipping.`);
      skipped++;
      continue;
    }
    const dir = join(DIST, "locations", slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), renderLocationHtml(template, location));
    written++;
  }

  for (const { slug } of slugs.practitioners) {
    const practitioner = await getPractitionerBySlug(slug);
    if (!practitioner) {
      console.error(`[prerender-network] /practitioners/${slug} resolved to nothing — skipping.`);
      skipped++;
      continue;
    }
    const dir = join(DIST, "practitioners", slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), renderPractitionerHtml(template, practitioner));
    written++;
  }

  console.log(
    `[prerender-network] wrote ${written} provider pages ` +
      `(${slugs.locations.length} locations, ${slugs.practitioners.length} practitioners)` +
      (skipped ? ` — ${skipped} SKIPPED` : "")
  );

  if (skipped) process.exit(1);
}

main().catch((error) => {
  console.error("[prerender-network] FAILED:", error?.message ?? error);
  process.exit(1);
});
