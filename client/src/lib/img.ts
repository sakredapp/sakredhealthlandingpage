/**
 * Responsive candidates for a remote photo, so a phone downloads a phone-sized
 * file instead of the desktop frame.
 *
 * Only Unsplash URLs get one: its CDN resizes on the `w` query parameter (and
 * `h`, which is scaled with it so the crop stays the same). Anything else
 * returns undefined and the <img> keeps its single src, exactly as before.
 */
const WIDTHS = [400, 640, 800, 1200, 1600];

export function remoteSrcSet(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  if (parsed.hostname !== "images.unsplash.com") return undefined;

  const w = Number(parsed.searchParams.get("w"));
  if (!w) return undefined;
  const h = Number(parsed.searchParams.get("h")) || 0;

  const widths = WIDTHS.filter((x) => x < w);
  if (widths.length === 0) return undefined;

  return [...widths, w]
    .map((width) => {
      const next = new URL(parsed.toString());
      next.searchParams.set("w", String(width));
      if (h) next.searchParams.set("h", String(Math.round((h * width) / w)));
      return `${next.toString()} ${width}w`;
    })
    .join(", ");
}
