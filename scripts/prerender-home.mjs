// Prerenders the homepage's first screen into dist/index.html.
//
// The site is a client-rendered SPA, so on a phone nothing painted until the
// app's JavaScript had downloaded and run (Lighthouse mobile LCP ~8 s). This
// renders the real <App /> at "/" with React on the server (Vite SSR build of
// client/src/entry-shell.tsx) and writes the markup into the page, so the hero
// paints as soon as the CSS lands. main.tsx hydrates it in place.
//
// dist/index.html is also the SPA fallback for every other route, which must
// not carry the homepage hero, so the file as it stands is first copied to
// dist/spa.html and vercel.json rewrites unknown routes there (those routes
// get exactly the HTML they got before). Run after the other prerender
// scripts: they read dist/index.html as their template.
//
// Never fails the build: on any error the homepage stays the plain SPA.
import { build } from "vite";
import { readFileSync, writeFileSync, rmSync, existsSync, copyFileSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const OUT = join(ROOT, ".shell-build");

async function main() {
  const indexPath = join(DIST, "index.html");
  if (!existsSync(indexPath)) {
    console.error("[prerender-home] dist/index.html missing; run after `vite build`.");
    return;
  }
  const template = readFileSync(indexPath, "utf8");
  if (template.includes("data-shell")) {
    console.log("[prerender-home] already prerendered, skipping.");
    return;
  }
  // The fallback for every non-home route keeps the empty template.
  copyFileSync(indexPath, join(DIST, "spa.html"));

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
  const html = render("/");
  if (!html || !html.includes("<h1")) throw new Error("render produced no hero");

  // The root holds the crawler copy prerender-pages.ts wrote for "/". It moves
  // into a <noscript> beside the hero so crawlers that don't run JavaScript
  // still read every link and paragraph they did before; browsers with
  // JavaScript never render it.
  const match = template.match(/<div id="root">([\s\S]*)<\/div>(\s*<\/body>)/);
  if (!match) throw new Error('<div id="root"> not found in template');
  const crawlerCopy = match[1].trim();
  const out = template.replace(
    match[0],
    () =>
      `<div id="root" data-shell>${html}</div>` +
      (crawlerCopy ? `\n    <noscript>${crawlerCopy}</noscript>` : "") +
      match[2]
  );
  writeFileSync(indexPath, out);
  console.log(`[prerender-home] wrote ${Math.round(html.length / 1024)} KB of hero markup into dist/index.html`);
}

try {
  await main();
} catch (error) {
  console.error("[prerender-home] skipped, homepage stays client-rendered:", error);
  // Leave the plain template in place so "/" is exactly the SPA it was.
} finally {
  rmSync(OUT, { recursive: true, force: true });
}
