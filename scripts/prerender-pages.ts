/**
 * Prerenders product pages, the products index, and all 51 state
 * mortgage-protection pages to static HTML in dist/, so crawlers and link
 * unfurlers get real content, per-page titles/descriptions/OG tags, and
 * JSON-LD without executing JavaScript. The React SPA still mounts on load
 * and replaces the static content for real visitors.
 *
 * Run with tsx after `vite build` (it imports the client TS data modules —
 * the same source of truth the React pages render from, so content cannot
 * drift). Never fails the build.
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { PRODUCTS, type Product } from "../client/src/data/products";
import { PROTOCOLS } from "../client/src/data/protocols";
import { STATES } from "../client/src/data/states";
import { getStateCopy } from "../client/src/data/state-copy";
import STATS from "../client/src/data/state-stats.json";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const BASE_URL = "https://www.sakredhealth.com";

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const truncate = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…");

/** Blog articles to surface as related research on each product page. */
const PRODUCT_RESEARCH: Record<string, { slug: string; title: string }[]> = {
  "mortgage-protection": [
    { slug: "american-mortgage-debt-statistics-mortgage-protection-data", title: "American Mortgage Debt Hits $13.19 Trillion: The 2026 Data Behind Mortgage Protection" },
    { slug: "life-insurance-statistics-coverage-gap-what-the-data-shows", title: "The Life Insurance Coverage Gap: What 2025–2026 Data Actually Shows" },
  ],
  "final-expense": [
    { slug: "average-funeral-cost-data-final-expense-planning", title: "What a Funeral Actually Costs: The Data Behind Final Expense Planning" },
    { slug: "long-term-care-costs-statistics-aging-in-america", title: "What Aging Actually Costs: The Long-Term Care Numbers Every Family Should See" },
  ],
  "life-insurance": [
    { slug: "life-insurance-statistics-coverage-gap-what-the-data-shows", title: "The Life Insurance Coverage Gap: What 2025–2026 Data Actually Shows" },
    { slug: "american-mortgage-debt-statistics-mortgage-protection-data", title: "American Mortgage Debt Hits $13.19 Trillion: The 2026 Data Behind Mortgage Protection" },
  ],
  "health-insurance": [
    { slug: "health-insurance-premium-statistics-2026-what-coverage-costs", title: "What Health Insurance Actually Costs in 2026: Premium Data From KFF and CMS" },
    { slug: "healthcare-costs-retirement-medical-debt-statistics", title: "The Price of Getting Sick in America: Retirement Health Costs and Medical Debt" },
  ],
  "aca-plans": [
    { slug: "health-insurance-premium-statistics-2026-what-coverage-costs", title: "What Health Insurance Actually Costs in 2026: Premium Data From KFF and CMS" },
  ],
  "retirement-annuities": [
    { slug: "retirement-savings-statistics-by-age-readiness-data", title: "How Much Americans Actually Have Saved for Retirement: The Data by Age" },
    { slug: "long-term-care-costs-statistics-aging-in-america", title: "What Aging Actually Costs: The Long-Term Care Numbers Every Family Should See" },
  ],
};

function buildHead(opts: {
  title: string;
  description: string;
  path: string;
  jsonLd: object;
}): string {
  const url = `${BASE_URL}${opts.path}`;
  return [
    `<title>${esc(opts.title)}</title>`,
    `<meta name="description" content="${esc(opts.description)}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${esc(opts.title)}">`,
    `<meta property="og:description" content="${esc(opts.description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${BASE_URL}/og-image.jpg">`,
    `<meta property="og:site_name" content="Sakred Health">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(opts.title)}">`,
    `<meta name="twitter:description" content="${esc(opts.description)}">`,
    `<script type="application/ld+json">${JSON.stringify(opts.jsonLd).replace(/<\//g, "<\\/")}</script>`,
  ].join("\n    ");
}

function injectIntoTemplate(template: string, headExtra: string, bodyHtml: string): string {
  let out = template
    .replace(/<title>[\s\S]*?<\/title>\s*/, "")
    .replace(/<meta name="description"[^>]*>\s*/g, "")
    .replace(/<link rel="canonical"[^>]*>\s*/g, "")
    .replace(/<meta (?:property="og:|name="twitter:)[^>]*>\s*/g, "");
  // Replacer functions: literal `$1`/`$2` in page copy must not be
  // interpreted as backreferences by String.replace.
  out = out.replace("</head>", () => `    ${headExtra}\n  </head>`);
  out = out.replace(
    /(<div id="root">)([\s\S]*?)(<\/div>)/,
    (_m, open, _inner, close) => `${open}${bodyHtml}${close}`
  );
  return out;
}

function breadcrumb(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${BASE_URL}${it.path}`,
    })),
  };
}

function productBody(p: Product): string {
  const sections = (p.detailSections ?? [])
    .map(
      (s) => `
      <section>
        <h2>${esc(s.heading)}</h2>
        ${(s.intro ?? []).map((t) => `<p>${esc(t)}</p>`).join("")}
        <ul>${s.items.map((it) => `<li><strong>${esc(it.name)}:</strong> ${esc(it.description)}</li>`).join("")}</ul>
        ${s.outro ? `<p>${esc(s.outro)}</p>` : ""}
      </section>`
    )
    .join("");
  const research = PRODUCT_RESEARCH[p.slug] ?? [];
  return `
    <main class="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-[#F9F9F7]">
      <article class="max-w-3xl mx-auto prose prose-lg">
        <p>${esc(p.eyebrow)}</p>
        <h1>${esc(p.title)}</h1>
        <p><strong>${esc(p.tagline)}</strong></p>
        <p>${esc(p.blurb)}</p>
        <ul>${p.points.map((pt) => `<li>${esc(pt)}</li>`).join("")}</ul>
        ${sections}
        ${
          research.length
            ? `<section><h2>Research from our blog</h2><ul>${research
                .map((r) => `<li><a href="/blog/${r.slug}">${esc(r.title)}</a></li>`)
                .join("")}</ul></section>`
            : ""
        }
        <p><a href="/get-coverage">Get a personalized quote</a> or browse <a href="/products">all coverage options</a>.</p>
      </article>
    </main>`;
}

function main() {
  const template = readFileSync(join(DIST, "index.html"), "utf8");
  let count = 0;

  // Product detail pages
  for (const p of PRODUCTS) {
    const title = truncate(`${p.title} — ${p.tagline} | Sakred Health`, 65);
    const desc = truncate(p.blurb, 158);
    const head = buildHead({
      title,
      description: desc,
      path: `/products/${p.slug}`,
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Service",
            name: p.title,
            description: p.blurb,
            serviceType: p.title,
            areaServed: { "@type": "Country", name: "United States" },
            provider: { "@type": "InsuranceAgency", name: "Sakred Health", url: BASE_URL },
            url: `${BASE_URL}/products/${p.slug}`,
          },
          breadcrumb([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: p.title, path: `/products/${p.slug}` },
          ]),
        ],
      },
    });
    const dir = join(DIST, "products", p.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), injectIntoTemplate(template, head, productBody(p)));
    count++;
  }

  // Products index
  const productsIndexBody = `
    <main class="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-[#F9F9F7]">
      <div class="max-w-3xl mx-auto prose prose-lg">
        <h1>Coverage built around your whole life</h1>
        <ul>${PRODUCTS.map(
          (p) => `<li><a href="/products/${p.slug}">${esc(p.title)}</a> — ${esc(p.tagline)}</li>`
        ).join("")}</ul>
      </div>
    </main>`;
  mkdirSync(join(DIST, "products"), { recursive: true });
  writeFileSync(
    join(DIST, "products", "index.html"),
    injectIntoTemplate(
      template,
      buildHead({
        title: "Insurance Products — Life, Health, Mortgage Protection | Sakred Health",
        description:
          "Mortgage protection, life insurance, final expense, private health, ACA marketplace plans, and retirement annuities — one licensed agency, all 50 states.",
        path: "/products",
        jsonLd: { "@context": "https://schema.org", "@graph": [breadcrumb([{ name: "Home", path: "/" }, { name: "Products", path: "/products" }])] },
      }),
      productsIndexBody
    )
  );
  count++;

  // State mortgage-protection pages
  const allStats = (STATS as any).states;
  const meta = (STATS as any)._meta;
  for (const st of STATES) {
    const stat = allStats[st.abbr];
    if (!stat) continue;
    const copy = getStateCopy(st, stat, allStats);
    const fmt = (n: number | null) => (n == null ? "—" : `$${n.toLocaleString("en-US")}`);
    const pct = (n: number | null) => (n == null ? "—" : `${n}%`);
    const title = truncate(`Mortgage Protection in ${st.name} | Sakred Health`, 65);
    const desc = truncate(copy.intro, 158);
    const body = `
    <main class="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-[#F9F9F7]">
      <article class="max-w-3xl mx-auto prose prose-lg">
        <h1>${esc(copy.headline.text)} ${esc(copy.headline.accent)}</h1>
        <p>${esc(copy.intro)}</p>
        <ul>${copy.points.map((pt) => `<li>${esc(pt)}</li>`).join("")}</ul>
        <h2>${esc(copy.numbersHeading.text)} ${esc(copy.numbersHeading.accent)}</h2>
        <ul>
          <li>Median home value: ${fmt(stat.medianHomeValue)}</li>
          <li>Median monthly owner cost with a mortgage: ${fmt(stat.medianOwnerCostWithMortgage)}</li>
          <li>Median household income: ${fmt(stat.medianHouseholdIncome)}</li>
          <li>Homeownership rate: ${pct(stat.homeownershipRate)}</li>
        </ul>
        <p>Source: <a href="${esc(meta.sourceUrl)}">${esc(meta.source)}</a></p>
        <h2>${esc(copy.whyHeading.text)} ${esc(copy.whyHeading.accent)}</h2>
        <p>${esc(copy.whyBody)}</p>
        <p><a href="/get-coverage">Get a ${esc(st.name)} mortgage protection quote</a> or read the national picture in <a href="/blog/american-mortgage-debt-statistics-mortgage-protection-data">our mortgage debt data report</a>.</p>
      </article>
    </main>`;
    const head = buildHead({
      title,
      description: desc,
      path: `/mortgage-protection/${st.slug}`,
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Service",
            name: `Mortgage Protection Insurance in ${st.name}`,
            description: desc,
            areaServed: { "@type": "State", name: st.name },
            provider: { "@type": "InsuranceAgency", name: "Sakred Health", url: BASE_URL },
            url: `${BASE_URL}/mortgage-protection/${st.slug}`,
          },
          breadcrumb([
            { name: "Home", path: "/" },
            { name: "Mortgage Protection", path: "/products/mortgage-protection" },
            { name: st.name, path: `/mortgage-protection/${st.slug}` },
          ]),
        ],
      },
    });
    const dir = join(DIST, "mortgage-protection", st.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), injectIntoTemplate(template, head, body));
    count++;
  }

  // /app — real crawlable protocol content + MobileApplication schema
  const appBody = `
    <main class="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-[#FDFBF7]">
      <article class="max-w-3xl mx-auto prose prose-lg">
        <h1>The Sakred Health app</h1>
        <p>Guided multi-day wellness protocols with daily habit tracking, streaks, reminders, and
        wearable sync — alongside your policy documents and a dedicated agent, in one app for iOS and Android.</p>
        <h2>Guided programs, scheduled day by day</h2>
        ${PROTOCOLS.map(
          (p) => `
        <section>
          <h3>${esc(p.name)} — ${p.days} days</h3>
          <p>${esc(p.summary)}</p>
          <ul>${p.practices.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
          <p><a href="/blog/${p.postSlug}">Read the full ${p.days}-day guide</a></p>
        </section>`
        ).join("")}
        <h2>What else is in the app</h2>
        <ul>
          <li>Policy cards for health, life, and annuity coverage — premiums, deductibles, member IDs, and documents</li>
          <li>Plain-language policy search and messaging with your dedicated agent</li>
          <li>A habits encyclopedia, guided routines, and daily habit tracking with streaks</li>
          <li>An eBook library with in-app reader and audio</li>
          <li>Wearable sync for Garmin, Oura, WHOOP, and Fitbit</li>
        </ul>
        <p><a href="/get-coverage">Get coverage</a> or browse <a href="/blog">our research library</a>.</p>
      </article>
    </main>`;
  const appHead = buildHead({
    title: "Health App with Guided Detox, Gut & Sleep Routines | Sakred Health",
    description:
      "Guided multi-day wellness protocols — liver detox, gut reset, lymphatic drainage, and sleep — with habit tracking, streaks, reminders, and wearable sync. Plus your policy and agent in one app.",
    path: "/app",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "MobileApplication",
          name: "Sakred Health",
          operatingSystem: "iOS, Android",
          applicationCategory: "HealthApplication",
          url: `${BASE_URL}/app`,
          description:
            "Guided multi-day wellness protocols with daily habit tracking, streaks, and wearable sync, alongside insurance policy management and a dedicated agent.",
          featureList: PROTOCOLS.map((p) => `${p.name} (${p.days}-day guided protocol)`).join(", "),
          publisher: { "@type": "Organization", name: "Sakred Health", url: BASE_URL },
        },
        breadcrumb([
          { name: "Home", path: "/" },
          { name: "App", path: "/app" },
        ]),
      ],
    },
  });
  mkdirSync(join(DIST, "app"), { recursive: true });
  writeFileSync(join(DIST, "app", "index.html"), injectIntoTemplate(template, appHead, appBody));
  count++;

  // Lightweight static heads for stable pages the SPA otherwise leaves generic
  const simplePages: { path: string; title: string; description: string }[] = [
    {
      path: "/about",
      title: "Our Story — Why Sakred Health Exists | Sakred Health",
      description:
        "Sakred Health pairs daily-habit wellness with real coverage — life, health, mortgage protection, and retirement — through one licensed agency and a dedicated agent.",
    },
    {
      path: "/get-coverage",
      title: "Get Coverage — Free Quote in Minutes | Sakred Health",
      description:
        "Tell us about your household and get matched with life, health, mortgage protection, or retirement coverage. Licensed in all 50 states. Free consultation.",
    },
  ];
  for (const pg of simplePages) {
    const head = buildHead({
      title: pg.title,
      description: pg.description,
      path: pg.path,
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [breadcrumb([{ name: "Home", path: "/" }, { name: pg.title.split(" — ")[0], path: pg.path }])],
      },
    });
    const dir = join(DIST, pg.path.slice(1));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), injectIntoTemplate(template, head, ""));
    count++;
  }

  // Homepage — dist/index.html is also the SPA fallback, so it must be written
  // LAST (the template was read at the top of main() and is unaffected).
  // Without this the crawler-facing homepage was an empty <div id="root">:
  // no H1, no copy. React replaces this markup on mount.
  const homeBody = `
    <main class="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-[#F9F9F7]">
      <div class="max-w-3xl mx-auto prose prose-lg">
        <p>Mortgage Protection · Life · Health · Retirement</p>
        <h1>Your whole life, covered.</h1>
        <p>The health plan, the mortgage protection, and the retirement income behind it —
        built together by one dedicated agent who knows your family. Licensed in all 50 states.</p>
        <p><a href="/get-coverage">Get a free quote</a> · <a href="/products">See plans in your area</a></p>
        <h2>What we protect</h2>
        <ul>${PRODUCTS.map(
          (p) => `<li><a href="/products/${p.slug}">${esc(p.title)}</a> — ${esc(p.tagline)}</li>`
        ).join("")}</ul>
        <h2>Wellness built in</h2>
        <p>Every household we cover gets the <a href="/app">Sakred Health app</a>: guided
        multi-day protocols for sleep, gut, liver, and lymphatic health, daily habit tracking,
        and your policy documents and agent in the same place.</p>
        <ul>${PROTOCOLS.map(
          (p) => `<li><a href="/blog/${p.postSlug}">${esc(p.name)} — ${p.days}-day protocol</a></li>`
        ).join("")}</ul>
        <h2>Research</h2>
        <p>We publish cited research on coverage and daily health — read
        <a href="/blog">the full library</a>.</p>
      </div>
    </main>`;
  const homeHead = buildHead({
    title: "Sakred Health — Health, Life & Mortgage Protection",
    description:
      "One licensed agency for health, life, mortgage protection, and retirement coverage — with a dedicated agent in all 50 states. Free consultation.",
    path: "/",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "InsuranceAgency",
          name: "Sakred Health",
          url: BASE_URL,
          areaServed: { "@type": "Country", name: "United States" },
          description:
            "Licensed insurance agency offering health, life, mortgage protection, final expense, and retirement coverage in all 50 states, with a wellness app included.",
        },
        {
          "@type": "WebSite",
          name: "Sakred Health",
          url: BASE_URL,
        },
      ],
    },
  });
  writeFileSync(join(DIST, "index.html"), injectIntoTemplate(template, homeHead, homeBody));
  count++;

  console.log(`[prerender-pages] wrote ${count} static pages (home + products + states + core)`);
}

try {
  main();
} catch (err: any) {
  console.error("[prerender-pages] failed (build continues):", err?.message);
}
