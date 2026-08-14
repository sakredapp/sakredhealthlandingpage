/**
 * Serves `dist/` with the real API routes mounted, for browser testing.
 *
 * `vite dev` doesn't run the Vercel Functions, and `vercel dev` needs a package
 * manager this repo doesn't use. This is the smallest thing that gives a
 * browser the actual site: the built client, plus the same handlers production
 * runs, against the real Health Network.
 *
 * It is NOT a production server and is not deployed. Its only job is to make
 * `npm run test:browser` reproducible on any machine.
 *
 *   npm run build:full      # writes dist/ from the live network
 *   npm run serve:dist      # this file, on :3100
 *   npm run test:browser    # asserts against it
 *
 * Reads `.env` so it picks up HEALTH_NETWORK_SUPABASE_URL / _ANON_KEY.
 */
import { createServer } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { join, extname, dirname } from "path";
import { fileURLToPath, URL } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const PORT = Number(process.env.PORT ?? 3100);

/* .env → process.env, without adding a dependency for four lines of parsing. */
const envPath = join(ROOT, ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    if (!line.includes("=") || line.trim().startsWith("#")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i).trim();
    if (!process.env[key]) {
      process.env[key] = line.slice(i + 1).trim().replace(/^"|"$/g, "");
    }
  }
}

const MIME: Record<string, string> = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".svg": "image/svg+xml", ".json": "application/json", ".jpg": "image/jpeg",
  ".webp": "image/webp", ".avif": "image/avif", ".png": "image/png",
  ".xml": "application/xml", ".txt": "text/plain", ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

const STATIC_ROUTES: Record<string, string> = {
  "/api/network/search": "api/network/search.ts",
  "/api/network/modalities": "api/network/modalities.ts",
  // The write side, so the intake E2E drives the real forms rather than a mock.
  "/api/network/practitioner-application": "api/network/practitioner-application.ts",
  "/api/network/recommend": "api/network/recommend.ts",
  "/api/network/application-media": "api/network/application-media.ts",
};

/** The media route posts a base64 image, so this ceiling matches its own. */
const MAX_BODY_BYTES = 18 * 1024 * 1024;

function readBody(rq: import("http").IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    rq.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        rq.destroy();
        reject(new Error("body too large"));
        return;
      }
      chunks.push(chunk);
    });
    rq.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    rq.on("error", reject);
  });
}

const handlers = new Map<string, any>();
async function loadHandler(file: string) {
  if (!handlers.has(file)) {
    const mod = await import(join(ROOT, file).replace(/\.ts$/, ".js"));
    handlers.set(file, mod.default);
  }
  return handlers.get(file);
}

createServer(async (rq, rs) => {
  const url = new URL(rq.url ?? "/", "http://localhost");
  const path = url.pathname;

  if (path.startsWith("/api/")) {
    let file = STATIC_ROUTES[path];
    const params: Record<string, string> = {};
    let m: RegExpMatchArray | null;

    if (!file && (m = path.match(/^\/api\/network\/locations\/(.+)$/))) {
      file = "api/network/locations/[slug].ts";
      params.slug = decodeURIComponent(m[1]);
    }
    if (!file && (m = path.match(/^\/api\/network\/practitioners\/(.+)$/))) {
      file = "api/network/practitioners/[slug].ts";
      params.slug = decodeURIComponent(m[1]);
    }
    // The blog needs a database this harness doesn't configure; an empty list
    // is honest here and keeps the network pages under test isolated from it.
    if (!file && path === "/api/blog-posts") {
      rs.writeHead(200, { "content-type": "application/json" });
      return rs.end("[]");
    }
    if (!file) { rs.writeHead(404); return rs.end("{}"); }

    const query: Record<string, string> = { ...params };
    url.searchParams.forEach((v, k) => (query[k] = v));

    /* Vercel parses the JSON body before a handler sees it; this harness has to
       do the same or every POST route reads an empty object and rejects a
       submission that was perfectly well formed. */
    let body: any = {};
    if (rq.method === "POST" || rq.method === "PUT") {
      const raw = await readBody(rq);
      if (raw) {
        try {
          body = JSON.parse(raw);
        } catch {
          rs.writeHead(400, { "content-type": "application/json" });
          return rs.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      }
    }

    const req: any = { method: rq.method, query, headers: rq.headers, body, url: rq.url };
    const res: any = {
      statusCode: 200,
      setHeader: (k: string, v: string) => { rs.setHeader(k, v); return res; },
      status: (c: number) => { res.statusCode = c; return res; },
      json: (o: unknown) => {
        rs.writeHead(res.statusCode, { "content-type": "application/json" });
        rs.end(JSON.stringify(o));
      },
      send: (t: unknown) => { rs.writeHead(res.statusCode); rs.end(String(t)); },
      end: () => { rs.writeHead(res.statusCode); rs.end(); },
    };

    try {
      await (await loadHandler(file))(req, res);
    } catch (error: any) {
      console.error("[serve-dist]", path, error?.message ?? error);
      if (!rs.headersSent) { rs.writeHead(500); rs.end("{}"); }
    }
    return;
  }

  let file = join(DIST, path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");

  /**
   * Provider paths with no prerendered page go to the canonical handler, which
   * is exactly what the `rewrites` in vercel.json do — they are evaluated only
   * after the filesystem is checked, so a canonical slug is served as a static
   * file here and in production, and only an alias or a typo reaches the
   * function. Mirroring it means `npm run test:browser` can assert on real 308s.
   */
  if (!existsSync(file)) {
    const provider =
      path.match(/^\/(locations)\/([^/]+)\/?$/) ?? path.match(/^\/(practitioners)\/([^/]+)\/?$/);
    if (provider) {
      const kind = provider[1] === "locations" ? "location" : "practitioner";
      const req: any = {
        method: rq.method,
        query: { kind, slug: decodeURIComponent(provider[2]) },
        headers: rq.headers,
        body: {},
        url: rq.url,
      };
      const res: any = {
        statusCode: 200,
        setHeader: (k: string, v: string) => { rs.setHeader(k, v); return res; },
        status: (c: number) => { res.statusCode = c; return res; },
        json: (o: unknown) => { rs.writeHead(res.statusCode, { "content-type": "application/json" }); rs.end(JSON.stringify(o)); },
        send: (t: unknown) => { rs.writeHead(res.statusCode); rs.end(String(t)); },
        end: () => { rs.writeHead(res.statusCode); rs.end(); },
      };
      try {
        return await (await loadHandler("api/network/canonical.ts"))(req, res);
      } catch (error: any) {
        console.error("[serve-dist] canonical", path, error?.message ?? error);
        if (!rs.headersSent) { rs.writeHead(500); rs.end(""); }
        return;
      }
    }
  }

  /**
   * A real 404 for anything that looks like an asset.
   *
   * Falling back to index.html for every miss made absent scripts parse as
   * HTML — "Unexpected token '<'" — which reads as a site bug and is a harness
   * bug. SPA routes (no extension) still fall through to the shell.
   */
  if (!existsSync(file) || statSync(file).isDirectory()) {
    if (extname(path)) { rs.writeHead(404); return rs.end("not found"); }
    file = join(DIST, "index.html");
  }

  rs.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
  rs.end(readFileSync(file));
}).listen(PORT, () => console.log(`[serve-dist] http://localhost:${PORT}`));
