/**
 * Provider page HTML (head tags, JSON-LD and a crawlable body) for
 * /locations/<slug> and /practitioners/<slug>.
 *
 * One renderer, two callers:
 *
 *   scripts/prerender-network.ts   writes static files at build time, when the
 *                                  build has the network credentials
 *   api/network/canonical.ts       renders the same HTML on request, cached at
 *                                  the edge
 *
 * The second caller is why this lives under api/_lib. Builds moved off Vercel
 * to our own build box, and Vercel never hands a Sensitive variable to an
 * outside build, so that build cannot read the network. The function can, at
 * runtime. Both produce byte-identical pages because both call this file.
 */
import {
  locationPlace,
  modalityLine,
  type HealthLocation,
  type HealthPractitioner,
} from "../../shared/health-network.js";

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

export function injectIntoTemplate(template: string, headExtra: string, bodyHtml: string): string {
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

export function locationPage(location: HealthLocation) {
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

export function practitionerPage(practitioner: HealthPractitioner) {
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

/** The full document for one location: the app shell with this page injected. */
export function renderLocationHtml(template: string, location: HealthLocation): string {
  const { head, body } = locationPage(location);
  return injectIntoTemplate(template, head, body);
}

/** The full document for one practitioner. */
export function renderPractitionerHtml(template: string, practitioner: HealthPractitioner): string {
  const { head, body } = practitionerPage(practitioner);
  return injectIntoTemplate(template, head, body);
}
