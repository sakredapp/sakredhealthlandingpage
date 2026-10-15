// Prerenders the first screen of the main pages into their HTML files.
//
// The site is a client-rendered SPA, so on a phone nothing painted until the
// app's JavaScript had downloaded and run (Lighthouse mobile LCP 5-11 s). This
// renders the real <App /> at each path with React on the server (Vite SSR
// build of client/src/entry-shell.tsx) and writes the markup into that page,
// so it paints as soon as the CSS lands. main.tsx hydrates it in place when
// the visitor is on that path (data-shell="<path>").
//
// Also writes two build-time data snapshots into the pages that need them, so
// the first render already has the data and nothing jumps when the API
// answers (the live query still runs on mount and corrects anything newer):
//   window.__SAKRED_MODALITIES__   every /discover page (filter chips)
//   window.__SAKRED_BLOG_SUMMARY__ /blog and /resources (article cards)
//
// dist/index.html is also the SPA fallback for every other route, which must
// not carry the homepage, so it is first copied to dist/spa.html and
// vercel.json rewrites unknown routes there. Run after the other prerender
// scripts: they read dist/index.html as their template.
//
// Never fails the build: a page that cannot be rendered keeps the HTML it had.
import { build } from "vite";
import { readFileSync, writeFileSync, rmSync, existsSync, copyFileSync, readdirSync, statSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";

// Dates on the article cards are formatted with the visitor's clock; render
// them on a US clock so the markup matches what the audience sees.
process.env.TZ = "America/New_York";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const OUT = join(ROOT, ".shell-build");
const SITE = "https://www.sakredhealth.com";

const ROUTES = [
  ["/", "index.html"],
  ["/discover", "discover/index.html"],
  ["/resources", "resources/index.html"],
  ["/for-practitioners", "for-practitioners/index.html"],
  ["/blog", "blog/index.html"],
  ["/products", "products/index.html"],
];

/** Build-time data copies, by global name; written into the pages that use them. */
const snapshots = {};

/** The copies a page's HTML carries: the render sees only those. */
function pageSnapshots(path) {
  const out = {};
  if (path.startsWith("/discover") && snapshots.__SAKRED_MODALITIES__) out.__SAKRED_MODALITIES__ = snapshots.__SAKRED_MODALITIES__;
  if ((path === "/blog" || path === "/resources") && snapshots.__SAKRED_BLOG_SUMMARY__) out.__SAKRED_BLOG_SUMMARY__ = snapshots.__SAKRED_BLOG_SUMMARY__;
  return out;
}

const log = (...args) => console.log("[prerender-shell]", ...args);

/** "<" escaped so no value can close the script tag. */
const scriptTag = (name, value) =>
  `<script>window.${name}=${JSON.stringify(value).replace(/</g, "\\u003c")}</script>`;

function injectHead(file, name, value) {
  const html = readFileSync(file, "utf8");
  if (html.includes(`window.${name}=`) || !html.includes("</head>")) return false;
  writeFileSync(file, html.replace("</head>", () => `  ${scriptTag(name, value)}\n  </head>`));
  return true;
}

function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...htmlFiles(path));
    else if (name === "index.html") out.push(path);
  }
  return out;
}

async function getJson(path) {
  const res = await fetch(SITE + path, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${path} answered ${res.status}`);
  return res.json();
}

/** Same count the client uses (client/src/data/blog-categories.ts). */
function readingMinutes(content) {
  const words = String(content || "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

async function seedModalities() {
  try {
    const body = await getJson("/api/network/modalities");
    if (!body?.available || !Array.isArray(body.modalities) || body.modalities.length === 0) {
      throw new Error("network not available");
    }
    const value = { modalities: body.modalities, available: true };
    snapshots.__SAKRED_MODALITIES__ = value;
    const dir = join(DIST, "discover");
    let count = 0;
    if (existsSync(dir)) for (const file of htmlFiles(dir)) if (injectHead(file, "__SAKRED_MODALITIES__", value)) count++;
    log(`${body.modalities.length} modalities written into ${count} /discover pages`);
  } catch (error) {
    log("modalities snapshot skipped:", error?.message ?? error);
  }
}

async function seedBlog() {
  try {
    const posts = await getJson("/api/blog-posts");
    if (!Array.isArray(posts)) throw new Error("not a list");
    const summary = posts.map((post) => ({ ...post, content: "", readingMinutes: readingMinutes(post.content) }));
    snapshots.__SAKRED_BLOG_SUMMARY__ = summary;
    for (const page of ["blog/index.html", "resources/index.html"]) {
      const file = join(DIST, page);
      if (existsSync(file)) injectHead(file, "__SAKRED_BLOG_SUMMARY__", summary);
    }
    log(`${summary.length} article summaries written into /blog and /resources`);
  } catch (error) {
    log("blog snapshot skipped:", error?.message ?? error);
  }
}

/**
 * A prerendered page is readable before the app runs, so the app's script
 * waits until that first paint instead of sharing a phone's bandwidth with
 * the page's CSS, fonts and photos. The script is the same file; it only
 * starts one frame later (and never before the page has finished parsing).
 */
function startAppAfterPaint(html) {
  const tag = html.match(/<script type="module" crossorigin src="(\/assets\/index-[^"]+\.js)"><\/script>/);
  if (!tag) return html;
  const loader =
    // A tab opened in the background never paints, so a timer starts it too.
    `<script>(function(){var done=0;function go(){if(done++)return;var s=document.createElement("script");s.type="module";s.crossOrigin="anonymous";s.src=${JSON.stringify(tag[1])};document.head.appendChild(s)}` +
    `function later(){setTimeout(document.readyState==="loading"?function(){document.addEventListener("DOMContentLoaded",go)}:go,0)}` +
    `requestAnimationFrame(later);setTimeout(function(){if(document.readyState!=="loading")go();else document.addEventListener("DOMContentLoaded",go)},2000)})()</script>`;
  return html.replace(tag[0], () => loader);
}

async function main() {
  const indexPath = join(DIST, "index.html");
  if (!existsSync(indexPath)) {
    console.error("[prerender-shell] dist/index.html missing; run after `vite build`.");
    return;
  }
  if (readFileSync(indexPath, "utf8").includes("data-shell")) {
    log("already prerendered, skipping.");
    return;
  }
  // The fallback for every other route keeps the empty template.
  copyFileSync(indexPath, join(DIST, "spa.html"));

  await Promise.all([seedModalities(), seedBlog()]);

  await build({
    configFile: join(ROOT, "vite.config.ts"),
    logLevel: "warn",
    build: {
      ssr: join(ROOT, "client", "src", "entry-shell.tsx"),
      outDir: OUT,
      emptyOutDir: true,
      copyPublicDir: false,
      rollupOptions: { output: { format: "esm", entryFileNames: "entry-shell.mjs" } },
    },
  });
  const { render } = await import(pathToFileURL(join(OUT, "entry-shell.mjs")).href);

  for (const [path, page] of ROUTES) {
    const file = join(DIST, page);
    try {
      if (!existsSync(file)) throw new Error(`${page} missing`);
      const template = readFileSync(file, "utf8");
      const html = await render(path, pageSnapshots(path));
      if (!html || !html.includes("<h1")) throw new Error("render produced no headline");

      // The root holds the crawler copy the earlier prerender scripts wrote.
      // It moves into a <noscript> beside the rendered page so crawlers that
      // don't run JavaScript still read every link and paragraph they did
      // before; browsers with JavaScript never render it.
      const match = template.match(/<div id="root">([\s\S]*)<\/div>(\s*<\/body>)/);
      if (!match) throw new Error('<div id="root"> not found');
      const crawlerCopy = match[1].trim();
      const out = template.replace(
        match[0],
        () =>
          `<div id="root" data-shell="${path}">${html}</div>` +
          (crawlerCopy ? `\n    <noscript>${crawlerCopy}</noscript>` : "") +
          match[2]
      );
      writeFileSync(file, startAppAfterPaint(out));
      log(`${path}: ${Math.round(html.length / 1024)} KB of markup into dist/${page}`);
    } catch (error) {
      console.error(`[prerender-shell] ${path} skipped, stays client-rendered:`, error?.message ?? error);
    }
  }
}

try {
  await main();
} catch (error) {
  console.error("[prerender-shell] skipped, pages stay client-rendered:", error);
} finally {
  rmSync(OUT, { recursive: true, force: true });
}
// The SSR bundle can leave timers (query client, motion) holding the loop open.
process.exit(0);
