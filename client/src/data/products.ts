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
      "A life insurance policy sized to your mortgage. If something happens to you, it can pay off what's left on the loan — so your family keeps the equity and the house, not the burden.",
    points: [
      "Pays toward (or off) the remaining mortgage balance",
      "Built around your loan, your budget, and your timeline",
      "Not PMI, not a refinance — it protects your family, not the bank",
    ],
    amountLabel: "Coverage in mind",
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
    title: "Life Insurance",
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
  },
  {
    slug: "health-insurance",
    smsKeyword: "HEALTH",
    pillar: "Health",
    title: "Health Insurance",
    eyebrow: "Getting sick shouldn't cost you the house",
    tagline: "Real coverage, a real agent, on your budget.",
    blurb:
      "Major medical, ACA, short-term, and supplemental plans compared for your situation by a dedicated agent — for the self-employed, 1099, and anyone without an employer plan.",
    points: [
      "Major medical, ACA, short-term, dental & vision, supplemental",
      "A dedicated agent who compares carriers for you",
      "Plans matched to your budget — not a one-size-fits-all group plan",
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
