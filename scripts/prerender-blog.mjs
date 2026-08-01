// Prerenders every blog post to static HTML at dist/blog/<slug>/index.html so
// crawlers and AI search engines get the full article, meta tags, and
// BlogPosting JSON-LD (with citations) without executing JavaScript. Vercel
// serves these files ahead of the SPA rewrite; the React app still mounts and
// takes over for real visitors. Also emits dist/blog/index.html and
// dist/llms.txt. Never fails the build.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import pg from "pg";
import { CONTENT_DIR, parseArticle } from "./sync-blog-content.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const BASE_URL = "https://www.sakredhealth.com";
const h = React.createElement;

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/* Static fallbacks for the ```stats / ```chart fences: tiles render as real
   tiles (same Tailwind classes the live component uses, so the compiled CSS
   covers them); charts render as an accessible data table. */
function StaticStats({ raw }) {
  let stats;
  try { stats = JSON.parse(raw); } catch { return null; }
  return h(
    "div",
    { className: "not-prose my-8 grid grid-cols-2 gap-3" },
    stats.map((s, i) => {
      const decimals = s.decimals ?? (Number.isInteger(s.value ?? 0) ? 0 : 1);
      const text =
        s.display ??
        `${s.prefix ?? ""}${(s.value ?? 0).toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}${s.suffix ?? ""}`;
      return h(
        "div",
        { key: i, className: "rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-sm" },
        h("div", { className: "font-display text-2xl sm:text-3xl text-[#0F172A]" }, text),
        h("div", { className: "mt-1 text-sm leading-snug text-[#0F172A]/70" }, s.label),
        s.source ? h("div", { className: "mt-2 text-xs text-[#0F172A]/45" }, s.source) : null
      );
    })
  );
}

function StaticChart({ raw }) {
  let spec;
  try { spec = JSON.parse(raw); } catch { return null; }
  if (!spec?.data?.length) return null;
  const twoSeries = spec.data.some((d) => typeof d.value2 === "number");
  const fmt = (v) => `${spec.prefix ?? ""}${Number(v).toLocaleString("en-US")}${spec.suffix ?? ""}`;
  return h(
    "figure",
    { className: "not-prose my-8 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 shadow-sm" },
    spec.title ? h("div", { className: "mb-3 text-sm font-medium text-[#0F172A]" }, spec.title) : null,
    h(
      "table",
      { className: "w-full text-sm text-[#0F172A]/80" },
      h(
        "tbody",
        null,
        spec.data.map((d, i) =>
          h(
            "tr",
            { key: i, className: "border-t border-stone-100" },
            h("td", { className: "py-1.5 pr-4" }, d.label),
            h("td", { className: "py-1.5 tabular-nums" }, fmt(d.value) + (spec.series?.[0] && twoSeries ? ` (${spec.series[0]})` : "")),
            twoSeries ? h("td", { className: "py-1.5 tabular-nums" }, fmt(d.value2) + (spec.series?.[1] ? ` (${spec.series[1]})` : "")) : null
          )
        )
      )
    ),
    spec.source ? h("figcaption", { className: "mt-3 text-xs text-[#0F172A]/45" }, "Source: " + spec.source) : null
  );
}

// Anchor ids on section headings (deep links; mirrored at runtime in BlogPost.tsx)
export const headingId = (children) => {
  const text = Array.isArray(children) ? children.map((c) => (typeof c === "string" ? c : "")).join("") : String(children ?? "");
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);
};

const fenceLang = (c) => (/language-(\w+)/.exec(typeof c === "string" ? c : "") || [])[1] || "";
const mdComponents = {
  h2: ({ node: _n, children, ...rest }) => h("h2", { id: headingId(children), ...rest }, children),
  h3: ({ node: _n, children, ...rest }) => h("h3", { id: headingId(children), ...rest }, children),
  pre: (props) => {
    const lang = fenceLang(props?.children?.props?.className);
    if (lang === "stats" || lang === "chart") return h(React.Fragment, null, props.children);
    const { node: _n, ...rest } = props;
    return h("pre", rest);
  },
  code: (props) => {
    const lang = fenceLang(props?.className);
    if (lang === "stats") return h(StaticStats, { raw: String(props.children ?? "") });
    if (lang === "chart") return h(StaticChart, { raw: String(props.children ?? "") });
    const { node: _n, ...rest } = props;
    return h("code", rest);
  },
};

function articleHtml(a) {
  return renderToStaticMarkup(
    h(
      "main",
      { className: "pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-[#F9F9F7]" },
      h(
        "article",
        { className: "max-w-3xl mx-auto" },
        h("h1", { className: "text-3xl sm:text-4xl font-display text-[#0F172A] mb-4" }, a.title),
        h("p", { className: "text-[#0F172A]/70 mb-8" }, a.excerpt),
        a.featuredImage
          ? h("img", {
              src: a.featuredImage,
              alt: a.featuredImageAlt || a.title,
              className: "w-full rounded-2xl mb-10",
            })
          : null,
        h(
          "div",
          { className: "prose prose-lg max-w-none" },
          h(ReactMarkdown, { remarkPlugins: [remarkGfm], components: mdComponents }, a.content)
        )
      )
    )
  );
}

function extractSourceUrls(content) {
  const m = content.split(/^## Sources/m)[1] || "";
  return [...m.matchAll(/\((https?:\/\/[^)\s]+)\)/g)].map((x) => x[1]);
}

// Parse a "## Frequently asked questions" section (### question + answer paragraphs)
function extractFaq(content) {
  const section = content.split(/^## Frequently asked questions\s*$/im)[1];
  if (!section) return [];
  const body = section.split(/^## /m)[0];
  const parts = body.split(/^### /m).slice(1);
  return parts
    .map((p) => {
      const [q, ...rest] = p.split("\n");
      const answer = rest.join("\n").trim().replace(/\s+/g, " ");
      return { q: q.trim(), a: answer };
    })
    .filter((x) => x.q && x.a);
}

function jsonLd(a, dates) {
  const faq = extractFaq(a.content);
  const graph = [];
  const data = {
    "@type": "BlogPosting",
    headline: a.title,
    description: a.excerpt,
    image: a.featuredImage || `${BASE_URL}/og-image.jpg`,
    url: `${BASE_URL}/blog/${a.slug}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/blog/${a.slug}` },
    author: { "@type": "Organization", name: "Sakred Health", url: BASE_URL },
    publisher: {
      "@type": "Organization",
      name: "Sakred Health",
      url: BASE_URL,
      logo: { "@type": "ImageObject", url: `${BASE_URL}/og-image.jpg` },
    },
    keywords: (a.seoKeywords || []).join(", "),
    citation: extractSourceUrls(a.content),
  };
  if (dates?.publishedAt) data.datePublished = dates.publishedAt;
  if (dates?.updatedAt) data.dateModified = dates.updatedAt;
  graph.push(data);
  graph.push({
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: a.title, item: `${BASE_URL}/blog/${a.slug}` },
    ],
  });
  if (faq.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/<\//g, "<\\/");
}

function buildHead(a, dates) {
  const url = `${BASE_URL}/blog/${a.slug}`;
  const title = a.seoTitle || a.title;
  const desc = a.seoDescription || a.excerpt;
  // Append the brand only when it keeps the title inside the ~60-char display
  // limit — otherwise the suffix is what pushes an already-tuned title over.
  const branded = `${title} | Sakred Health`;
  const headTitle = branded.length <= 60 ? branded : title;
  return [
    `<title>${esc(headTitle)}</title>`,
    `<meta name="description" content="${esc(desc)}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${BASE_URL}/api/og/${a.slug}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:site_name" content="Sakred Health">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(desc)}">`,
    `<meta name="twitter:image" content="${BASE_URL}/api/og/${a.slug}">`,
    `<link rel="alternate" type="application/rss+xml" title="Sakred Health Blog" href="${BASE_URL}/blog/feed.xml">`,
    `<script type="application/ld+json">${jsonLd(a, dates)}</script>`,
  ].filter(Boolean).join("\n    ");
}

function injectIntoTemplate(template, headExtra, bodyHtml) {
  // Strip the SPA template's page-level tags so per-post tags are authoritative
  let out = template
    .replace(/<title>[\s\S]*?<\/title>\s*/, "")
    .replace(/<meta name="description"[^>]*>\s*/g, "")
    .replace(/<link rel="canonical"[^>]*>\s*/g, "")
    .replace(/<meta (?:property="og:|name="twitter:)[^>]*>\s*/g, "");
  // Replacer functions: literal `$1`/`$2` in article text must not be
  // interpreted as backreferences by String.replace.
  out = out.replace("</head>", () => `    ${headExtra}\n  </head>`);
  out = out.replace(
    /(<div id="root">)([\s\S]*?)(<\/div>)/,
    (_m, open, _inner, close) => `${open}${bodyHtml}${close}`
  );
  return out;
}

async function fetchDates() {
  if (!process.env.DATABASE_URL) return {};
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    connectionTimeoutMillis: 15000,
    ssl: { rejectUnauthorized: false },
  });
  try {
    const { rows } = await pool.query("SELECT slug, published_at, updated_at FROM blog_posts");
    return Object.fromEntries(
      rows.map((r) => [r.slug, {
        publishedAt: r.published_at?.toISOString?.(),
        updatedAt: r.updated_at?.toISOString?.(),
      }])
    );
  } finally {
    await pool.end();
  }
}

async function main() {
  const template = readFileSync(join(DIST, "index.html"), "utf8");
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  const articles = files.map((f) => parseArticle(readFileSync(join(CONTENT_DIR, f), "utf8"), f));
  let dates = {};
  try {
    dates = await fetchDates();
  } catch (err) {
    console.error("[prerender] date lookup skipped:", err.message);
  }

  for (const a of articles) {
    const html = injectIntoTemplate(template, buildHead(a, dates[a.slug]), articleHtml(a));
    const dir = join(DIST, "blog", a.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), html);
  }

  // Static /blog listing for crawl discovery
  const listing = renderToStaticMarkup(
    h(
      "main",
      { className: "pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-[#F9F9F7]" },
      h(
        "div",
        { className: "max-w-3xl mx-auto" },
        h("h1", { className: "text-3xl font-display text-[#0F172A] mb-8" }, "Sakred Health Blog"),
        h(
          "ul",
          { className: "space-y-6" },
          articles.map((a) =>
            h(
              "li",
              { key: a.slug },
              h("a", { href: `/blog/${a.slug}`, className: "text-lg text-[#0F172A] font-medium" }, a.title),
              h("p", { className: "text-sm text-[#0F172A]/70 mt-1" }, a.excerpt)
            )
          )
        )
      )
    )
  );
  const listingHead = [
    `<title>Blog — Health &amp; Coverage Research | Sakred Health</title>`,
    `<meta name="description" content="Research-backed articles on daily health, workplace wellness, life insurance, mortgage protection, and final expense planning — every claim cited to its source.">`,
    `<link rel="canonical" href="${BASE_URL}/blog">`,
  ].join("\n    ");
  mkdirSync(join(DIST, "blog"), { recursive: true });
  writeFileSync(join(DIST, "blog", "index.html"), injectIntoTemplate(template, listingHead, listing));

  // llms.txt — a machine-readable map for AI crawlers
  const llms = [
    "# Sakred Health",
    "",
    "> Sakred Health (sakredhealth.com) pairs daily-habit wellness content with insurance coverage: life insurance, mortgage protection, final expense, and health plans. Blog articles are data journalism — every statistic is cited to a primary source (LIMRA, NFDA, NY Fed, CDC, Gallup, peer-reviewed research).",
    "",
    "## Blog posts",
    "",
    ...articles.map((a) => `- [${a.title}](${BASE_URL}/blog/${a.slug}): ${a.excerpt}`),
    "",
    "## Products",
    "",
    `- [Get coverage](${BASE_URL}/get-coverage): quote flow for all products`,
    `- [Life insurance](${BASE_URL}/products/life-insurance)`,
    `- [Mortgage protection](${BASE_URL}/products/mortgage-protection)`,
    `- [Final expense](${BASE_URL}/products/final-expense)`,
    `- [Health insurance](${BASE_URL}/products/health-insurance)`,
  ].join("\n");
  writeFileSync(join(DIST, "llms.txt"), llms);

  // llms-full.txt — complete article text for AI crawlers that want depth
  const llmsFull = articles
    .map((a) =>
      [
        `# ${a.title}`,
        `URL: ${BASE_URL}/blog/${a.slug}`,
        `Summary: ${a.excerpt}`,
        "",
        a.content,
        "",
        "---",
        "",
      ].join("\n")
    )
    .join("\n");
  writeFileSync(join(DIST, "llms-full.txt"), llmsFull);

  // RSS 2.0 feed
  const rssItems = articles
    .map((a) => {
      const d = dates[a.slug]?.publishedAt;
      return [
        "    <item>",
        `      <title>${esc(a.title)}</title>`,
        `      <link>${BASE_URL}/blog/${a.slug}</link>`,
        `      <guid isPermaLink="true">${BASE_URL}/blog/${a.slug}</guid>`,
        `      <description>${esc(a.excerpt)}</description>`,
        d ? `      <pubDate>${new Date(d).toUTCString()}</pubDate>` : "",
        "    </item>",
      ].filter(Boolean).join("\n");
    })
    .join("\n");
  const rss = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0">`,
    `  <channel>`,
    `    <title>Sakred Health Blog</title>`,
    `    <link>${BASE_URL}/blog</link>`,
    `    <description>Data-driven research on daily health, workplace wellness, life insurance, mortgage protection, and final expense planning — every claim cited to its source.</description>`,
    `    <language>en-us</language>`,
    rssItems,
    `  </channel>`,
    `</rss>`,
  ].join("\n");
  writeFileSync(join(DIST, "blog", "feed.xml"), rss);

  console.log(`[prerender] wrote ${articles.length} posts + blog index + feed.xml + llms.txt + llms-full.txt`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((err) => {
    console.error("[prerender] failed (build continues):", err.message);
  });
}
