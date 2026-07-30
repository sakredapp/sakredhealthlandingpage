/**
 * Product catalog for the /products pages.
 *
 * SECURITY: campaign slugs are a CREDENTIAL (they self-authenticate the CRM
 * webhook) and must NEVER appear in client code. They live only in server-side
 * env vars, read by api/product-lead.ts. The client sends the product `slug`
 * (a public, non-secret id); the server maps it to the real campaign slug.
 *
 * `smsKeyword` IS public (it's visible in the sms: link the user taps), so it
 * stays here. Only MP and HEALTH keywords are wired on the CRM side today; the
 * others still create a lead but land untagged until the CRM adds campaigns.
 */
export type Pillar = "Life" | "Health" | "Retirement";

export interface DetailSection {
  heading: string;
  /** Optional lead-in paragraph(s) above the list. */
  intro?: string[];
  items: { name: string; description: string }[];
  /** Optional closing paragraph below the list. */
  outro?: string;
}

export interface Product {
  slug: string;        // route + server product id: /products/<slug>
  smsKeyword: string;  // SMS body keyword (public)
  pillar: Pillar;
  title: string;
  eyebrow: string;
  tagline: string;
  blurb: string;
  points: string[];
  /** When set, the intake form shows a "coverage in mind" dropdown with this label. */
  amountLabel?: string;
  /** Deep-dive sections rendered on the product detail page below the hero. */
  detailSections?: DetailSection[];
}

export const PRODUCTS: Product[] = [
  {
    slug: "mortgage-protection",
    smsKeyword: "MP",
    pillar: "Life",
    title: "Mortgage Protection",
    eyebrow: "The coverage that pays off the house",
    tagline: "Keep the home, not the payment.",
    blurb:
      "Insurance coverage built around your home loan. If something happens to you, it can pay off what's left — so your family keeps the equity and the house, not the payment.",
    points: [
      "Pays toward (or off) the remaining mortgage balance",
      "Built around your loan, your budget, and your timeline",
      "Not PMI, not a refinance — it protects your family, not the bank",
    ],
    amountLabel: "Coverage in mind",
    detailSections: [
      {
        heading: "Protect your family from the mortgage — not the bank",
        intro: [
          "Mortgage protection has nothing to do with PMI. PMI protects the lender if you default; mortgage protection protects the people you love. If something happens to you, it keeps your family from inheriting the burden of the mortgage and helps preserve the equity you worked hard to build, so they aren't forced to sell the home.",
          "Best of all, it's flexible. We size the coverage around your budget and your goals — there's no one-size-fits-all answer.",
        ],
        items: [
          { name: "Breathing room", description: "Cover a year or two of mortgage payments so your family has time to regroup" },
          { name: "Partial payoff", description: "Pay off a portion of the balance — half the mortgage, or whatever fits" },
          { name: "Full payoff", description: "Clear the entire mortgage so the home is theirs, free and clear" },
          { name: "Your terms", description: "Adjust the term and benefit to match your budget and timeline" },
        ],
        outro:
          "Because it's budget-driven, monthly premiums can range anywhere from about $30 to $250+, depending on the coverage amount, your age, and your health. Your dedicated agent walks you through the options and builds a plan that fits.",
      },
    ],
  },
  {
    slug: "final-expense",
    smsKeyword: "FE",
    pillar: "Life",
    title: "Final Expense",
    eyebrow: "Nobody should have to pass a hat",
    tagline: "Cover the goodbye, not your family.",
    blurb:
      "A small whole-life policy that covers funeral, burial, and end-of-life costs — so the people you love aren't left with the bill during the hardest week of their lives.",
    points: [
      "Fixed premiums that never increase",
      "Simple qualification — often no medical exam",
      "Benefit paid quickly, directly to who you choose",
    ],
    amountLabel: "Coverage in mind",
  },
  {
    slug: "life-insurance",
    smsKeyword: "LIFE",
    pillar: "Life",
    title: "General Life",
    eyebrow: "The paycheck that keeps showing up",
    tagline: "Your income, protected for the people who count on it.",
    blurb:
      "Term, whole life, and Indexed Universal Life (IUL) — coverage that replaces your income, builds cash value, or both, matched to what your family actually needs.",
    points: [
      "Term for affordable, level coverage over 10–30 years",
      "Whole life & IUL for permanent coverage with cash value",
      "Sized to your income, debts, and long-term goals",
    ],
    amountLabel: "Coverage in mind",
    detailSections: [
      {
        heading: "The kinds of life coverage we write",
        items: [
          { name: "Term Life", description: "Affordable level coverage for 10, 20, or 30 years — the most protection per dollar" },
          { name: "Whole Life", description: "Permanent coverage with guaranteed cash value growth" },
          { name: "Indexed Universal Life (IUL)", description: "Permanent life insurance with market-linked cash value" },
        ],
        outro:
          "Not sure which fits? That's the job — your dedicated agent compares them against your income, debts, and goals and builds the mix that actually makes sense.",
      },
    ],
  },
  {
    slug: "health-insurance",
    smsKeyword: "HEALTH",
    pillar: "Health",
    title: "Private Health Insurance",
    eyebrow: "Getting sick shouldn't cost you the house",
    tagline: "Real coverage, a real agent, on your budget.",
    blurb:
      "Major medical, short-term, and supplemental plans compared for your situation by a dedicated agent — for the self-employed, 1099, and anyone without an employer plan.",
    points: [
      "Major medical, short-term, dental & vision, supplemental",
      "A dedicated agent who compares carriers for you",
      "Plans matched to your budget — not a one-size-fits-all group plan",
    ],
    detailSections: [
      {
        heading: "Every kind of health coverage we place",
        items: [
          { name: "Major Medical", description: "Comprehensive health coverage (PPO, HMO, EPO)" },
          { name: "Limited Medical", description: "Budget-friendly plans with set benefit limits" },
          { name: "Fixed Indemnity", description: "Pays fixed dollar amounts per service or event" },
          { name: "Short-Term Medical", description: "Temporary coverage for gaps in insurance" },
          { name: "Hospital Indemnity", description: "Cash payouts for hospital stays" },
          { name: "Dental & Vision", description: "Standalone dental (PPO & Indemnity) and vision" },
          { name: "DVH", description: "Bundled Dental, Vision & Hearing coverage" },
          { name: "Supplemental", description: "Accident, Critical Illness, Cancer — pays on top of primary" },
          { name: "Disability Income", description: "Income replacement during disability" },
        ],
        outro:
          "You don't need to know which of these you need — that's what your agent is for. Tell them your situation and budget; they'll bring back the plans worth looking at.",
      },
    ],
  },
  {
    slug: "aca-plans",
    smsKeyword: "ACA",
    pillar: "Health",
    title: "ACA Marketplace Plans",
    eyebrow: "Subsidies, if you qualify — without the government-website maze",
    tagline: "Marketplace coverage, handled for you.",
    blurb:
      "Affordable Care Act plans with premium subsidies for those who qualify. We check your subsidy, compare the marketplace plans in your area, and handle enrollment — no Healthcare.gov wrestling required.",
    points: [
      "Free subsidy check — many households qualify and don't know it",
      "Guaranteed coverage regardless of pre-existing conditions",
      "We handle the marketplace paperwork and enrollment windows",
    ],
    detailSections: [
      {
        heading: "How ACA coverage works",
        items: [
          { name: "Premium subsidies", description: "Income-based tax credits that can cut your monthly premium dramatically" },
          { name: "Essential benefits", description: "Every ACA plan covers doctor visits, hospitalization, prescriptions, and preventive care" },
          { name: "Pre-existing conditions", description: "Guaranteed issue — you can't be denied or charged more for your health history" },
          { name: "Enrollment windows", description: "Open Enrollment plus Special Enrollment after qualifying life events — we track the deadlines" },
        ],
        outro:
          "Earn too much for a subsidy? That's exactly when private health insurance often beats an unsubsidized marketplace premium — your agent will compare both sides and show you the math.",
      },
    ],
  },
  {
    slug: "retirement-annuities",
    smsKeyword: "ANNUITY",
    pillar: "Retirement",
    title: "Retirement & Annuities",
    eyebrow: "Money that doesn't run out before you do",
    tagline: "Guaranteed income you can't outlive.",
    blurb:
      "Fixed, indexed, and immediate annuities that turn savings into predictable retirement income — protecting what you've built from market swings and longevity.",
    points: [
      "Guaranteed income options — fixed, indexed, immediate",
      "Protect principal from market downturns",
      "Built around your retirement timeline and goals",
    ],
    detailSections: [
      {
        heading: "Ways an annuity can pay you",
        items: [
          { name: "Fixed", description: "A guaranteed rate and predictable, steady income" },
          { name: "Indexed", description: "Growth linked to a market index with downside protection" },
          { name: "Immediate", description: "Turn a lump sum into income that starts right away" },
        ],
        outro:
          "Which one fits depends on your timeline, savings, and how soon you need the income — your dedicated agent maps it out with you, no pressure.",
      },
    ],
  },
];

export const PILLARS: { name: Pillar; blurb: string }[] = [
  { name: "Life", blurb: "Protect the people who count on you." },
  { name: "Health", blurb: "Coverage for today, without the runaround." },
  { name: "Retirement", blurb: "Income and security for what's next." },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
