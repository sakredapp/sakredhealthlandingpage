import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { lazy, Suspense } from "react";

// Lazy so recharts/framer chart code loads only on posts that embed data blocks
const DataFence = lazy(() => import("@/components/blog/BlogDataBlocks"));

const DATA_FENCE_LANGUAGES = ["stats", "chart"];
function fenceLanguage(className: unknown): string {
  const m = /language-(\w+)/.exec(typeof className === "string" ? className : "");
  return m ? m[1] : "";
}

// Matches scripts/prerender-blog.mjs headingId so static and hydrated anchors agree
function headingId(children: unknown): string {
  const text = Array.isArray(children)
    ? children.map((c) => (typeof c === "string" ? c : "")).join("")
    : String(children ?? "");
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);
}

// ```stats / ```chart fences render as animated data blocks
const markdownComponents = {
  h2: ({ node: _node, children, ...props }: any) => (
    <h2 id={headingId(children)} {...props}>{children}</h2>
  ),
  h3: ({ node: _node, children, ...props }: any) => (
    <h3 id={headingId(children)} {...props}>{children}</h3>
  ),
  pre: ({ node: _node, ...props }: any) => {
    const lang = fenceLanguage(props?.children?.props?.className);
    if (DATA_FENCE_LANGUAGES.includes(lang)) {
      return <>{props.children}</>;
    }
    return <pre {...props} />;
  },
  code: ({ node: _node, ...props }: any) => {
    const lang = fenceLanguage(props?.className);
    if (DATA_FENCE_LANGUAGES.includes(lang)) {
      return (
        <Suspense fallback={null}>
          <DataFence language={lang} raw={String(props.children ?? "")} />
        </Suspense>
      );
    }
    return <code {...props} />;
  },
};
import { Calendar, User, ArrowLeft, Clock, ArrowRight } from "lucide-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import type { BlogPost as BlogPostType } from "@shared/schema";
import { useEffect, useMemo } from "react";

function BlogPostSkeleton() {
  return (
    <div className="max-w-3xl mx-auto">
      <Skeleton className="h-8 w-32 mb-6" />
      <Skeleton className="h-12 w-full mb-4" />
      <Skeleton className="h-8 w-3/4 mb-6" />
      <div className="flex gap-4 mb-8">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="aspect-[16/9] w-full rounded-2xl mb-10" />
      <div className="space-y-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
      </div>
    </div>
  );
}

function estimateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

const INSURANCE_TAGS = new Set([
  "life-insurance",
  "final-expense",
  "mortgage-protection",
  "coverage-gap",
  "insurance-statistics",
  "insurance-data",
  "funeral-costs",
  "mortgage-debt",
  "financial-protection",
]);

function isInsurancePost(p: BlogPostType): boolean {
  return (p.tags || []).some((t) => INSURANCE_TAGS.has(t));
}

function calculateRelevanceScore(currentPost: BlogPostType, otherPost: BlogPostType): number {
  const currentTags = new Set(currentPost.tags || []);
  const currentKeywords = new Set(currentPost.seoKeywords || []);
  const otherTags = new Set(otherPost.tags || []);
  const otherKeywords = new Set(otherPost.seoKeywords || []);

  let score = 0;

  currentTags.forEach(tag => {
    if (otherTags.has(tag)) score += 3;
  });

  currentKeywords.forEach(keyword => {
    if (otherKeywords.has(keyword)) score += 2;
  });

  currentTags.forEach(tag => {
    if (otherKeywords.has(tag)) score += 1;
  });
  currentKeywords.forEach(keyword => {
    if (otherTags.has(keyword)) score += 1;
  });

  return score;
}

function useSEOMetaTags(post: BlogPostType | undefined) {
  useEffect(() => {
    if (!post) return;

    const siteUrl = window.location.origin;
    const postUrl = `${siteUrl}/blog/${post.slug}`;
    
    const title = post.seoTitle || `${post.title} | Sakred Health`;
    const description = post.seoDescription || post.excerpt;
    const image = post.ogImage || post.featuredImage || `${siteUrl}/og-default.jpg`;
    const keywords = post.seoKeywords?.join(", ") || post.tags?.join(", ") || "";

    const originalTitle = document.title;
    document.title = title;

    const createdElements: HTMLElement[] = [];
    const modifiedMetas: { element: HTMLMetaElement; originalContent: string }[] = [];

    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
        createdElements.push(tag);
      } else {
        modifiedMetas.push({ element: tag, originalContent: tag.content });
      }
      tag.content = content;
    };

    setMetaTag("description", description);
    setMetaTag("keywords", keywords);
    setMetaTag("author", post.author);

    setMetaTag("og:type", "article", true);
    setMetaTag("og:title", title, true);
    setMetaTag("og:description", description, true);
    setMetaTag("og:url", postUrl, true);
    setMetaTag("og:image", image, true);
    setMetaTag("og:site_name", "Sakred Health", true);
    setMetaTag("article:published_time", post.publishedAt ? new Date(post.publishedAt).toISOString() : "", true);
    setMetaTag("article:author", post.author, true);

    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    setMetaTag("twitter:image", image);

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    const canonicalExisted = !!canonicalLink;
    const originalCanonicalHref = canonicalLink?.href || "";
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = post.canonicalUrl || postUrl;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.seoDescription || post.excerpt,
      image: image,
      author: {
        "@type": "Person",
        name: post.author,
      },
      publisher: {
        "@type": "Organization",
        name: "Sakred Health",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/logo.png`,
        },
      },
      datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      url: postUrl,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": postUrl,
      },
      keywords: keywords,
      ...(post.llmSummary && {
        abstract: post.llmSummary,
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: [".prose", "h1"],
        },
      }),
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"][data-blog-seo]') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.type = "application/ld+json";
      scriptTag.setAttribute("data-blog-seo", "true");
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(jsonLd);

    return () => {
      document.title = originalTitle;
      
      createdElements.forEach((el) => el.remove());
      
      modifiedMetas.forEach(({ element, originalContent }) => {
        element.content = originalContent;
      });
      
      if (canonicalExisted) {
        const canon = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (canon) canon.href = originalCanonicalHref;
      } else {
        const canon = document.querySelector('link[rel="canonical"]');
        if (canon) canon.remove();
      }
      
      const blogJsonLd = document.querySelector('script[type="application/ld+json"][data-blog-seo]');
      if (blogJsonLd) blogJsonLd.remove();
    };
  }, [post]);
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery<BlogPostType>({
    queryKey: ["/api/blog-posts", slug],
  });

  const { data: allPosts } = useQuery<BlogPostType[]>({
    queryKey: ["/api/blog-posts"],
  });

  const recommendedPosts = useMemo(() => {
    if (!post || !allPosts) return [];

    const otherPosts = allPosts.filter(p => p.id !== post.id);
    const scoredPosts = otherPosts
      .map(p => ({ post: p, score: calculateRelevanceScore(post, p) }))
      .sort((a, b) => b.score - a.score);

    const picks = scoredPosts.filter(sp => sp.score > 0).slice(0, 3).map(sp => sp.post);

    // Wellness readers always get one path into the coverage content
    if (!isInsurancePost(post) && !picks.some(isInsurancePost)) {
      const bestInsurance = scoredPosts.map(sp => sp.post).find(isInsurancePost);
      if (bestInsurance) {
        if (picks.length >= 3) picks[2] = bestInsurance;
        else picks.push(bestInsurance);
      }
    }
    return picks;
  }, [post, allPosts]);

  useSEOMetaTags(post);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F9F7]">
        <Navigation />
        <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
          <BlogPostSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#F9F9F7]">
        <Navigation />
        <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center py-20">
            <h1 className="text-3xl font-display font-normal text-[#0F172A] mb-4">Article not found</h1>
            <p className="text-[#0F172A]/70 mb-8">
              The article you're looking for doesn't exist or has been moved.
            </p>
            <Button asChild className="rounded-full btn-gold-shine text-[#0F172A] border border-[#C5A059]" data-testid="button-back-blog-404">
              <Link href="/blog">Back to Blog</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const readTime = estimateReadTime(post.content);

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      <Navigation />

      <main className="pt-24 pb-20">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/blog" className="inline-flex items-center gap-2 text-[#C5A059] hover:underline mb-8" data-testid="link-back-blog">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Blog</span>
            </Link>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-[#C5A059]/10 text-[#C5A059]"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-normal text-[#0F172A] mb-6 leading-tight" data-testid="text-post-title">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C5A059] to-[#A08040] flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="block text-sm font-medium text-[#0F172A]" data-testid="text-post-author">{post.author}</span>
                  <span className="block text-xs text-[#0F172A]/50">Wellness Expert</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-[#0F172A]/60">
                {post.publishedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{readTime} min read</span>
                </div>
              </div>
            </div>

            {post.featuredImage && (
              <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-10 shadow-lg">
                <img loading="lazy" decoding="async"
                  src={post.featuredImage}
                  alt={post.featuredImageAlt || post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="prose prose-lg max-w-none prose-headings:text-[#0F172A] prose-headings:font-display prose-headings:font-normal prose-p:text-[#0F172A]/70 prose-p:leading-relaxed prose-a:text-[#C5A059] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#0F172A] prose-ul:text-[#0F172A]/70 prose-ol:text-[#0F172A]/70 prose-blockquote:border-l-[#C5A059] prose-blockquote:text-[#0F172A]/70 prose-blockquote:italic">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {post.seoKeywords && post.seoKeywords.length > 0 && (
              <div className="mt-10 pt-8 border-t border-stone-200">
                <h3 className="text-sm font-medium text-[#0F172A]/60 mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {post.seoKeywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="outline"
                      className="border-[#C5A059]/30 text-[#C5A059] bg-[#C5A059]/5 text-xs"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </article>

        {recommendedPosts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-12 border-t border-stone-200"
          >
            <h2 className="text-2xl font-display font-normal text-[#0F172A] mb-2 text-center">
              Recommended Articles
            </h2>
            <p className="text-[#0F172A]/70 text-center mb-8">
              Based on topics related to this article
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedPosts.map((recPost) => (
                <Link key={recPost.id} href={`/blog/${recPost.slug}`} data-testid={`link-recommended-${recPost.id}`}>
                  <Card className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(197,160,89,0.25)] hover:border-[#C5A059]/30 transition-all duration-300 border border-transparent cursor-pointer group h-full flex flex-col">
                    {recPost.featuredImage && (
                      <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#C5A059]/10 to-[#EBD598]/20">
                        <img loading="lazy" decoding="async"
                          src={recPost.featuredImage}
                          alt={recPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      {recPost.tags && recPost.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {recPost.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-[#C5A059]/10 text-[#C5A059] text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <h3 className="text-lg font-display font-normal text-[#0F172A] mb-2 group-hover:text-[#C5A059] transition-colors line-clamp-2">
                        {recPost.title}
                      </h3>
                      <p className="text-[#0F172A]/70 text-sm leading-relaxed flex-1 line-clamp-2">
                        {recPost.excerpt}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-[#C5A059] text-sm font-medium group-hover:gap-3 transition-all">
                        <span>Read more</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.section>
        )}
      </main>

      <Footer />
    </div>
  );
}
