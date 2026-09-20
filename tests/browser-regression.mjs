/**
 * Browser regression tests for the failure modes a typecheck cannot see.
 *
 * Deliberately small. This is not a browser-test project — it covers exactly
 * the bugs that shipped past a clean `tsc`, a clean build and a clean prerender
 * and were only caught by opening the page:
 *
 *   1. MAP MARKERS STACKED AT ORIGIN
 *      `.sakred-pin` carried `animation: pin-land … both`. A CSS animation
 *      beats an inline style, so the final keyframe permanently overwrote the
 *      `transform: translate(Xpx,Ypx)` MapLibre writes to position a marker.
 *      All 14 pins sat on top of each other at the map's origin while the list
 *      beside them correctly said "14 practices in this view". Nothing threw.
 *
 *   2. HORIZONTAL OVERFLOW AT 390px
 *      `truncate` sets `white-space: nowrap`, so a card's min-content width was
 *      the full unwrapped modality string (~400px). Grid items default to
 *      `min-width: auto` and refused to shrink, pushing the page sideways on a
 *      phone. The placeholder copy the layout was built against was short
 *      enough to hide it; real practice names exposed it immediately.
 *
 *   3. ROUTE RESOLUTION
 *      Canonical slugs are the addressing scheme. A provider URL that renders
 *      the not-found state is a page dropping out of the index.
 *
 *   4. ALIAS URLs ANSWERING 200
 *      A retired slug served a full copy of the page at its old URL, so two
 *      URLs were two documents competing for the same content. Only a real
 *      redirect fixes that; a client-side address-bar rewrite does not.
 *
 * Usage:
 *   npm run test:browser       # builds first, then serves, then asserts
 *   npm run test:browser:only  # against a running serve:dist, for iterating
 *
 * Exits non-zero on failure, so it can gate a deploy.
 */
import { chromium } from "playwright";
import { statSync, readdirSync } from "fs";
import { join } from "path";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";

let passed = 0;
const failures = [];

/**
 * Refuse to test an artefact older than the source that produced it.
 *
 * The failure this prevents actually happened: a build failed, the suite was
 * run by hand against the previous `dist/`, and every assertion passed while
 * testing code that no longer existed. `npm run test:browser` builds first and
 * sets SKIP_STALENESS_CHECK; this is the guard for the standalone path.
 */
if (!process.env.SKIP_STALENESS_CHECK) {
  const built = statSync("dist/index.html").mtimeMs;
  let newest = 0;
  let newestFile = "";
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else {
        const m = statSync(path).mtimeMs;
        if (m > newest) { newest = m; newestFile = path; }
      }
    }
  };
  ["client/src", "shared", "api", "scripts"].forEach(walk);

  if (newest > built) {
    console.error(
      `\nSTALE dist: ${newestFile} is newer than dist/index.html.\n` +
        "Run `npm run test:browser`, which builds first. Passing against a stale\n" +
        "build is how a broken page reports 8/8.\n"
    );
    process.exit(1);
  }
}

function check(name, ok, detail = "") {
  if (ok) { passed++; console.log(`  PASS  ${name}${detail ? `  — ${detail}` : ""}`); }
  else { failures.push(`${name}${detail ? `: ${detail}` : ""}`); console.log(`  FAIL  ${name}  — ${detail}`); }
}

const browser = await chromium.launch();

/* ================================================================== *
 * 1 · Map markers must be positioned, not stacked
 * ================================================================== */
console.log("\nmap markers");
{
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
  await page.goto(`${BASE}/discover`, { waitUntil: "networkidle" });
  await page.waitForSelector(".maplibregl-canvas", { timeout: 30000 });
  // Markers mount after the style loads and the first search resolves.
  await page.waitForFunction(() => document.querySelectorAll(".maplibregl-marker").length > 1, { timeout: 30000 })
    .catch(() => {});
  await page.waitForTimeout(2500);

  const m = await page.evaluate(() => {
    const els = [...document.querySelectorAll(".maplibregl-marker")];
    const transforms = els.map((el) => getComputedStyle(el).transform);
    return {
      count: els.length,
      distinct: new Set(transforms).size,
      // An identity matrix means no positioning was applied at all.
      identity: transforms.filter((t) => t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)").length,
    };
  });

  check("markers rendered", m.count > 1, `${m.count} markers`);
  check(
    "markers are positioned (not identity transform)",
    m.identity === 0,
    m.identity ? `${m.identity}/${m.count} unpositioned — a CSS animation is likely overriding MapLibre's inline transform` : "all positioned"
  );
  check(
    "markers occupy distinct positions",
    m.distinct > 1,
    `${m.distinct} distinct position(s) for ${m.count} markers`
  );
  await page.close();
}

/* ================================================================== *
 * 2 · No horizontal overflow on a phone
 * ================================================================== */
console.log("\nresponsive · 390x844");
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();

  const routes = [
    ["/discover", "discover"],
    ["/locations/south-florida-acupuncture-associates-palm-beach-gardens", "long-name location"],
    ["/practitioners/yihong-joy-hao", "long-credential practitioner"],
  ];

  for (const [path, label] of routes) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(1800);
    const o = await page.evaluate(() => {
      const el = document.documentElement;
      const over = el.scrollWidth - el.clientWidth;
      let culprit = "";
      if (over > 1) {
        for (const node of document.querySelectorAll("body *")) {
          const r = node.getBoundingClientRect();
          if (r.right > el.clientWidth + 1 && r.width > 0) {
            culprit = `<${node.tagName.toLowerCase()} class="${String(node.className).slice(0, 60)}">`;
            break;
          }
        }
      }
      return { over, culprit };
    });
    check(`no horizontal overflow · ${label}`, o.over <= 1, o.over > 1 ? `over by ${o.over}px, first culprit ${o.culprit}` : "");
  }
  await ctx.close();
}

/* ================================================================== *
 * 3 · Canonical slug routes resolve
 * ================================================================== */
console.log("\nroute resolution");
{
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
  for (const path of [
    "/locations/shin-wellness-miami",
    "/practitioners/matthew-enright",
  ]) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const r = await page.evaluate(() => ({
      h1: document.querySelector("h1")?.textContent?.trim() ?? "",
      notFound: /not found|couldn.t find/i.test(document.body.innerText),
    }));
    check(`resolves ${path}`, Boolean(r.h1) && !r.notFound, r.h1 ? `h1 "${r.h1}"` : "no h1 / not-found state");
  }
  await page.close();
}

/* ================================================================== *
 * 4 · Canonical URL behaviour at the HTTP level
 * ================================================================== */
console.log("\ncanonical URLs");
{
  /**
   * A canonical page must be PRERENDERED — real content in the HTML source,
   * not an empty shell the browser fills in.
   *
   * This assertion exists because of a bug that shipped in config, not code:
   * `vercel.json` still invoked `scripts/prerender-network.mjs` after the file
   * was renamed to `.ts`, so production builds emitted zero provider pages.
   * Every page still LOOKED right in a browser — the SPA renders them client
   * side — and a crawler would have seen nothing at all. Checking the status
   * code alone would not have caught it; checking for the practice name in the
   * bytes does.
   */
  const canonical = await fetch(`${BASE}/locations/shin-wellness-miami`, { redirect: "manual" });
  const canonicalHtml = await canonical.text();
  check("canonical location URL answers 200", canonical.status === 200, `status ${canonical.status}`);
  check(
    "location page is prerendered, not an empty shell",
    canonicalHtml.includes("Shin Wellness") && canonicalHtml.includes("application/ld+json"),
    canonicalHtml.includes("Shin Wellness") ? "" : "no server-rendered content — did prerender-network run?"
  );

  const practitioner = await fetch(`${BASE}/practitioners/matthew-enright`, { redirect: "manual" });
  const practitionerHtml = await practitioner.text();
  check("canonical practitioner URL answers 200", practitioner.status === 200, `status ${practitioner.status}`);
  check(
    "practitioner page is prerendered, not an empty shell",
    practitionerHtml.includes("Matthew Enright"),
    practitionerHtml.includes("Matthew Enright") ? "" : "no server-rendered content"
  );

  /**
   * A slug that does not resolve must NOT answer 200. It used to: the catch-all
   * rewrite handed the app shell to everything, so a mistyped provider URL was
   * indistinguishable from a real page to anything that reads status codes.
   */
  const missing = await fetch(`${BASE}/locations/definitely-not-a-real-practice`, {
    redirect: "manual",
  });
  check("unknown provider URL answers 404", missing.status === 404, `status ${missing.status}`);

  // The shell still comes back, so a person gets the rendered not-found state.
  const body = await missing.text();
  check("404 still serves the app shell", body.includes("<div id=\"root\""), `${body.length} bytes`);
}

/* ================================================================== *
 * 5 · Typed text is text, not a LIKE pattern
 * ================================================================== */
console.log("\nsearch input");
{
  const total = await search("");
  const wildcard = await search("%");
  const underscore = await search("_");
  const injection = await search("' OR 1=1--");
  const real = await search("acupuncture");

  check("baseline returns the published network", total > 0, `${total} practices`);
  check("'%' is not a wildcard", wildcard < total, `${wildcard} vs ${total} unfiltered`);
  check("'_' is not a single-character wildcard", underscore < total, `${underscore} results`);
  check("quote/comment injection is inert", injection === 0, `${injection} results`);
  check("ordinary text still searches", real > 0 && real < total, `${real} results for "acupuncture"`);
}

async function search(q) {
  const res = await fetch(`${BASE}/api/network/search?q=${encodeURIComponent(q)}`);
  const body = await res.json();
  return body.total ?? -1;
}

await browser.close();

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log("\nfailures:");
  failures.forEach((f) => console.log("  · " + f));
  process.exit(1);
}
