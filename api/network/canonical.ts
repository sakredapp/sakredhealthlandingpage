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
 * ── It also renders the page ─────────────────────────────────────────
 *
 * `rewrites` in vercel.json are evaluated only after the filesystem is checked,
 * so a provider page that was prerendered to a static file at build time never
 * reaches this function.
 *
 * The production build no longer has one. Builds run on our own build box, and
 * Vercel does not hand Sensitive variables (the network credentials) to a build
 * that runs outside Vercel, so `scripts/prerender-network.ts` skips there. This
 * function has those credentials at runtime, so it renders the SAME document
 * the prerender wrote (one renderer: `api/_lib/network-page-html.ts`) and lets
 * the edge cache it. A crawler gets the title, description, canonical, JSON-LD
 * and body text exactly as before, and a page published five minutes ago gets
 * them without waiting for a deploy.
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
import {
  locationPath,
  practitionerPath,
  type HealthLocation,
  type HealthPractitioner,
} from "../../shared/health-network.js";
import { renderLocationHtml, renderPractitionerHtml } from "../_lib/network-page-html.js";

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
 * mistyped provider URL is a poor thing to discover in production. `/spa.html`
 * is a real static file, so it is matched by the filesystem before any rewrite —
 * the fetch cannot loop back into this function.
 *
 * Cached per instance either way: it does not change within a deployment, and
 * Fluid Compute reuses instances across requests.
 */
let shell: string | null | undefined;

async function appShell(req: VercelRequest): Promise<string | null> {
  if (shell !== undefined) return shell;

  const path = join(process.cwd(), "dist", "spa.html");
  if (existsSync(path)) {
    shell = readFileSync(path, "utf8");
    return shell;
  }

  const host = header(req, "x-forwarded-host") ?? header(req, "host");
  if (host) {
    try {
      const proto = header(req, "x-forwarded-proto") ?? "https";
      const response = await fetch(`${proto}://${host}/spa.html`);
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

    /* A real, published page. Serve the full document: head tags, JSON-LD and
       a crawlable body injected into the app shell (React mounts over it for a
       person). If the shell or the render is unavailable, the bare shell still
       works: the SPA fetches and renders the page client-side. */
    try {
      const template = await appShell(req);
      if (template) {
        const html =
          kind === "location"
            ? renderLocationHtml(template, entity as HealthLocation)
            : renderPractitionerHtml(template, entity as HealthPractitioner);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        // Edge cached: ten minutes fresh, then served stale while it refreshes.
        res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=86400");
        return res.status(200).send(html);
      }
    } catch (error) {
      console.error("[network/canonical] page render failed, serving the shell:", error);
    }
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
