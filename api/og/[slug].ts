import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ImageResponse } from "@vercel/og";
import { getBlogPostBySlug } from "../_lib/storage.js";

// Satori element helper (plain objects instead of JSX so this stays a .ts file)
const el = (type: string, style: Record<string, unknown>, children?: unknown) => ({
  type,
  props: { style, children },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = String(req.query.slug ?? "");

  let title = "Data-driven health & coverage research";
  let tag = "Sakred Health Blog";
  try {
    const post = await getBlogPostBySlug(slug);
    if (post) {
      title = post.title;
      tag = (post.tags?.[0] ?? "research").replace(/-/g, " ");
    }
  } catch {
    // fall through to the generic card
  }

  const card = el(
    "div",
    {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      backgroundColor: "#F9F9F7",
      padding: "64px 72px",
      fontFamily: "sans-serif",
    },
    [
      el(
        "div",
        { display: "flex", flexDirection: "column" },
        [
          el(
            "div",
            {
              fontSize: 26,
              letterSpacing: 6,
              color: "#C5A059",
              textTransform: "uppercase",
              marginBottom: 36,
            },
            "Sakred Health"
          ),
          el(
            "div",
            {
              fontSize: title.length > 70 ? 52 : 62,
              lineHeight: 1.15,
              color: "#0F172A",
              fontWeight: 700,
              maxWidth: 1020,
            },
            title
          ),
        ]
      ),
      el(
        "div",
        {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "3px solid #C5A059",
          paddingTop: 28,
        },
        [
          el("div", { fontSize: 26, color: "#0F172A", opacity: 0.65 }, tag),
          el("div", { fontSize: 26, color: "#0F172A", opacity: 0.65 }, "www.sakredhealth.com"),
        ]
      ),
    ]
  );

  try {
    const image = new ImageResponse(card as any, { width: 1200, height: 630 });
    const buf = Buffer.from(await image.arrayBuffer());
    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Cache-Control",
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"
    );
    return res.status(200).send(buf);
  } catch (err) {
    console.error("OG image generation failed:", err);
    // Fall back to the static site card so shares never break
    res.setHeader("Cache-Control", "public, max-age=300");
    return res.redirect(302, "https://www.sakredhealth.com/og-image.jpg");
  }
}
