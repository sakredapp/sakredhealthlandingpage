import { APP_SCREEN_WIDTHS, type AppScreen } from "@/data/app-assets";

/**
 * One app screenshot as a <picture>: AVIF, then WebP, then JPEG, at 320w and
 * 640w. `sizes` is the CSS width of the slot it sits in (all slots are at most
 * 17rem), so a phone fetches the 640w copy (~20-40 KB) instead of the 1320px
 * original from the bucket (250-470 KB).
 */
export function AppScreenPicture({
  screen,
  sizes,
  loading = "lazy",
  fetchPriority,
  className = "block w-full h-auto",
}: {
  screen: AppScreen;
  sizes: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  className?: string;
}) {
  const set = (ext: string) =>
    APP_SCREEN_WIDTHS.map((w) => `/img/app/${screen.name}-${w}.${ext} ${w}w`).join(", ");
  return (
    <picture>
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      <img
        src={screen.image}
        srcSet={set("jpg")}
        sizes={sizes}
        alt={screen.alt}
        width={screen.width}
        height={screen.height}
        loading={loading}
        decoding="async"
        // React 18 warns on the camelCase prop; the lowercase attribute is what browsers read.
        {...(fetchPriority ? { fetchpriority: fetchPriority } : {})}
        className={className}
      />
    </picture>
  );
}
