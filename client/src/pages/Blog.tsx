import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search, Calendar, User, ArrowRight } from "lucide-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSeo } from "@/lib/seo";
import { resolveAuthor } from "@/data/authors";
import type { BlogPost } from "@shared/schema";


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

function BlogCardSkeleton() {
  return (
    <Card className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-0">
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="p-6">
        <div className="flex gap-2 mb-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-7 w-full mb-2" />
        <Skeleton className="h-5 w-full mb-1" />
        <Skeleton className="h-5 w-3/4 mb-4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </Card>
  );
}

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
  });

  useSeo({
    title: "Wellness Insights — Health, Habits & Coverage | Sakred Health",
    description:
      "Articles, guides, and tips on preventative wellness, healthy habits, and navigating health and life insurance — from the Sakred Health team.",
    canonical: "/blog",
  });

  const matchedPosts = posts?.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      post.seoKeywords?.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  // Publication dates are assigned so that chronological order is already an
  // even rotation across subject buckets (see scripts/blog-content frontmatter),
  // so a plain newest-first sort gives a mixed grid without extra shuffling.
  const filteredPosts = useMemo(() => {
    if (!matchedPosts) return matchedPosts;
    return [...matchedPosts].sort((x, y) => {
      const dx = x.publishedAt ? new Date(x.publishedAt).getTime() : 0;
      const dy = y.publishedAt ? new Date(y.publishedAt).getTime() : 0;
      return dy - dx;
    });
  }, [matchedPosts]);

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      <Navigation />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="w-12 h-1 bg-gradient-to-r from-[#C5A059] to-[#EBD598] mx-auto mb-6" />
            <h1 className="text-4xl sm:text-5xl font-display font-normal text-[#0F172A] mb-4">
              Wellness{" "}
              <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
                Insights
              </span>
            </h1>
            <p className="text-lg text-[#0F172A]/70 max-w-2xl mx-auto">
              Discover articles, guides, and tips to support your wellness journey
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-10"
          >
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0F172A]/50" />
                <Input
                  type="search"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 rounded-full bg-white/60 backdrop-blur-md border-stone-200 focus:border-[#C5A059] focus:ring-[#C5A059]"
                  data-testid="input-blog-search"
                />
              </div>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredPosts && filteredPosts.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredPosts.map((post) => (
                <motion.div key={post.id} variants={itemVariants}>
                  <Link href={`/blog/${post.slug}`} data-testid={`link-post-${post.id}`}>
                    <Card className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(197,160,89,0.25)] hover:border-[#C5A059]/30 transition-all duration-300 border border-transparent cursor-pointer group h-full flex flex-col">
                      {post.featuredImage && (
                        <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#C5A059]/10 to-[#EBD598]/20">
                          <img loading="lazy" decoding="async"
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-6 flex-1 flex flex-col">
                        <h2
                          className="text-xl font-display font-normal text-[#0F172A] mb-2 group-hover:text-[#C5A059] transition-colors line-clamp-2"
                          data-testid={`text-post-title-${post.id}`}
                        >
                          {post.title}
                        </h2>
                        <p className="text-[#0F172A]/70 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-[#0F172A]/60 pt-4 border-t border-stone-100">
                          {(() => {
                            // post.author holds the frontmatter key ("gerard"), not a
                            // display name — resolve it so the card shows the full
                            // byline and headshot rather than a lowercase slug.
                            const author = resolveAuthor(post.author);
                            return (
                              <div className="flex items-center gap-1.5">
                                {author?.image ? (
                                  <img
                                    src={author.image}
                                    alt=""
                                    loading="lazy"
                                    width={20}
                                    height={20}
                                    className="w-5 h-5 rounded-full object-cover"
                                  />
                                ) : (
                                  <User className="w-3.5 h-3.5" />
                                )}
                                <span>{author?.name ?? post.author}</span>
                              </div>
                            );
                          })()}
                          {post.publishedAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>
                                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[#C5A059] text-sm font-medium group-hover:gap-3 transition-all">
                          <span>Read more</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 rounded-full bg-[#C5A059]/10 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-[#C5A059]" />
              </div>
              <h3 className="text-xl font-display font-normal text-[#0F172A] mb-2">No articles found</h3>
              <p className="text-[#0F172A]/70">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Check back soon for wellness insights and tips"}
              </p>
            </motion.div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
