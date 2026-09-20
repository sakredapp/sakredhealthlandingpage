/**
 * Alias resolution for provider URLs, at the HTTP level.
 *
 *   /locations/<slug>       →  308 to the canonical path, or the app shell
 *   /practitioners/<slug>   →  308 to the canonical path, or the app shell
 *
 * ── Why this exists rather than a client-side URL replace ────────────
 *
 * When a practice is renamed the network keeps the old slug as an alias and
 * reports the canonical one. The pages already handled that by rewriting the
 * address bar after render, which fixes what a person sees and fixes nothing
 * that matters to a crawler: the old URL still answered 200 with a full copy of
 * the page, so the two URLs were two documents competing for the same content
 * and splitting whatever authority the practice had earned.
 *
 * A 308 is the statement that there is one document and this is where it lives.
 * The client-side replace stays for in-app navigation, where no request is made
 * and so no redirect can happen.
 *
 * ── This is not on the hot path ──────────────────────────────────────
 *
 * `rewrites` in vercel.json are evaluated only after the filesystem is checked,
 * and every canonical provider page is prerendered to static HTML at build
 * time. So a canonical URL never reaches this function — it is served as a
 * static file, as before. Only a slug with no prerendered page arrives here:
 * an alias, a typo, or a page published since the last build.
 *
 * ── Unknown slugs get a real 404 ─────────────────────────────────────
 *
 * The catch-all rewrite used to answer every one of those with the app shell
 * and a 200, which tells a crawler that a mistyped provider URL is a real page.
 * This returns the same shell — the SPA still renders its not-found state, so a
 * person sees something useful — with a 404 status attached.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { getLocationBySlug, getPractitionerBySlug } from "../_lib/health-network.js";
import { locationPath, practitionerPath } from "../../shared/health-network.js";

type Kind = "location" | "practitioner";

/**
 * The built app shell.
 *
 * Two ways to get it, because the first is faster and the second always works:
 *
 *   1. off disk, bundled by `functions.includeFiles` in vercel.json
 *   2. fetched from this deployment's own static origin
 *
 * The fallback exists because a build artifact being present at the moment
 * functions are bundled is an ordering assumption, and a blank page for every
 * mistyped provider URL is a poor thing to discover in production. `/index.html`
 * is a real static file, so it is matched by the filesystem before any rewrite —
 * the fetch cannot loop back into this function.
 *
 * Cached per instance either way: it does not change within a deployment, and
 * Fluid Compute reuses instances across requests.
 */
let shell: string | null | undefined;

async function appShell(req: VercelRequest): Promise<string | null> {
  if (shell !== undefined) return shell;

  const path = join(process.cwd(), "dist", "index.html");
  if (existsSync(path)) {
    shell = readFileSync(path, "utf8");
    return shell;
  }

  const host = header(req, "x-forwarded-host") ?? header(req, "host");
  if (host) {
    try {
      const proto = header(req, "x-forwarded-proto") ?? "https";
      const response = await fetch(`${proto}://${host}/index.html`);
      if (response.ok) {
        shell = await response.text();
        return shell;
      }
    } catch (error) {
      console.error("[network/canonical] could not fetch the app shell:", error);
    }
  }

  console.error(
    "[network/canonical] the app shell is unreachable both on disk and over HTTP. " +
      "Check the `functions.includeFiles` entry in vercel.json."
  );
  shell = null;
  return shell;
}

function header(req: VercelRequest, name: string): string | undefined {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const kind = (Array.isArray(req.query.kind) ? req.query.kind[0] : req.query.kind) as Kind;
  const slug = Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug;

  if ((kind !== "location" && kind !== "practitioner") || !slug) {
    return serveShell(req, res, 404);
  }

  try {
    const entity =
      kind === "location"
        ? await getLocationBySlug(slug)
        : await getPractitionerBySlug(slug);

    if (!entity) return serveShell(req, res, 404);

    const canonical = entity.canonicalSlug;
    if (entity.redirect && canonical && canonical !== slug) {
      const destination =
        kind === "location" ? locationPath(canonical) : practitionerPath(canonical);

      /**
       * 308 rather than 301: it is the one permanent redirect defined not to
       * let a client change the method on its way through. Nothing here is a
       * POST today, but a redirect that quietly rewrites a request is a
       * surprise nobody needs later.
       */
      res.setHeader("Location", destination);
      res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
      return res.status(308).end();
    }

    /* A real page that simply wasn't in the last build — published since, most
       likely. 200 and the shell; the SPA fetches and renders it. */
    return serveShell(req, res, 200);
  } catch (error) {
    console.error("[network/canonical] failed:", error);
    // An error here must not turn a real page into a 404 a crawler believes.
    return serveShell(req, res, 200);
  }
}

async function serveShell(req: VercelRequest, res: VercelResponse, status: number) {
  const html = await appShell(req);
  if (!html) return res.status(status).send("");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  // Never cache a 404 at the edge: the usual cause is a page not yet built.
  res.setHeader("Cache-Control", status === 200 ? "public, s-maxage=60" : "no-store");
  return res.status(status).send(html);
}
