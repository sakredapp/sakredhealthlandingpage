/**
 * The guided multi-day programs ("protocols") inside the Sakred Health app.
 * Kept in sync with the app's wellness_routines catalog. Each protocol has a
 * deep-dive blog post that carries the organic search intent for its topic.
 */
export interface Protocol {
  /** Program name as it appears in the app. */
  name: string;
  days: number;
  /** Short goal label used in the app catalog. */
  goal: string;
  /** One-sentence plain-language description. */
  summary: string;
  /** Headline daily practices — what the user actually does. */
  practices: string[];
  /** Slug of the deep-dive guide on our blog. */
  postSlug: string;
  /** True when the paired in-app guide is free. */
  free: boolean;
}

export const PROTOCOLS: Protocol[] = [
  {
    name: "Liver & Detox Support",
    days: 21,
    goal: "Liver Restoration",
    summary:
      "Supports the liver's own two-phase detoxification pathways and bile flow — the organ that already does the work, given what it needs.",
    practices: [
      "Morning lemon water and structured hydration",
      "Milk thistle (silymarin) and bile-supportive bitter foods",
      "Ground flaxseed fiber to bind what the liver excretes",
      "A cruciferous vegetable protocol",
      "Castor oil packs",
      "A dietary reset — alcohol, added sugar, and seed oils out",
    ],
    postSlug: "liver-detox-support-protocol-21-day-guide",
    free: true,
  },
  {
    name: "Full Gut Reset & Drainage",
    days: 28,
    goal: "Gut Restoration",
    summary:
      "The rebuilding phase: restore enzyme output, repair the gut lining, calm the gut-brain axis, and reseed the microbiome.",
    practices: [
      "Digestive bitters and enzymes before meals",
      "L-glutamine, bone broth, and collagen",
      "An elimination diet with structured reintroduction",
      "Pre-meal 4-4-6 gut-brain breathing",
      "Targeted probiotics and fermented foods",
      "Meal spacing so the migrating motor complex can run",
    ],
    postSlug: "gut-reset-protocol-28-day-restoration-guide",
    free: true,
  },
  {
    name: "Lymphatic & Circulatory Cleanse",
    days: 21,
    goal: "Lymphatic Reset",
    summary:
      "Your lymphatic system has no pump — it moves when you move. Eight equipment-free practices that keep it moving.",
    practices: [
      "Dry brushing and manual lymphatic self-massage",
      "Rebounding and daily movement",
      "Diaphragmatic breathing",
      "Hot-cold contrast showers",
      "Infrared sauna or deep sweat",
      "Anti-inflammatory hydration and a lymph-supportive diet",
    ],
    postSlug: "lymphatic-drainage-routine-21-day-guide",
    free: true,
  },
  {
    name: "Sleep & Nervous System Regulation",
    days: 14,
    goal: "Sleep Restoration",
    summary:
      "Retrains the body's downshift signals — for the people who fall asleep fine and wake at 3 a.m., and the ones who never wind down at all.",
    practices: [
      "A 20-minute wind-down ritual and screens-off at sunset",
      "Box breathing and vagus nerve reset",
      "An evening mental offload",
      "Morning sunlight anchoring",
      "Magnesium glycinate, L-theanine, and apigenin — calm down, not knock out",
      "Warm-shower temperature contrast before bed",
    ],
    postSlug: "sleep-nervous-system-reset-14-day-protocol",
    free: true,
  },
  {
    name: "Digestive Stability",
    days: 21,
    goal: "Digestive Reset",
    summary:
      "The clearing phase that precedes the gut reset — terrain management, with elimination pathways kept open throughout.",
    practices: [
      "Papaya seed, mimosa pudica, and pumpkin seed",
      "Apple cider vinegar and raw garlic",
      "Tongue scraping with S. boulardii",
      "Pau d'Arco tea",
      "Food guardrails",
      "Intensive tier adds cycled botanicals and a binder stack",
    ],
    postSlug: "digestive-stability-protocol-21-day-clearing-phase",
    free: false,
  },
];
