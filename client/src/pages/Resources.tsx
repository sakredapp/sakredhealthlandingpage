/**
 * /resources — the three destinations, each on its own material plane.
 *
 * Library is parchment, the Market is deep café, the Food Chart is the clean
 * atlas. Same polarity as the app, so the three things feel like the same
 * three things in both places (brief §17).
 *
 * The Library section shows real, published posts rather than a promise of
 * them — it reads the same `/api/blog-posts` the blog does.
 */
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Leaf, Table2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { NewsletterBand } from "@/components/site/NewsletterBand";
import { EditorialImage } from "@/components/health/EditorialImage";
import {
  StampHeading,
  Reveal,
  StaggerChildren,
  StaggerItem,
  ParallaxImage,
} from "@/components/motion";
import { HEALTH_IMAGES } from "@/data/health-images";
import { categoryForTags, readingMinutes } from "@/data/blog-categories";
import { foodData } from "@/data/food-chart";
import { APP_STORE_URL } from "@/data/app-assets";
import { useSeo, SITE_URL } from "@/lib/seo";
import type { BlogPost } from "@shared/schema";

const TOTAL_FOODS = foodData.reduce((n, category) => n + category.items.length, 0);

export default function Resources() {
  const { data: posts } = useQuery<BlogPost[]>({ queryKey: ["/api/blog-posts"] });
  const recent = (posts ?? []).slice(0, 6);

  useSeo({
    title: "Resources — Library, Real Foods Market & Food Chart | Sakred Health",
    description:
      "Cited guides and research, the Real Foods Market, and an anti-inflammatory food chart rating 197 everyday foods — the Sakred Health resource library.",
    canonical: "/resources",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Sakred Health Resources",
      url: `${SITE_URL}/resources`,
      description:
        "The Sakred Health library, Real Foods Market and anti-inflammatory food chart.",
    },
  });

  return (
    <SiteLayout solidHeader>
      {/* ---- header ---- */}
      <header className="surface-atlas border-b border-sakred-stone">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-sakred-gold-deep">
            Resources
          </p>
          <StampHeading
            as="h1"
            text="Know enough to ask"
            accent="better questions."
            className="font-display text-3xl leading-tight tracking-tight text-sakred-espresso sm:text-4xl lg:text-5xl"
          />
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-sakred-ink/70">
            Three places to read, look things up, and decide what to bring to your next
            appointment. All of it free, all of it cited.
          </p>

          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Resource sections">
            {[
              { href: "#library", label: "Library" },
              { href: "#market", label: "Real Foods Market" },
              { href: "/food-chart", label: "Food Chart" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full border border-sakred-stone bg-sakred-surface px-4 py-2 text-sm text-sakred-ink/70 transition-colors duration-micro hover:border-sakred-gold/50 hover:text-sakred-espresso"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* ---- Library: parchment ---- */}
      <section id="library" className="scroll-mt-24 bg-sakred-parchment py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-sakred-gold-deep" aria-hidden="true" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sakred-gold-deep">
                  Library
                </span>
              </div>
              <h2 className="font-display text-2xl leading-tight text-sakred-espresso sm:text-3xl">
                Guides, ebooks and cited research
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-sakred-ink/65">
                Long-form writing on the things that actually move health — with the
                studies attached, and with the study&rsquo;s own limitations named
                rather than buried.
              </p>

              {/* The one large editorial photo on this page gets the scroll
                  parallax; the section cards keep the cheaper hover crop. Two
                  different motions on the same screen would read as noise. */}
              {HEALTH_IMAGES.library.src ? (
                <ParallaxImage
                  src={`/img/${HEALTH_IMAGES.library.bundle}-1600.jpg`}
                  alt={HEALTH_IMAGES.library.alt}
                  sizes="(max-width: 1024px) 100vw, 400px"
                  distance={38}
                  className="mt-8 aspect-[4/3] w-full rounded-2xl"
                />
              ) : (
                <EditorialImage
                  photo={HEALTH_IMAGES.library}
                  className="mt-8 aspect-[4/3] w-full rounded-2xl"
                  sizes="(max-width: 1024px) 100vw, 400px"
                  fallbackTone="parchment"
                />
              )}

              <Link
                href="/blog"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-sakred-espresso"
              >
                <span className="border-b border-sakred-gold pb-0.5">
                  Browse the whole library
                </span>
                <ArrowRight className="h-4 w-4 text-sakred-gold" aria-hidden="true" />
              </Link>
            </div>

            {recent.length > 0 ? (
              <StaggerChildren as="ul" className="grid gap-4 sm:grid-cols-2">
                {recent.map((post) => (
                  <StaggerItem as="li" key={post.id}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-sakred-stone bg-sakred-surface lift-card"
                    >
                      {post.featuredImage && (
                        <div className="crop-shift aspect-[16/9] w-full overflow-hidden">
                          <img
                            src={post.featuredImage}
                            alt={post.featuredImageAlt || post.title}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-5">
                        <span className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-sakred-gold-deep">
                          {categoryForTags(post.tags)}
                        </span>
                        <h3 className="font-display text-base leading-snug text-sakred-espresso">
                          {post.title}
                        </h3>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-sakred-ink/60 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <span className="mt-3 text-xs text-sakred-ink/45">
                          {readingMinutes(post.content)} min read
                        </span>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            ) : (
              <div className="rounded-2xl border border-sakred-stone bg-sakred-surface p-8">
                <p className="text-sm text-sakred-ink/60">
                  The library is loading.{" "}
                  <Link href="/blog" className="font-medium text-sakred-gold-deep underline decoration-sakred-gold/40 underline-offset-4">
                    Open it directly
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---- Market: deep café ---- */}
      <section id="market" className="surface-cafe scroll-mt-24 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Leaf className="h-4 w-4 text-sakred-gold" aria-hidden="true" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sakred-gold">
                Real Foods Market
              </span>
            </div>
            <h2 className="font-display text-2xl leading-tight text-[#F5EFE3] sm:text-3xl">
              Foods, products and trusted resources
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[#F5EFE3]/70">
              What we&rsquo;d actually buy, and the specific reason it made the list —
              ingredients, sourcing, and what it&rsquo;s for. Not an affiliate wall.
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#F5EFE3]/55">
              The Market lives in the Sakred Health app, alongside the protocols the
              products support.
            </p>

            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center rounded-full border border-sakred-gold bg-gradient-to-r from-sakred-gold via-sakred-gold-light to-sakred-gold px-6 py-3 text-sm font-medium text-sakred-espresso transition-transform duration-micro hover:-translate-y-0.5"
            >
              Open the Market in the app
            </a>
          </div>

          <EditorialImage
            photo={HEALTH_IMAGES.market}
            className="aspect-[5/4] w-full rounded-3xl"
            sizes="(max-width: 1024px) 100vw, 560px"
            fallbackTone="cafe"
          />
        </div>
      </section>

      {/* ---- Food Chart: atlas ---- */}
      <section className="surface-atlas py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:px-8">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Table2 className="h-4 w-4 text-sakred-gold-deep" aria-hidden="true" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sakred-gold-deep">
                Food Chart
              </span>
            </div>
            <h2 className="font-display text-2xl leading-tight text-sakred-espresso sm:text-3xl">
              {TOTAL_FOODS} everyday foods, rated
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-sakred-ink/65">
              A seven-point inflammation scale across fruit, vegetables, grains,
              proteins, fats and seasonings. Searchable, filterable, and honest about
              the fact that both ends of the scale belong in a balanced diet.
            </p>

            <Link
              href="/food-chart"
              className="mt-7 inline-flex items-center rounded-full border border-sakred-gold bg-gradient-to-r from-sakred-gold via-sakred-gold-light to-sakred-gold px-6 py-3 text-sm font-medium text-sakred-espresso transition-transform duration-micro hover:-translate-y-0.5"
            >
              Open the food chart
            </Link>
          </div>

          {/* A live preview of the scale — the chart's own colour language,
              rather than a stock photo of vegetables. */}
          <Reveal>
            <ul className="space-y-2 rounded-2xl border border-sakred-stone bg-sakred-surface p-5">
              {foodData.slice(0, 6).map((group) => (
                <li key={group.category} className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm text-sakred-espresso">
                    {group.category}
                  </span>
                  <span className="shrink-0 text-xs text-sakred-ink/45">
                    {group.items.length} foods
                  </span>
                </li>
              ))}
              <li className="border-t border-sakred-stone/60 pt-2 text-xs text-sakred-ink/50">
                and {foodData.length - 6} more categories
              </li>
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Last thing on the page, after three real destinations — not competing
          with Discover or the practitioner funnel anywhere earlier. */}
      <NewsletterBand />
    </SiteLayout>
  );
}
