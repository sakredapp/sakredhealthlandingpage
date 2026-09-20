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
import { foodData, levelConfig } from "../client/src/data/food-chart";
import { getStateCopy } from "../client/src/data/state-copy";
import { SEED_MODALITIES } from "../client/src/data/modalities";
import STATS from "../client/src/data/state-stats.json";

/**
 * The app's five pillars. Mirrors client/src/pages/AppPage.tsx — if you change
 * one, change both: this is the copy crawlers and unfurlers see.
 */
const APP_PILLARS = [
  { title: "Discover", body: "Find trusted practitioners, practices and health resources near you — the same network the website maps, with the places you save kept between visits." },
  { title: "Protocols", body: "Follow Sakred protocols, and — as the network fills in — the plans your own practitioner assigns. Sequenced day by day." },
  { title: "Community", body: "Ask who's worth seeing and answer for someone else. Real experiences from people who have already been." },
  { title: "Resources", body: "The library of guides and cited research, plus the Real Foods Market." },
  { title: "Policies", body: "Eligible Sakred clients can see their coverage, documents and member IDs, and message their agent." },
];

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
    const full = `${p.title} — ${p.tagline} | Sakred Health`;
    const title = full.length <= 60 ? full : truncate(`${p.title} | Sakred Health`, 60);
    const desc = truncate(p.blurb, 155);
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
        title: "Coverage Options — Life, Health & Mortgage Protection",
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

  // /app — the five pillars, matching the rewritten page. NOT detox, streaks
  // or wearable sync: the crawlable copy has to say what the page says.
  const appBody = `
    <main class="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-[#F1EEE7]">
      <article class="max-w-3xl mx-auto prose prose-lg">
        <h1>The Sakred Health app</h1>
        <p>Find trusted practitioners and practices near you, follow care protocols
        between appointments, learn from the community, and access your Sakred coverage —
        one app for iOS and Android, free to download.</p>
        ${APP_PILLARS.map(
          (p) => `
        <section>
          <h2>${esc(p.title)}</h2>
          <p>${esc(p.body)}</p>
        </section>`
        ).join("")}
        <h2>Protocols you can follow</h2>
        <ul>${PROTOCOLS.map(
          (p) => `<li><a href="/blog/${p.postSlug}">${esc(p.name)} — ${p.days}-day protocol</a></li>`
        ).join("")}</ul>
        <p><a href="/discover">Search the network</a> · <a href="/resources">Resources</a> ·
        <a href="/products">Coverage</a></p>
      </article>
    </main>`;
  const appHead = buildHead({
    title: "The Sakred Health App — Find Care, Follow Protocols",
    description:
      "Find trusted practitioners near you, follow care protocols between visits, learn from the community, and access your Sakred coverage — one app for iOS and Android.",
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
            "A trusted navigation layer for real-world health: discover practitioners and practices near you, follow care protocols, learn from the community, and access Sakred insurance coverage.",
          featureList: APP_PILLARS.map((p) => p.title).join(", "),
          publisher: { "@type": "Organization", name: "Sakred Health", url: BASE_URL },
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
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

  // /food-chart — 197 rated foods, rendered as crawlable HTML. This page was
  // not prerendered at all, so it inherited the homepage fallback's title/H1.
  const totalFoods = foodData.reduce((n, c) => n + c.items.length, 0);
  const foodBody = `
    <main class="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-[#F9F9F7]">
      <article class="max-w-3xl mx-auto prose prose-lg">
        <h1>Anti-Inflammatory Food Chart</h1>
        <p>${totalFoods} everyday foods rated on a seven-point scale from strongly
        anti-inflammatory to highly inflammatory. Chronic inflammation is a shared
        driver across metabolic, cardiovascular, and digestive conditions, and diet
        is one of the inputs you control daily. Both ends of this scale have a place
        in a balanced diet — awareness is the goal, not restriction.</p>
        <h2>The scale</h2>
        <ul>${([3, 2, 1, 0, -1, -2, -3] as const)
          .map((l) => `<li><strong>${esc(levelConfig[l].label)}</strong></li>`)
          .join("")}</ul>
        ${foodData
          .map(
            (c) => `
        <section>
          <h2>${esc(c.category)}</h2>
          <p>${esc(c.description)} (${c.items.length} items)</p>
          <ul>${[...c.items]
            .sort((a, b) => b.level - a.level)
            .map((it) => `<li>${esc(it.name)} — ${esc(levelConfig[it.level].label)}</li>`)
            .join("")}</ul>
        </section>`
          )
          .join("")}
        <p>Explore more health resources: the <a href="/resources">library</a>, the
        <a href="/blog">research</a>, or <a href="/discover">a practitioner near you</a>
        who can tell you which parts of this matter for you.</p>
      </article>
    </main>`;
  const foodHead = buildHead({
    title: `Anti-Inflammatory Food Chart — ${totalFoods} Foods Rated`,
    description: `${totalFoods} everyday foods rated from strongly anti-inflammatory to highly inflammatory, across fruits, vegetables, grains, proteins, fats, and seasonings.`,
    path: "/food-chart",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Dataset",
          name: "Sakred Health Anti-Inflammatory Food Chart",
          description: `${totalFoods} foods rated on a seven-point inflammation scale.`,
          url: `${BASE_URL}/food-chart`,
          creator: { "@type": "Organization", name: "Sakred Health", url: BASE_URL },
          variableMeasured: "Inflammation rating",
          keywords: foodData.map((c) => c.category).join(", "),
        },
        breadcrumb([
          { name: "Home", path: "/" },
          { name: "Food Chart", path: "/food-chart" },
        ]),
      ],
    },
  });
  mkdirSync(join(DIST, "food-chart"), { recursive: true });
  writeFileSync(join(DIST, "food-chart", "index.html"), injectIntoTemplate(template, foodHead, foodBody));
  count++;

  // Lightweight static heads for stable pages the SPA otherwise leaves generic
  const simplePages: { path: string; title: string; description: string; h1: string; body: string }[] = [
    {
      path: "/get-coverage",
      title: "Get Coverage — Free Quote in Minutes",
      description:
        "Tell us about your household and get matched with life, health, mortgage protection, or retirement coverage. Licensed in all 50 states. Free consultation.",
      h1: "Get coverage built around your household",
      body:
        "Answer a few questions about your household and a licensed agent will match you with the right mix of health, life, mortgage protection, and retirement coverage. Free consultation, no obligation, no pressure — and licensed in all 50 states.",
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
    const body = `
    <main class="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-[#F9F9F7]">
      <div class="max-w-3xl mx-auto prose prose-lg">
        <h1>${esc(pg.h1)}</h1>
        <p>${esc(pg.body)}</p>
        <p><a href="/products">See coverage options</a> · <a href="/app">The Sakred app</a> · <a href="/blog">Research</a></p>
      </div>
    </main>`;
    writeFileSync(join(dir, "index.html"), injectIntoTemplate(template, head, body));
    count++;
  }

  // ---- Network pages: /discover, /resources, /for-practitioners, /recommend
  //
  // Static heads and real crawlable copy. The directory results themselves are
  // client-rendered from the canonical tables (and prerendered separately by
  // prerender-network.mjs when the network is configured) — but the editorial
  // framing around them is known at build time and belongs in the HTML.
  const networkPages: {
    path: string;
    title: string;
    description: string;
    body: string;
    jsonLd?: object;
  }[] = [
    {
      path: "/discover",
      title: "Find Trusted Practitioners Near You — Sakred Health",
      description:
        "Search the Sakred Health Network for trusted practitioners, practices and health resources near you. Every practice is reviewed by a person before it is published.",
      body: `
        <h1>Find trusted care around you</h1>
        <p>Discover practitioners, practices and health resources selected for a more
        intentional approach to health. Search by modality, by city, or by moving the map.</p>
        <h2>Browse by modality</h2>
        <ul>${SEED_MODALITIES.map(
          (m) => `<li><a href="/discover/${m.slug}">${esc(m.name)}</a> — ${esc(m.description)}</li>`
        ).join("")}</ul>
        <h2>How practices are verified</h2>
        <p>Listed, Credential Verified, Sakred Reviewed and Sakred Verified are four
        states, in order — each one a check somebody performed. A practitioner may
        request consideration; they cannot award themselves a state, and there is
        nothing to buy.</p>
        <p><a href="/recommend">Recommend a practitioner</a> ·
        <a href="/for-practitioners">Are you a practitioner?</a></p>`,
    },
    {
      path: "/resources",
      title: "Resources — Library, Real Foods Market & Food Chart",
      description:
        "Cited guides and research, the Real Foods Market, and an anti-inflammatory food chart rating 197 everyday foods — the Sakred Health resource library.",
      body: `
        <h1>Know enough to ask better questions</h1>
        <p>Three places to read, look things up, and decide what to bring to your next
        appointment. All of it free, all of it cited.</p>
        <h2>Library</h2>
        <p>Long-form writing on the things that actually move health, with the studies
        attached and the caveats left in. <a href="/blog">Browse the library</a>.</p>
        <h2>Real Foods Market</h2>
        <p>Foods, products and trusted resources — what we would actually buy, and the
        specific reason it made the list. The Market lives in the
        <a href="/app">Sakred Health app</a>.</p>
        <h2>Food Chart</h2>
        <p>${totalFoods} everyday foods rated on a seven-point inflammation scale, searchable
        and filterable. <a href="/food-chart">Open the food chart</a>.</p>`,
    },
    {
      path: "/for-practitioners",
      title: "For Practitioners — Join the Sakred Health Network",
      description:
        "Sakred Health is building a curated network across traditional, holistic and integrative care. Request consideration for your practice — verification is earned, never purchased.",
      body: `
        <h1>Help us build a better health network</h1>
        <p>Sakred Health is building a curated network across traditional, holistic and
        integrative care — the practitioners people already recommend to each other, in
        one place a stranger can actually find.</p>
        <h2>What being in the network means</h2>
        <ul>
          <li><strong>Public discovery</strong> — a profile that appears on the map and in search</li>
          <li><strong>A real professional profile</strong> — your space, your practitioners, your credentials</li>
          <li><strong>Protocol delivery</strong> — assign the plan a client leaves with (coming to the network)</li>
          <li><strong>Community context</strong> — the conversations people already have about where to go</li>
          <li><strong>No pay-to-buy verification</strong> — no tier to purchase, no placement to sponsor</li>
        </ul>
        <h2>How review works</h2>
        <p>You can ask to be considered. You cannot award yourself a state, and there is
        nothing to buy. <a href="/recommend?kind=location">Request consideration</a>.</p>`,
    },
    {
      path: "/recommend",
      title: "Recommend a Practitioner — Sakred Health Network",
      description:
        "Know a practitioner or practice that belongs in the Sakred Health Network? Tell us about them. Every recommendation is reviewed by a person.",
      body: `
        <h1>Who should be on the map?</h1>
        <p>The best practitioners are usually found by word of mouth, not by search. If
        someone changed how you feel, tell us — that is how the network grows.</p>
        <p>Every recommendation goes into a review queue and is read by a person. Nothing
        is published automatically.</p>
        <p><a href="/discover">Back to the map</a> ·
        <a href="/for-practitioners">Are you a practitioner?</a></p>`,
    },
  ];

  for (const page of networkPages) {
    const head = buildHead({
      title: page.title,
      description: page.description,
      path: page.path,
      jsonLd: page.jsonLd ?? {
        "@context": "https://schema.org",
        "@graph": [
          breadcrumb([
            { name: "Home", path: "/" },
            { name: page.title.split(" — ")[0], path: page.path },
          ]),
        ],
      },
    });
    const dir = join(DIST, page.path.slice(1));
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "index.html"),
      injectIntoTemplate(
        template,
        head,
        `<main class="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-[#F1EEE7]"><article class="max-w-3xl mx-auto prose prose-lg">${page.body}</article></main>`
      )
    );
    count++;
  }

  // Modality category pages. Generated only for the seed vocabulary, which is
  // a short, curated list — this is deliberately NOT a loop over every possible
  // modality × city pair. Thin pages at scale are a penalty, not a strategy.
  for (const modality of SEED_MODALITIES) {
    const head = buildHead({
      title: `${modality.name} Practitioners — Sakred Health Network`,
      description: truncate(
        `Find ${modality.name.toLowerCase()} practitioners on the Sakred Health Network. ${modality.description}`,
        158
      ),
      path: `/discover/${modality.slug}`,
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          breadcrumb([
            { name: "Home", path: "/" },
            { name: "Discover", path: "/discover" },
            { name: modality.name, path: `/discover/${modality.slug}` },
          ]),
        ],
      },
    });
    const body = `
    <main class="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-[#F1EEE7]">
      <article class="max-w-3xl mx-auto prose prose-lg">
        <h1>${esc(modality.name)}</h1>
        <p>${esc(modality.description)}</p>
        <p>Practices offering ${esc(modality.name.toLowerCase())} appear on the map above once
        they have been reviewed and published. <a href="/discover">Search the whole
        network</a>, or <a href="/recommend">recommend a practitioner</a> you think
        belongs here.</p>
      </article>
    </main>`;
    const dir = join(DIST, "discover", modality.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), injectIntoTemplate(template, head, body));
    count++;
  }

  // Homepage — dist/index.html is also the SPA fallback, so it must be written
  // LAST (the template was read at the top of main() and is unaffected).
  // Network-first: the crawler-facing homepage now leads with finding care,
  // with coverage as the substantial secondary pillar it is on the real page.
  const homeBody = `
    <main class="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-[#F1EEE7]">
      <div class="max-w-3xl mx-auto prose prose-lg">
        <p>The Sakred Health Network</p>
        <h1>Find trusted care around you.</h1>
        <p>Discover practitioners, practices and health resources selected for a more
        intentional approach to health — then follow what to do between appointments.</p>
        <p><a href="/discover">Explore the network</a> ·
        <a href="/recommend">Recommend a practitioner</a> ·
        <a href="/products">Looking for insurance coverage?</a></p>

        <h2>Know who you're choosing</h2>
        <p>Every practice carries a public trust state: Listed, Credential Verified,
        Sakred Reviewed, or Sakred Verified. Four states, in order, each one a check
        somebody performed. A practitioner may request consideration; they cannot award
        themselves a state.</p>

        <h2>Browse by modality</h2>
        <ul>${SEED_MODALITIES.map(
          (m) => `<li><a href="/discover/${m.slug}">${esc(m.name)}</a></li>`
        ).join("")}</ul>

        <h2>Care doesn't stop when the appointment ends</h2>
        <p>Sakred protocols keep guidance organised between visits, in the
        <a href="/app">Sakred Health app</a> — alongside the network, the community,
        the library and your policies.</p>
        <ul>${PROTOCOLS.map(
          (p) => `<li><a href="/blog/${p.postSlug}">${esc(p.name)} — ${p.days}-day protocol</a></li>`
        ).join("")}</ul>

        <h2>Your health deserves protection too</h2>
        <p>Sakred also helps families protect their health, income, home and retirement
        with licensed insurance guidance — one dedicated agent, all 50 states.</p>
        <ul>${PRODUCTS.map(
          (p) => `<li><a href="/products/${p.slug}">${esc(p.title)}</a> — ${esc(p.tagline)}</li>`
        ).join("")}</ul>
        <p><a href="/products">Explore coverage</a> · <a href="/get-coverage">Get a quote</a></p>

        <h2>Learn</h2>
        <p>We publish cited research on health, food, practice and coverage —
        <a href="/blog">read the library</a>, or look up a food in the
        <a href="/food-chart">anti-inflammatory food chart</a>.</p>
      </div>
    </main>`;
  const homeHead = buildHead({
    title: "Sakred Health — Find Trusted Practitioners & Care Near You",
    description:
      "Discover trusted practitioners, practices and health resources near you on the Sakred Health Network — plus care protocols, research, and licensed insurance guidance.",
    path: "/",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${BASE_URL}/#organization`,
          name: "Sakred Health",
          url: BASE_URL,
          description:
            "A trusted navigation layer for real-world health: a curated network of practitioners and practices, care protocols, health education, and licensed insurance guidance.",
          areaServed: { "@type": "Country", name: "United States" },
          subOrganization: {
            "@type": "InsuranceAgency",
            name: "Sakred Health Insurance Services",
            url: `${BASE_URL}/products`,
            areaServed: { "@type": "Country", name: "United States" },
          },
        },
        {
          "@type": "WebSite",
          name: "Sakred Health",
          url: BASE_URL,
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${BASE_URL}/discover?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
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
