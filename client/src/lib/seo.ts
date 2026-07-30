import { useEffect } from "react";

/**
 * Per-page SEO for the SPA: sets <title>, meta description, canonical, Open
 * Graph / Twitter tags, and optional JSON-LD — then restores the previous
 * values on unmount so navigating between routes doesn't leak stale tags.
 *
 * This is client-rendered (Googlebot renders JS), which is enough to get
 * indexed. For maximum ranking on the programmatic state pages, prerendering
 * these routes to static HTML at build time is the recommended follow-up.
 */
export const SITE_URL = "https://www.sakredhealth.com";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

interface SeoInput {
  title: string;
  description: string;
  /** Path ("/health-insurance/texas") or absolute URL. Defaults to current path. */
  canonical?: string;
  image?: string;
  jsonLd?: object | object[];
  noindex?: boolean;
}

export function useSeo({ title, description, canonical, image, jsonLd, noindex }: SeoInput) {
  const jsonLdStr = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const url = canonical
      ? canonical.startsWith("http")
        ? canonical
        : `${SITE_URL}${canonical}`
      : window.location.href.split(/[?#]/)[0];
    const img = image || DEFAULT_IMAGE;

    const prevTitle = document.title;
    document.title = title;

    const created: HTMLElement[] = [];
    const modified: { el: HTMLMetaElement; content: string }[] = [];

    const meta = (key: string, value: string, asProperty = false) => {
      const attr = asProperty ? "property" : "name";
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (el) {
        modified.push({ el, content: el.content });
      } else {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
        created.push(el);
      }
      el.content = value;
    };

    meta("description", description);
    meta("og:title", title, true);
    meta("og:description", description, true);
    meta("og:url", url, true);
    meta("og:image", img, true);
    meta("twitter:title", title);
    meta("twitter:description", description);
    meta("twitter:image", img);
    if (noindex) meta("robots", "noindex, nofollow");

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const prevCanonical = link ? link.href : null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = url;

    let script: HTMLScriptElement | null = null;
    if (jsonLdStr) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-page-seo", "true");
      script.textContent = jsonLdStr;
      document.head.appendChild(script);
    }

    return () => {
      document.title = prevTitle;
      created.forEach((el) => el.remove());
      modified.forEach(({ el, content }) => {
        el.content = content;
      });
      if (script) script.remove();
      if (link && prevCanonical !== null) link.href = prevCanonical;
      else if (link && prevCanonical === null) link.remove();
    };
  }, [title, description, canonical, image, jsonLdStr, noindex]);
}
