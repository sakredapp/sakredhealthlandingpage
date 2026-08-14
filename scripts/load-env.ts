/**
 * Loads `.env` into `process.env` for build-time scripts.
 *
 * On Vercel the network credentials are project environment variables and are
 * already present, so this is a no-op there. Locally they are only in `.env`,
 * and without them `prerender-network` decides the network "is not configured"
 * and skips every provider page — quietly, with a log line among a hundred
 * others, producing a `dist/` that looks complete and contains none of the
 * pages the site exists to serve.
 *
 * Existing values always win: an env var set by the shell or by Vercel is the
 * deliberate one, and a stale `.env` on a laptop must never override it.
 *
 * ── Imported for its side effect, deliberately ───────────────────────
 *
 * `import "./load-env.js"` runs this at module-evaluation time. That matters:
 * ES imports are hoisted, so calling an exported `loadEnv()` from the body of
 * a script would run AFTER every module it imports has already initialised —
 * including the reader that decides whether the network is configured. Listing
 * this import above that one is what makes the ordering real.
 */
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

function loadEnv(): void {
  const path = join(dirname(fileURLToPath(import.meta.url)), "..", ".env");
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const i = trimmed.indexOf("=");
    const key = trimmed.slice(0, i).trim();
    if (process.env[key] !== undefined) continue;
    process.env[key] = trimmed.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
}

loadEnv();
