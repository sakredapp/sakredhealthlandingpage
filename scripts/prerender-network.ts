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
import {
  locationPlace,
  modalityLine,
  type HealthLocation,
  type HealthPractitioner,
} from "../shared/health-network.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const BASE_URL = "https://www.sakredhealth.com";

const esc = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const truncate = (value: string, n: number): string =>
  value.length <= n ? value : `${value.slice(0, n - 1).trimEnd()}…`;

interface HeadArgs {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  jsonLd: unknown;
}

function buildHead({ title, description, path, image, jsonLd }: HeadArgs): string {
  const url = `${BASE_URL}${path}`;
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${esc(image || `${BASE_URL}/og-image.jpg`)}">`,
    `<meta property="og:site_name" content="Sakred Health">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/<\//g, "<\\/")}</script>`,
  ].join("\n    ");
}

function injectIntoTemplate(template: string, headExtra: string, bodyHtml: string): string {
  let out = template
    .replace(/<title>[\s\S]*?<\/title>\s*/, "")
    .replace(/<meta name="description"[^>]*>\s*/g, "")
    .replace(/<link rel="canonical"[^>]*>\s*/g, "")
    .replace(/<meta (?:property="og:|name="twitter:)[^>]*>\s*/g, "");
  out = out.replace("</head>", () => `    ${headExtra}\n  </head>`);
  out = out.replace(
    /(<div id="root">)([\s\S]*?)(<\/div>)/,
    (_m, open, _inner, close) => `${open}${bodyHtml}${close}`
  );
  return out;
}

const breadcrumb = (items: { name: string; path: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: `${BASE_URL}${item.path}`,
  })),
});

/**
 * Opening hours in schema.org's format, from the canonical periods.
 *
 * Emitted only when hours actually exist. A practice with none must not get an
 * empty `openingHoursSpecification` — an empty array reads to a consumer as
 * "never open", which is the structured-data version of the same mistake the
 * page itself is careful not to make.
 */
function openingHours(location: HealthLocation) {
  if (!location.hours?.length) return {};
  const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return {
    openingHoursSpecification: location.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${DAYS[h.day]}`,
      opens: h.opens,
      closes: h.closes,
    })),
  };
}

function locationPage(location: HealthLocation) {
  const place = locationPlace(location.city, location.region);
  const modalities = modalityLine(location.modalities, 4);
  const title = `${location.name} — ${place} | Sakred Health`;
  const description = truncate(
    location.sakredNote ||
      location.about ||
      `${location.name} in ${place}${modalities ? `. ${modalities}.` : "."} Listed in the Sakred Health Network.`,
    155
  );

  const address = [
    location.addressLine1,
    location.addressLine2,
    place,
    location.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  const body = `
      <main>
        <h1>${esc(location.name)}</h1>
        <p>${esc(place)}</p>
        ${location.about ? `<p>${esc(location.about)}</p>` : ""}
        ${location.sakredNote ? `<h2>Why Sakred recommends them</h2><p>${esc(location.sakredNote)}</p>` : ""}
        ${location.whatTheyDoWell ? `<h2>What they do well</h2><p>${esc(location.whatTheyDoWell)}</p>` : ""}
        ${location.goodFor ? `<h2>Good for</h2><p>${esc(location.goodFor)}</p>` : ""}
        ${location.cautions ? `<h2>Worth knowing</h2><p>${esc(location.cautions)}</p>` : ""}
        ${
          location.modalities.length
            ? `<h2>Modalities</h2><ul>${location.modalities
                .map((m) => `<li><a href="/discover/${esc(m.slug)}">${esc(m.name)}</a></li>`)
                .join("")}</ul>`
            : ""
        }
        ${
          location.practitioners.length
            ? `<h2>Practitioners</h2><ul>${location.practitioners
                .map(
                  (p) =>
                    `<li><a href="/practitioners/${esc(p.slug)}">${esc(p.name)}</a>${
                      p.headline ? ` — ${esc(p.headline)}` : ""
                    }</li>`
                )
                .join("")}</ul>`
            : ""
        }
        ${address ? `<h2>Address</h2><p>${esc(address)}</p>` : ""}
        ${location.phone ? `<p>${esc(location.phone)}</p>` : ""}
        ${location.website ? `<p><a href="${esc(location.website)}" rel="nofollow noopener">Website</a></p>` : ""}
      </main>`;

  const head = buildHead({
    title,
    description,
    path: `/locations/${location.slug}`,
    image: location.photo?.url,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          // LocalBusiness, not MedicalBusiness: the network spans practices
          // that are not medical, and overclaiming the type is a claim.
          "@type": "LocalBusiness",
          "@id": `${BASE_URL}/locations/${location.slug}`,
          name: location.name,
          url: `${BASE_URL}/locations/${location.slug}`,
          ...(location.phone ? { telephone: location.phone } : {}),
          ...(location.website ? { sameAs: [location.website] } : {}),
          ...(location.photo?.url ? { image: location.photo.url } : {}),
          address: {
            "@type": "PostalAddress",
            ...(location.addressLine1 ? { streetAddress: location.addressLine1 } : {}),
            addressLocality: location.city,
            addressRegion: location.region,
            ...(location.postalCode ? { postalCode: location.postalCode } : {}),
            addressCountry: location.country ?? "US",
          },
          ...(Number.isFinite(location.lat) && Number.isFinite(location.lng)
            ? {
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: location.lat,
                  longitude: location.lng,
                },
              }
            : {}),
          ...openingHours(location),
          // No aggregateRating. We do not own defensible rating data, and
          // inventing one to win a rich result would be a lie in a schema.
        },
        breadcrumb([
          { name: "Discover", path: "/discover" },
          { name: location.name, path: `/locations/${location.slug}` },
        ]),
      ],
    },
  });

  return { head, body };
}

function practitionerPage(practitioner: HealthPractitioner) {
  const where = practitioner.locations[0];
  const place = where ? locationPlace(where.city, where.region) : "";
  const title = `${practitioner.name}${place ? ` — ${place}` : ""} | Sakred Health`;
  const description = truncate(
    practitioner.sakredNote ||
      practitioner.bio ||
      `${practitioner.name}${practitioner.headline ? `, ${practitioner.headline}` : ""}${
        place ? `, ${place}` : ""
      }. Listed in the Sakred Health Network.`,
    155
  );

  const body = `
      <main>
        <h1>${esc(practitioner.name)}</h1>
        ${practitioner.headline ? `<p>${esc(practitioner.headline)}</p>` : ""}
        ${practitioner.bio ? `<p>${esc(practitioner.bio)}</p>` : ""}
        ${practitioner.sakredNote ? `<h2>Why Sakred recommends them</h2><p>${esc(practitioner.sakredNote)}</p>` : ""}
        ${
          practitioner.modalities.length
            ? `<h2>Modalities</h2><ul>${practitioner.modalities
                .map((m) => `<li><a href="/discover/${esc(m.slug)}">${esc(m.name)}</a></li>`)
                .join("")}</ul>`
            : ""
        }
        ${
          practitioner.locations.length
            ? `<h2>Where they practise</h2><ul>${practitioner.locations
                .map(
                  (l) =>
                    `<li><a href="/locations/${esc(l.slug)}">${esc(l.name)}</a> — ${esc(
                      locationPlace(l.city, l.region)
                    )}</li>`
                )
                .join("")}</ul>`
            : ""
        }
      </main>`;

  const head = buildHead({
    title,
    description,
    path: `/practitioners/${practitioner.slug}`,
    image: practitioner.photo?.url,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          // Person, not Physician: not everyone in the network is a physician,
          // and the schema should not imply a licence the record doesn't claim.
          "@type": "Person",
          "@id": `${BASE_URL}/practitioners/${practitioner.slug}`,
          name: practitioner.name,
          url: `${BASE_URL}/practitioners/${practitioner.slug}`,
          ...(practitioner.headline ? { jobTitle: practitioner.headline } : {}),
          ...(practitioner.photo?.url ? { image: practitioner.photo.url } : {}),
          ...(where
            ? {
                workLocation: {
                  "@type": "Place",
                  name: where.name,
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: where.city,
                    addressRegion: where.region,
                  },
                },
              }
            : {}),
        },
        breadcrumb([
          { name: "Discover", path: "/discover" },
          { name: practitioner.name, path: `/practitioners/${practitioner.slug}` },
        ]),
      ],
    },
  });

  return { head, body };
}

async function main() {
  if (!isNetworkConfigured()) {
    console.log(
      "[prerender-network] not configured (HEALTH_NETWORK_SUPABASE_URL/_ANON_KEY unset) — skipping. Network pages will render client-side."
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
    const { head, body } = locationPage(location);
    const dir = join(DIST, "locations", slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), injectIntoTemplate(template, head, body));
    written++;
  }

  for (const { slug } of slugs.practitioners) {
    const practitioner = await getPractitionerBySlug(slug);
    if (!practitioner) {
      console.error(`[prerender-network] /practitioners/${slug} resolved to nothing — skipping.`);
      skipped++;
      continue;
    }
    const { head, body } = practitionerPage(practitioner);
    const dir = join(DIST, "practitioners", slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), injectIntoTemplate(template, head, body));
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
