/**
 * Editorial categories for the blog.
 *
 * Posts carry granular tags in their frontmatter (`seed-oils`, `sibo`,
 * `mortgage-debt`, …) — good for search, useless as navigation. This maps
 * those tags onto the six sections a reader actually browses by.
 *
 * The mapping lives in the repo rather than in the database because it is an
 * editorial judgement, and because it has to stay in sync with the nav on the
 * blog page — which is right here.
 */
export const BLOG_CATEGORIES = [
  "Health",
  "Food",
  "Practitioners",
  "Insurance",
  "Life",
  "Research",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

/**
 * Tag → category. First match in `BLOG_CATEGORIES` order wins, so a post
 * tagged both `gut-health` and `research` files under Health: the subject
 * matters more than the format.
 */
const TAG_MAP: Record<BlogCategory, string[]> = {
  Health: [
    "gut-health", "sleep", "detox", "drainage-pathways", "liver-health",
    "digestive-reset", "sibo", "protocols", "lymphatic", "daily-habits",
    "habits", "movement", "exercise-snacks", "stress-management", "burnout",
    "healthy-aging", "hormones", "inflammation", "parasites", "immune",
  ],
  Food: [
    "recipes", "food", "nutrition", "seed-oils", "sugar", "added-sugar",
    "sweeteners", "ultra-processed", "big-food", "food-labeling", "dates",
    "food-safety", "blood-sugar", "refining", "consumer", "fall",
  ],
  Practitioners: [
    "practitioners", "acupuncture", "tcm", "chiropractic", "ayurveda",
    "functional-medicine", "bodywork", "naturopathic", "network", "care",
  ],
  Insurance: [
    "insurance", "insurance-data", "mortgage-protection", "mortgage-debt",
    "final-expense", "funeral-costs", "life-insurance", "aca", "health-insurance",
    "medical-debt", "coverage",
  ],
  Life: [
    "financial-planning", "retirement", "long-term-care", "family",
    "workplace-wellness", "employee-wellness", "corporate-wellness",
    "workplace-health", "desk-workers", "resilience", "screen-fatigue",
  ],
  Research: ["research", "evidence-review", "data", "statistics", "study"],
};

/**
 * Resolves a post's category from its tags.
 *
 * Everything lands somewhere: an unmapped post falls back to Health rather
 * than dropping out of the category nav entirely, because a post nobody can
 * navigate to is a post that may as well not be published.
 */
export function categoryForTags(tags: string[] | null | undefined): BlogCategory {
  if (!tags?.length) return "Health";
  const normalised = tags.map((tag) => tag.toLowerCase().trim());

  for (const category of BLOG_CATEGORIES) {
    if (normalised.some((tag) => TAG_MAP[category].includes(tag))) return category;
  }
  return "Health";
}

/**
 * Reading time from the raw markdown/HTML.
 *
 * 220wpm, which is on the faster side of the usual 200–250 range — this is
 * non-fiction people skim, and over-estimating puts readers off long pieces
 * that are actually worth their time.
 */
export function readingMinutes(content: string | null | undefined): number {
  if (!content) return 1;
  const words = content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}
