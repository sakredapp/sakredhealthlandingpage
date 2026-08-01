#!/usr/bin/env node
/**
 * Bing Webmaster Tools CLI.
 *
 * Setup: get a key at bing.com/webmasters -> Settings -> API access -> API key,
 * then put it in .env at the repo root (gitignored):
 *   BING_API_KEY=your-key-here
 *
 * Usage:
 *   node scripts/bing.mjs quota     # how many URL submissions are left today
 *   node scripts/bing.mjs issues    # crawl + SEO issues Bing has found
 *   node scripts/bing.mjs stats     # top queries and pages
 *   node scripts/bing.mjs links     # inbound links Bing has indexed
 *   node scripts/bing.mjs submit    # submit every URL in both sitemaps (batched)
 */
import { readFileSync, existsSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = process.env.BING_SITE_URL || "https://www.sakredhealth.com";
const BASE = "https://ssl.bing.com/webmaster/api.svc/json";

function loadKey() {
  if (process.env.BING_API_KEY) return process.env.BING_API_KEY;
  const envPath = join(ROOT, ".env");
  if (existsSync(envPath)) {
    const m = readFileSync(envPath, "utf8").match(/^BING_API_KEY=(.+)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  console.error(
    "No BING_API_KEY found.\n" +
      "Get one at https://www.bing.com/webmasters -> Settings -> API access -> API key,\n" +
      "then add this line to .env at the repo root (it is gitignored):\n" +
      "  BING_API_KEY=your-key-here"
  );
  process.exit(1);
}

const KEY = loadKey();

async function call(method, { post, params = {} } = {}) {
  const qs = new URLSearchParams({ apikey: KEY, siteUrl: SITE, ...params });
  const url = `${BASE}/${method}?${qs}`;
  const res = await fetch(url, {
    method: post ? "POST" : "GET",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: post ? JSON.stringify(post) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} -> HTTP ${res.status}: ${text.slice(0, 400)}`);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${method} returned non-JSON: ${text.slice(0, 200)}`);
  }
}

/**
 * Pull every URL out of both sitemaps.
 *
 * Prefers the locally built dist/ copies. Fetching them from production instead
 * makes submission depend on the live site answering an automated request, and
 * Vercel's bot firewall returns 403 with `x-vercel-mitigated: challenge` to
 * scripted clients — which silently yielded "Found 0 URLs" rather than an error.
 * Falls back to the network only when dist/ has not been built.
 */
async function sitemapUrls() {
  const urls = new Set();
  const names = ["sitemap.xml", "sitemap-dynamic.xml"];
  const distDir = join(ROOT, "dist");

  if (existsSync(distDir)) {
    // Static sitemap.xml is a real file; sitemap-dynamic.xml is a serverless
    // route backed by the database, so it never exists on disk.
    if (existsSync(join(distDir, "sitemap.xml"))) {
      const xml = readFileSync(join(distDir, "sitemap.xml"), "utf8");
      for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(m[1].trim());
    }

    // Walk the prerendered output for every page we actually ship. This is the
    // ground truth for what got deployed, and it covers the blog posts the
    // static sitemap omits.
    const walk = (dir, rel = "") => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        if (entry.name === "assets" || entry.name.startsWith(".")) continue;
        const next = join(dir, entry.name);
        const route = `${rel}/${entry.name}`;
        if (existsSync(join(next, "index.html"))) urls.add(`${SITE}${route}`);
        walk(next, route);
      }
    };
    walk(distDir);
    if (existsSync(join(distDir, "index.html"))) urls.add(`${SITE}/`);

    if (urls.size) {
      console.log(`Collected ${urls.size} URLs from dist/ (no network needed).`);
      return [...urls];
    }
  }

  console.warn("No sitemaps in dist/ — falling back to fetching production.");
  console.warn("Run `npm run build` first if this returns 0 URLs.");
  for (const sm of names) {
    const res = await fetch(`${SITE}/${sm}`);
    if (!res.ok) {
      const mitigated = res.headers.get("x-vercel-mitigated");
      throw new Error(
        `GET ${SITE}/${sm} -> ${res.status}` +
          (mitigated ? ` (x-vercel-mitigated: ${mitigated} — bot firewall, not an outage)` : ""),
      );
    }
    const xml = await res.text();
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(m[1].trim());
  }
  return [...urls];
}

const nice = (v) => JSON.stringify(v, null, 2);

const commands = {
  async quota() {
    const r = await call("GetUrlSubmissionQuota");
    const d = r.d ?? r;
    console.log(`Daily submissions left: ${d.DailyQuota ?? "?"}`);
    console.log(`Monthly submissions left: ${d.MonthlyQuota ?? "?"}`);
  },

  async issues() {
    for (const method of ["GetCrawlIssues", "GetQueryStats"]) {
      try {
        const r = await call(method);
        const rows = r.d ?? r;
        const list = Array.isArray(rows) ? rows : [rows];
        console.log(`\n=== ${method} — ${list.length} row(s)`);
        console.log(nice(list.slice(0, 25)));
      } catch (err) {
        console.log(`\n=== ${method} — ${err.message}`);
      }
    }
  },

  async links() {
    const r = await call("GetLinkCounts");
    const d = r.d ?? r;
    const rows = d.Links ?? [];
    console.log(`Inbound links Bing has indexed: ${rows.length} (TotalPages: ${d.TotalPages ?? 0})`);
    for (const l of rows.slice(0, 40)) console.log(`  ${l.Count ?? "?"}  ${l.Url ?? JSON.stringify(l)}`);
    if (!rows.length) {
      console.log("\nZero backlinks. This is the binding constraint on rankings —");
      console.log("on-page work is done; authority now comes from other sites linking here.");
    }
  },

  async stats() {
    const r = await call("GetRankAndTrafficStats");
    console.log(nice((r.d ?? r).slice?.(0, 30) ?? r.d ?? r));
  },

  async submit() {
    const urls = await sitemapUrls();
    console.log(`Found ${urls.length} URLs across both sitemaps.`);
    // API caps a batch at 500 URLs.
    for (let i = 0; i < urls.length; i += 500) {
      const batch = urls.slice(i, i + 500);
      await call("SubmitUrlBatch", { post: { siteUrl: SITE, urlList: batch } });
      console.log(`Submitted ${batch.length} URLs (${i + batch.length}/${urls.length}).`);
    }
    console.log("Done.");
  },
};

const cmd = process.argv[2];
if (!commands[cmd]) {
  console.error(`Usage: node scripts/bing.mjs <${Object.keys(commands).join("|")}>`);
  process.exit(1);
}
commands[cmd]().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
