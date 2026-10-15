/**
 * The blog listing (/blog, /resources) without each article's body.
 *
 * The full /api/blog-posts answer is ~1 MB, 90% of it article text the
 * listing only used for a word count, and on a phone the cards (and the LCP
 * photo) waited on it. `?summary=1` drops the body and sends readingMinutes
 * instead. A build-time copy is written into those pages
 * (scripts/prerender-shell.mjs), so the cards render with the page; it is
 * marked old, so the live list still loads on mount and corrects anything
 * newer than the build.
 *
 * Keyed under "/api/blog-posts" so the admin editor's invalidations still
 * refresh it.
 */
import { useQuery } from "@tanstack/react-query";
import type { BlogPost } from "@shared/schema";
import { readingMinutes } from "@/data/blog-categories";

export type BlogPostSummary = BlogPost & { readingMinutes?: number };

declare global {
  // eslint-disable-next-line no-var
  var __SAKRED_BLOG_SUMMARY__: BlogPostSummary[] | undefined;
}

function snapshot(): BlogPostSummary[] | undefined {
  const value = globalThis.__SAKRED_BLOG_SUMMARY__;
  return Array.isArray(value) ? value : undefined;
}

export function useBlogSummary() {
  return useQuery<BlogPostSummary[]>({
    queryKey: ["/api/blog-posts", "summary"],
    queryFn: async () => {
      const res = await fetch("/api/blog-posts?summary=1", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${(await res.text()) || res.statusText}`);
      return res.json();
    },
    initialData: snapshot,
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60_000,
  });
}

/** Minutes to read, from the summary field or (full post) the body itself. */
export function postReadingMinutes(post: BlogPostSummary): number {
  return post.readingMinutes ?? readingMinutes(post.content);
}
