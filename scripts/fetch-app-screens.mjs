/**
 * Bundles the app screenshots shown on /app, the homepage download band and
 * the download dialog.
 *
 * Run once, by hand, when a screenshot in the `appdemoscreenshots` bucket
 * changes (then update `client/src/data/app-assets.ts` if the name or the
 * height changed):
 *
 *   node scripts/fetch-app-screens.mjs
 *
 * Why: the bucket holds 1320px-wide JPEGs (250-470 KB each, 2.1 MB for the
 * set). The biggest slot that shows one is the /app phone frame at 17rem
 * (272 CSS px), so a phone was downloading ~5x the pixels it could draw. That
 * made /app's main content show at 13-16 s on the nightly speed QA
 * (perf.budget.sakredhealth.app). Each source now produces AVIF, WebP and JPEG
 * at 320 and 640 px wide, served from our own CDN with immutable caching.
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "client", "public", "img", "app");
const BUCKET = "https://auth.sakredhealth.com/storage/v1/object/public/appdemoscreenshots";

/** 320 for 1x screens, 640 for 2x; the largest slot is 272 CSS px wide. */
const WIDTHS = [320, 640];

/** name → file in the bucket (the bucket names carry trailing spaces). */
const SOURCES = [
  ["home", "homescreen%20.jpeg"],
  ["today", "todays%20habits.jpeg"],
  ["protocols", "routine%20outline%20.jpeg"],
  ["tracking", "routine%20and%20habit%20tracker%20.jpeg"],
  ["library", "library%20overview%20.jpeg"],
  ["market", "real%20foods%20market%20.jpeg"],
  ["policies", "policy%20portal%20.jpeg"],
];

mkdirSync(OUT, { recursive: true });

for (const [name, file] of SOURCES) {
  const res = await fetch(`${BUCKET}/${file}`);
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
  const input = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(input).metadata();
  const sizes = [];
  for (const width of WIDTHS) {
    const base = sharp(input).resize({ width, withoutEnlargement: true });
    const outputs = [
      ["avif", await base.clone().avif({ quality: 55, effort: 7, chromaSubsampling: "4:2:0" }).toBuffer()],
      ["webp", await base.clone().webp({ quality: 75 }).toBuffer()],
      ["jpg", await base.clone().jpeg({ quality: 80, mozjpeg: true }).toBuffer()],
    ];
    for (const [ext, buf] of outputs) {
      writeFileSync(join(OUT, `${name}-${width}.${ext}`), buf);
      sizes.push(`${width}.${ext} ${Math.round(buf.length / 1024)}KB`);
    }
  }
  const h320 = Math.round((meta.height * 320) / meta.width);
  console.log(`${name}: source ${meta.width}x${meta.height}, 320w height ${h320} — ${sizes.join(", ")}`);
}
