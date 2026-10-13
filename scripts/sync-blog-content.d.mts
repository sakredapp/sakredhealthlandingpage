/* Types for sync-blog-content.mjs, so api/admin/sync-blog-content.ts can import it. */
export const CONTENT_DIR: string;
export function parseArticle(raw: string, file: string): Record<string, unknown> & {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
};
export type BlogSyncResult =
  | { skipped: string }
  | { files: number; inserted: number; updated: number; unchanged: number; failed: number };
export function syncBlogContent(options?: { contentDir?: string }): Promise<BlogSyncResult>;
