/**
 * Fetches and bundles the site's editorial photography.
 *
 * Run once, by hand, when the photo set changes:
 *
 *   node scripts/fetch-editorial-images.mjs
 *
 * Outputs go to `client/public/img/` and are committed. They are NOT fetched
 * at build time and NOT hotlinked at runtime:
 *
 *   · a runtime request to images.unsplash.com on every page view is a
 *     third-party dependency on the critical path, and a third party that can
 *     see every visitor's IP and referrer
 *   · a bundled file can be served from our own CDN, with immutable caching
 *   · a photo can't silently change or disappear underneath us
 *
 * Each source produces AVIF, WebP and JPEG at two widths. AVIF is roughly half
 * the size of WebP at the same quality here, and the JPEG exists only for
 * browsers that take neither.
 *
 * ── Licensing ────────────────────────────────────────────────────────
 *
 * Every entry below is a specific, individually checked photo under the free
 * Unsplash License. Unsplash+ ("plus.unsplash.com/premium_photo-…") assets are
 * NOT permitted here — they carry a different licence. The photographer is
 * recorded for every asset even though the licence doesn't require it: credit
 * is cheap and being able to answer "where did this come from?" is not.
 *
 * Nothing here depicts a Sakred practitioner or a listed practice. These are
 * editorial and decorative. Real practice photography comes from the canonical
 * network's own `photos` column and renders through `NetworkImage`.
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "client", "public", "img");

/** Widths emitted per source. The larger is the biggest slot on any page. */
const WIDTHS = [800, 1600];

const SOURCES = [
  {
    name: "treatment-acupuncture",
    slot: "trustPractice",
    id: "photo-1512290746430-3ffb4fab31bc",
    page: "https://unsplash.com/photos/jmRbgqXLCI0",
    photographer: "Antonika Chanel",
    alt: "A practitioner placing an acupuncture needle in a patient's hand during a treatment",
  },
  {
    name: "apothecary-mortar",
    slot: "practitioners",
    id: "photo-1492552296703-4ec0a2fb3715",
    page: "https://unsplash.com/photos/9-Hgi9w9bDM",
    photographer: "Katherine Hanlon",
    alt: "A stone mortar and pestle holding dried petals and botanicals, photographed from above",
  },
  {
    name: "library-botanical-book",
    slot: "library",
    id: "photo-1532348333249-1d0a7f01a0c5",
    page: "https://unsplash.com/photos/iLEwA5UH8mE",
    photographer: "Annie Spratt",
    alt: "An old botanical reference book lying open on a wooden table at a plate of pressed-flower illustrations",
  },
  {
    name: "protocol-tea",
    slot: "protocols",
    id: "photo-1759356864606-cf371a5ba5f5",
    page: "https://unsplash.com/photos/three-cups-of-tea-on-a-wooden-table-IPUkKVJBEXQ",
    photographer: "Sixteen Miles Out",
    alt: "Three cups of herbal tea arranged on a weathered wooden table, seen from above",
  },
  {
    name: "coverage-home-porch",
    slot: "coverage",
    id: "photo-1649160697540-919919405e76",
    page: "https://unsplash.com/photos/a-house-with-a-porch-and-a-front-porch-7bNemZ5dCWY",
    photographer: "Roger Starnes Sr",
    alt: "A craftsman bungalow with a deep covered front porch, brick pillars and planted borders",
  },
];

/** Source pull at 2400px so the 1600 output is a downscale, never an upscale. */
const sourceUrl = (id) => `https://images.unsplash.com/${id}?w=2400&q=85&auto=format&fit=crop`;

async function main() {
  mkdirSync(OUT, { recursive: true });

  const manifest = [];

  for (const source of SOURCES) {
    process.stdout.write(`[images] ${source.name} … `);

    const response = await fetch(sourceUrl(source.id), {
      signal: AbortSignal.timeout(45_000),
    });
    if (!response.ok) {
      console.error(`FAILED (${response.status})`);
      process.exitCode = 1;
      continue;
    }

    const original = Buffer.from(await response.arrayBuffer());
    const written = [];

    for (const width of WIDTHS) {
      const base = sharp(original).resize({ width, withoutEnlargement: true });

      /**
       * `effort: 7` is near the knee of the AVIF size/time curve; past it the
       * encoder spends a lot longer for very little extra saving.
       *
       * `chromaSubsampling: "4:2:0"` matters more than it looks on this set —
       * these are photographs, not UI, and full chroma was costing ~40% on the
       * texture-heavy frames (weathered wood, foliage) for a difference nobody
       * can see at display size.
       */
      const avif = await base
        .clone()
        .avif({ quality: 50, effort: 7, chromaSubsampling: "4:2:0" })
        .toBuffer();
      const webp = await base.clone().webp({ quality: 72 }).toBuffer();
      const jpeg = await base.clone().jpeg({ quality: 80, mozjpeg: true }).toBuffer();

      for (const [ext, buffer] of [
        ["avif", avif],
        ["webp", webp],
        ["jpg", jpeg],
      ]) {
        const file = `${source.name}-${width}.${ext}`;
        writeFileSync(join(OUT, file), buffer);
        written.push({ file, bytes: buffer.length });
      }
    }

    const largest = written.find((w) => w.file.endsWith("1600.avif"));
    console.log(`ok (${written.length} files, ${Math.round((largest?.bytes ?? 0) / 1024)}KB avif@1600)`);

    manifest.push({
      slot: source.slot,
      name: source.name,
      photographer: source.photographer,
      page: source.page,
      alt: source.alt,
      files: written.map((w) => w.file),
    });
  }

  // Written next to the images so provenance travels with them, and so a
  // future maintainer can answer "who took this?" without reading a report.
  writeFileSync(
    join(OUT, "CREDITS.json"),
    JSON.stringify(
      {
        note:
          "Editorial photography bundled from Unsplash under the free Unsplash License. " +
          "None of these images depict a Sakred practitioner or a listed practice. " +
          "Regenerate with: node scripts/fetch-editorial-images.mjs",
        assets: manifest,
      },
      null,
      2
    ) + "\n"
  );

  console.log(`[images] wrote ${manifest.length} assets + CREDITS.json to client/public/img/`);
}

main().catch((error) => {
  console.error("[images] FAILED:", error?.message ?? error);
  process.exit(1);
});
