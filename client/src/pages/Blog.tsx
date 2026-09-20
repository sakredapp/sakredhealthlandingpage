/**
 * /blog — rebuilt as an editorial index.
 *
 * Same posts, same API, same URLs. What changed is that it now reads like a
 * publication rather than a list of article titles: a hero article at full
 * width, then a masonry-ish grid with real photography, reading time, category
 * and byline.
 *
 * The category nav is the useful part of the pivot. The blog already mixed
 * health, food, insurance, mortgage and retirement writing, which used to look
 * like a company that couldn't decide what it was about. Now it's the table of
 * contents for a company that genuinely spans both — so the six categories are
 * surfaced rather than hidden behind a search box (brief §19).
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Search, User, X } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { NewsletterBand } from "@/components/site/NewsletterBand";
import {
  StampHeading,
  StaggerChildren,
  StaggerItem,
  fadeUp,
} from "@/components/motion";
import { resolveAuthor } from "@/data/authors";
import {
  BLOG_CATEGORIES,
  categoryForTags,
  readingMinutes,
  type BlogCategory,
} from "@/data/blog-categories";
import { useSeo, SITE_URL } from "@/lib/seo";
import type { BlogPost } from "@shared/schema";

const dateLabel = (value: Date | string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

/* ------------------------------------------------------------------ *
 * Card pieces
 * ------------------------------------------------------------------ */

/**
 * The image block.
 *
 * Every card gets one whether or not the post has a photo — an image-less card
 * in a photo grid reads as a broken card, not as a minimal one. The fallback
 * is the monogram on a warm plate.
 */
function CardImage({
  post,
  className,
  sizes,
  eager,
}: {
  post: BlogPost;
  className: string;
  sizes?: string;
  eager?: boolean;
}) {
  return (
    <div className={`crop-shift bg-sakred-surface-alt ${className}`}>
      {post.featuredImage ? (
        <img
          src={post.featuredImage}
          alt={post.featuredImageAlt || post.title}
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sakred-parchment via-sakred-surface-alt to-sakred-stone">
          <span
            aria-hidden="true"
            className="font-display text-3xl tracking-[0.3em] text-sakred-gold/55"
          >
            SH
          </span>
        </div>
      )}
    </div>
  );
}

function Byline({ post, className }: { post: BlogPost; className?: string }) {
  // `post.author` holds the frontmatter key ("gerard"), not a display name.
  const author = resolveAuthor(post.author);
  const published = dateLabel(post.publishedAt);

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-sakred-ink/55 ${className ?? ""}`}>
      <span className="flex items-center gap-1.5">
        {author?.image ? (
          <img
            src={author.image}
            alt=""
            loading="lazy"
            width={20}
            height={20}
            className="h-5 w-5 rounded-full object-cover"
          />
        ) : (
          <User className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        {author?.name ?? post.author}
      </span>
      {published && (
        <>
          <span aria-hidden="true">·</span>
          <span>{published}</span>
        </>
      )}
      <span aria-hidden="true">·</span>
      <span>{readingMinutes(post.content)} min read</span>
    </div>
  );
}

function CategoryTag({ category }: { category: BlogCategory }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sakred-gold-deep">
      {category}
    </span>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-sakred-stone/70 bg-sakred-surface">
      <div className="skeleton-warm aspect-[16/9] w-full animate-pulse" />
      <div className="space-y-2.5 p-5">
        <div className="skeleton-warm h-2.5 w-16 animate-pulse rounded-full" />
        <div className="skeleton-warm h-4 w-full animate-pulse rounded-full" />
        <div className="skeleton-warm h-3 w-4/5 animate-pulse rounded-full" />
        <div className="skeleton-warm h-3 w-3/5 animate-pulse rounded-full" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

export default function Blog() {
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState<BlogCategory | null>(null);

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
  });

  useSeo({
    title: "Research & Writing — Health, Food, Practice & Coverage | Sakred Health",
    description:
      "Cited writing on health, food, practitioners and coverage — from the Sakred Health team. Research summaries that name what a study actually measured.",
    canonical: "/blog",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Sakred Health",
      url: `${SITE_URL}/blog`,
      description:
        "Research and writing on health, food, practitioners and insurance coverage.",
    },
  });

  /**
   * Publication dates are assigned so that chronological order is already an
   * even rotation across subject buckets (see the blog-content frontmatter),
   * so newest-first gives a mixed grid with no extra shuffling.
   */
  const sorted = useMemo(() => {
    if (!posts) return [];
    return [...posts].sort((a, b) => {
      const at = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bt = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bt - at;
    });
  }, [posts]);

  /** Only offer a category chip if something is actually filed under it. */
  const availableCategories = useMemo(() => {
    const present = new Set(sorted.map((post) => categoryForTags(post.tags)));
    return BLOG_CATEGORIES.filter((c) => present.has(c));
  }, [sorted]);

  const filtered = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return sorted.filter((post) => {
      if (category && categoryForTags(post.tags) !== category) return false;
      if (!needle) return true;
      return (
        post.title.toLowerCase().includes(needle) ||
        post.excerpt.toLowerCase().includes(needle) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(needle)) ||
        post.seoKeywords?.some((keyword) => keyword.toLowerCase().includes(needle))
      );
    });
  }, [sorted, term, category]);

  /* The hero only leads when the reader hasn't started narrowing. Once they
     search or pick a category they're scanning, and a giant lead article gets
     in the way of the thing they're scanning for. */
  const narrowing = Boolean(term.trim()) || category !== null;
  const hero = !narrowing ? filtered[0] : undefined;
  const rest = hero ? filtered.slice(1) : filtered;

  return (
    <SiteLayout solidHeader>
      {/* ---- masthead ---- */}
      <header className="surface-atlas border-b border-sakred-stone">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <motion.p
            {...fadeUp(0)}
            className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-sakred-gold-deep"
          >
            Research &amp; writing
          </motion.p>
          <StampHeading
            as="h1"
            text="What the studies"
            accent="actually say."
            delay={0.08}
            className="font-display text-3xl leading-tight tracking-tight text-sakred-espresso sm:text-4xl lg:text-5xl"
          />
          <motion.p
            {...fadeUp(0.28)}
            className="mt-4 max-w-2xl text-base leading-relaxed text-sakred-ink/70"
          >
            Health, food, practice and coverage — the four things Sakred touches, written
            with the sources attached and the caveats left in.
          </motion.p>

          {/* ---- category nav ---- */}
          <motion.nav {...fadeUp(0.4)} className="mt-8" aria-label="Article categories">
            <ul className="flex flex-wrap gap-2">
              <li>
                <button
                  type="button"
                  onClick={() => setCategory(null)}
                  aria-pressed={category === null}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-micro ${
                    category === null
                      ? "border-sakred-gold bg-sakred-gold/15 text-sakred-gold-deep"
                      : "border-sakred-stone bg-sakred-surface text-sakred-ink/65 hover:text-sakred-espresso"
                  }`}
                >
                  All
                </button>
              </li>
              {availableCategories.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => setCategory(item === category ? null : item)}
                    aria-pressed={category === item}
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-micro ${
                      category === item
                        ? "border-sakred-gold bg-sakred-gold/15 text-sakred-gold-deep"
                        : "border-sakred-stone bg-sakred-surface text-sakred-ink/65 hover:text-sakred-espresso"
                    }`}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </motion.nav>

          {/* ---- search ---- */}
          <motion.div
            {...fadeUp(0.48)}
            className="mt-4 flex max-w-md items-center gap-2 rounded-full border border-sakred-stone bg-sakred-surface px-4 focus-within:border-sakred-gold/70"
          >
            <Search className="h-4 w-4 shrink-0 text-sakred-ink/40" aria-hidden="true" />
            <label className="sr-only" htmlFor="blog-search">
              Search articles
            </label>
            <input
              id="blog-search"
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search articles…"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-sakred-espresso outline-none placeholder:text-sakred-ink/40"
            />
            {term && (
              <button type="button" onClick={() => setTerm("")} aria-label="Clear search">
                <X className="h-4 w-4 text-sakred-ink/40 hover:text-sakred-espresso" />
              </button>
            )}
          </motion.div>
        </div>
      </header>

      {/* ---- articles ---- */}
      <div className="bg-sakred-canvas py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-sakred-stone bg-sakred-surface p-12 text-center">
              <h2 className="font-display text-xl text-sakred-espresso">
                Nothing matches that yet.
              </h2>
              <button
                type="button"
                onClick={() => {
                  setTerm("");
                  setCategory(null);
                }}
                className="mt-5 rounded-full border border-sakred-stone bg-sakred-surface px-5 py-2.5 text-sm font-medium text-sakred-espresso lift-card"
              >
                Show everything
              </button>
            </div>
          ) : (
            <>
              {/* ---- hero article ---- */}
              {hero && (
                <Link
                  href={`/blog/${hero.slug}`}
                  className="group mb-10 grid overflow-hidden rounded-3xl border border-sakred-stone bg-sakred-surface lift-card lg:grid-cols-2"
                >
                  <CardImage
                    post={hero}
                    className="aspect-[16/10] w-full lg:aspect-auto lg:h-full"
                    sizes="(max-width: 1024px) 100vw, 640px"
                    eager
                  />
                  <div className="flex flex-col justify-center p-7 sm:p-10">
                    <CategoryTag category={categoryForTags(hero.tags)} />
                    <h2 className="mt-3 font-display text-2xl leading-tight text-sakred-espresso sm:text-3xl">
                      {hero.title}
                    </h2>
                    <p className="mt-3 text-base leading-relaxed text-sakred-ink/65">
                      {hero.excerpt}
                    </p>
                    <Byline post={hero} className="mt-5" />
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-sakred-espresso">
                      Read the piece
                      <ArrowRight
                        className="h-4 w-4 text-sakred-gold transition-transform duration-micro group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </Link>
              )}

              {/* ---- grid ---- *
                  Every third card runs tall, which is what stops a uniform
                  3-column grid reading like a spreadsheet of titles. */}
              <StaggerChildren as="ul" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post, index) => {
                  const tall = index % 6 === 0 || index % 6 === 4;
                  return (
                    <StaggerItem as="li" key={post.id}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-sakred-stone bg-sakred-surface lift-card"
                      >
                        <CardImage
                          post={post}
                          className={tall ? "aspect-[4/5] w-full" : "aspect-[16/9] w-full"}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                        />
                        <div className="flex flex-1 flex-col p-5">
                          <CategoryTag category={categoryForTags(post.tags)} />
                          <h2 className="mt-2 font-display text-lg leading-snug text-sakred-espresso">
                            {post.title}
                          </h2>
                          <p className="mt-2 flex-1 text-sm leading-relaxed text-sakred-ink/60 line-clamp-3">
                            {post.excerpt}
                          </p>
                          <Byline post={post} className="mt-4 border-t border-sakred-stone/60 pt-3" />
                        </div>
                      </Link>
                    </StaggerItem>
                  );
                })}
              </StaggerChildren>
            </>
          )}
        </div>
      </div>

      <NewsletterBand context="library" className="mt-16" />
    </SiteLayout>
  );
}
