import type { StateInfo } from "./states";

/**
 * Copy-variation engine for the state mortgage-protection pages.
 *
 * 51 pages that differ only by name/number read as scaled/duplicate content.
 * To keep each page genuinely distinct we (1) rotate several tone variants
 * (emotional, logical, legacy, plain, protective, peace-of-mind) deterministically
 * by state, and (2) weave in sentences derived from that state's *own* numbers —
 * how its home prices rank among the 51 — so no two pages share a paragraph.
 * Everything stays factually accurate and on-brand (mortgage protection = life
 * insurance that pays off the loan; never PMI, a loan, or a refinance).
 */
interface Stat {
  name: string;
  medianHomeValue: number | null;
  medianOwnerCostWithMortgage: number | null;
  medianHouseholdIncome: number | null;
  homeownershipRate: number | null;
  medianAge: number | null;
}

const usd = (n: number | null) => (n == null ? "—" : `$${n.toLocaleString()}`);

// Stable per-state index so a given state always renders the same variant.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// Where this state's home value sits among all 51 (for unique, factual prose).
function homeValueRank(abbr: string, all: Record<string, Stat>) {
  const mine = all[abbr]?.medianHomeValue;
  const values = Object.values(all)
    .map((s) => s.medianHomeValue)
    .filter((v): v is number => v != null);
  if (mine == null) return { lower: 0, higher: 0, tier: "mid" as const };
  const lower = values.filter((v) => v < mine).length;
  const higher = values.filter((v) => v > mine).length;
  const tier = lower >= 34 ? ("high" as const) : lower <= 16 ? ("low" as const) : ("mid" as const);
  return { lower, higher, tier };
}

interface Ctx {
  name: string;
  hv: string; // median home value
  oc: string; // monthly owner cost
  annual: string; // yearly owner cost
  rank: { lower: number; higher: number; tier: "high" | "mid" | "low" };
}

interface Variant {
  tone: string;
  headline: { text: string; accent: string };
  intro: (c: Ctx) => string;
  points: [string, string, string];
  numbersHeading: (name: string) => { text: string; accent: string };
  whyHeading: { text: string; accent: string };
  whyBody: (c: Ctx) => string;
  formHeading: (name: string) => string;
  ctaNote: string;
}

const rankPhrase = (c: Ctx, style: "price" | "market" | "cost") => {
  const { tier, lower, higher } = c.rank;
  if (style === "price")
    return tier === "high"
      ? `At ${c.hv}, ${c.name} homes cost more than in ${lower} other states — so there's more balance to protect.`
      : tier === "low"
        ? `${c.name} homes are more affordable than in ${higher} states, but a paid-off balance still matters to the family left with it.`
        : `${c.name} sits mid-pack — pricier than ${lower} states, cheaper than ${higher}.`;
  if (style === "market")
    return tier === "high"
      ? `${c.name}'s housing market runs hot (above ${lower} of 51 states), which means a larger loan behind the front door.`
      : tier === "low"
        ? `Even in a steadier market like ${c.name}'s (below ${higher} states on price), the mortgage is usually the biggest bill a household leaves behind.`
        : `${c.name} lands near the middle of the country on home prices.`;
  return tier === "high"
    ? `Higher home values in ${c.name} — above ${lower} states — usually mean a bigger monthly payment to cover.`
    : tier === "low"
      ? `Lower prices in ${c.name} keep payments down, but ${c.annual} a year is still ${c.annual} the family has to find.`
      : `${c.name}'s costs sit close to the national middle.`;
};

const VARIANTS: Variant[] = [
  {
    tone: "emotional",
    headline: { text: "The people you love", accent: "shouldn't inherit the payment." },
    intro: (c) =>
      `In ${c.name}, the typical home is worth ${c.hv}, and a mortgage runs about ${c.oc} a month — roughly ${c.annual} a year. If something happened to you tomorrow, that bill wouldn't pause for grief. Mortgage protection is life insurance that clears the balance, so the people you love keep the home instead of the payment. ${rankPhrase(c, "price")}`,
    points: [
      "Pays the remaining mortgage so your family isn't forced to sell in the hardest season of their lives",
      "Built around your loan and your budget — you choose how much protection feels right",
      "It protects your family, not the bank — nothing like PMI",
    ],
    numbersHeading: (n) => ({ text: `What a ${n} home`, accent: "really costs a family" }),
    whyHeading: { text: "Grief is enough.", accent: "The mortgage shouldn't be too." },
    whyBody: (c) =>
      `Losing a parent or a partner is the hardest thing a family goes through. Adding a ${c.oc} mortgage payment on top of it — every month, whether or not the income is still there — is a cruelty no one plans for. A mortgage protection policy in ${c.name} takes that specific fear off the table.`,
    formHeading: (n) => `Protect your ${n} home`,
    ctaNote: "A licensed agent will reach out — no obligation, no pressure.",
  },
  {
    tone: "logical",
    headline: { text: "Your mortgage doesn't stop", accent: "if your paycheck does." },
    intro: (c) =>
      `The median ${c.name} home carries a ${c.hv} value and about ${c.oc}/month in owner costs — ${c.annual} a year that has to come from somewhere. Mortgage protection is term life insurance sized to that balance: if you pass during the term, it pays the loan off. Not PMI, not a refinance — a straightforward hedge on the largest debt most households carry. ${rankPhrase(c, "market")}`,
    points: [
      "Death benefit sized to your outstanding balance, so the loan is covered, not guessed at",
      "Level term you can match to the years left on the mortgage",
      "Typically income-tax-free to your beneficiary — the full benefit goes to the debt",
    ],
    numbersHeading: (n) => ({ text: `${n} by`, accent: "the numbers" }),
    whyHeading: { text: "Run the math", accent: "on the worst case" },
    whyBody: (c) =>
      `A household earning the ${c.name} median still owes the same balance the day after a death as the day before. Without coverage, that ${c.oc} payment competes with every other bill on a single income — or no income. Mortgage protection converts an unknown liability into a fixed, affordable premium.`,
    formHeading: (n) => `See your ${n} options`,
    ctaNote: "A licensed agent compares options for your balance and budget.",
  },
  {
    tone: "legacy",
    headline: { text: "Keep the home in the family,", accent: "not just the memories." },
    intro: (c) =>
      `You've been building equity in your ${c.name} home — where the median value is ${c.hv}. Mortgage protection makes sure that equity, and the home itself, actually passes to your family instead of being swallowed by a balance they can't carry. It pays off the loan so the house is theirs, free and clear. ${rankPhrase(c, "price")}`,
    points: [
      "Pays off the balance so the equity you built stays with your family",
      "Keeps heirs from being forced into a quick sale to cover payments",
      "Pairs with your broader life and estate plan under one agent",
    ],
    numbersHeading: (n) => ({ text: `The equity behind`, accent: `a ${n} home` }),
    whyHeading: { text: "Equity is only yours", accent: "if they can keep it" },
    whyBody: (c) =>
      `Every payment you make in ${c.name} turns a little more of that ${c.hv} into equity. But if the mortgage outlives your income, your family may have to sell the home just to settle it — handing that equity to a buyer instead of keeping it. Mortgage protection closes that gap.`,
    formHeading: (n) => `Keep your ${n} home in the family`,
    ctaNote: "A licensed agent will help size it to your goals.",
  },
  {
    tone: "plain",
    headline: { text: "Pay off the house", accent: "even if you're not here to." },
    intro: (c) =>
      `Straight talk: a home in ${c.name} runs about ${c.hv}, and the payment is around ${c.oc} a month. Mortgage protection is a life insurance policy that pays off whatever's left on your loan if you die. That's it. Your family keeps the house and skips the payment. It isn't a loan, a refinance, or PMI. ${rankPhrase(c, "cost")}`,
    points: [
      "If you pass, it pays off the mortgage balance — simple as that",
      "You pick the amount and term; we size it to your budget",
      "No exam required on many plans; fixed premiums that don't rise",
    ],
    numbersHeading: (n) => ({ text: `${n} home costs,`, accent: "no spin" }),
    whyHeading: { text: "No jargon,", accent: "just the point" },
    whyBody: (c) =>
      `Here's the whole idea: your family in ${c.name} owes money on the house. If your income disappears, that ${c.oc} payment doesn't. This policy erases the balance so they don't lose the home over it. Cheap peace of mind for the biggest bill you've got.`,
    formHeading: (n) => `Get a ${n} quote`,
    ctaNote: "Quick and free — a licensed agent does the legwork.",
  },
  {
    tone: "protective",
    headline: { text: "One policy stands between", accent: "your family and the bank." },
    intro: (c) =>
      `A mortgage is a promise to keep paying — ${c.oc} a month on a typical ${c.name} home worth ${c.hv}. Mortgage protection is the safety net under that promise: if you're gone, it pays the balance so the bank is settled and your family stays put. It defends the people you're responsible for, not the lender. ${rankPhrase(c, "market")}`,
    points: [
      "Guarantees the loan gets paid even if your income can't",
      "Shields your family from foreclosure pressure during grief",
      "Coverage that follows your balance down as you pay it off",
    ],
    numbersHeading: (n) => ({ text: `What you're`, accent: `protecting in ${n}` }),
    whyHeading: { text: "A safety net", accent: "for the one bill that can't lapse" },
    whyBody: (c) =>
      `Miss enough mortgage payments and the outcome in ${c.name} is the same everywhere: the lender takes the home. Mortgage protection is built for exactly that failure point — it settles the ${c.hv}-range balance so a loss of income never becomes a loss of the house.`,
    formHeading: (n) => `Put a net under your ${n} home`,
    ctaNote: "A licensed agent will build the right level of protection with you.",
  },
  {
    tone: "peace",
    headline: { text: "Sleep easier knowing", accent: "the mortgage is handled." },
    intro: (c) =>
      `Most people in ${c.name} don't want to think about this — a ${c.hv} home, ${c.oc} a month, and what happens if they're not around to pay it. Mortgage protection lets you set it and stop worrying: one policy that pays the loan off if you pass, so your family keeps the home without the weight. ${rankPhrase(c, "cost")}`,
    points: [
      "One decision that takes the biggest what-if off your mind",
      "Affordable, fixed premiums — set it once and forget it",
      "Your family stays in the home; the balance is already handled",
    ],
    numbersHeading: (n) => ({ text: `The worry behind`, accent: `a ${n} home` }),
    whyHeading: { text: "Cross it off", accent: "the list of things to worry about" },
    whyBody: (c) =>
      `You can't plan for everything, but you can plan for this one. For most ${c.name} families, the mortgage is the single largest thing that would go unpaid — and the easiest to cover in advance. Handle it now and it stops being a worry.`,
    formHeading: (n) => `Your free ${n} quote`,
    ctaNote: "A licensed agent will reach out — no obligation, no pressure.",
  },
];

export interface StateCopy {
  tone: string;
  headline: { text: string; accent: string };
  intro: string;
  points: string[];
  numbersHeading: { text: string; accent: string };
  whyHeading: { text: string; accent: string };
  whyBody: string;
  formHeading: string;
  ctaNote: string;
}

export function getStateCopy(state: StateInfo, stat: Stat, all: Record<string, Stat>): StateCopy {
  const v = VARIANTS[hash(state.abbr) % VARIANTS.length];
  const oc = stat.medianOwnerCostWithMortgage;
  const ctx: Ctx = {
    name: state.name,
    hv: usd(stat.medianHomeValue),
    oc: usd(oc),
    annual: usd(oc != null ? oc * 12 : null),
    rank: homeValueRank(state.abbr, all),
  };
  return {
    tone: v.tone,
    headline: v.headline,
    intro: v.intro(ctx),
    points: v.points,
    numbersHeading: v.numbersHeading(state.name),
    whyHeading: v.whyHeading,
    whyBody: v.whyBody(ctx),
    formHeading: v.formHeading(state.name),
    ctaNote: v.ctaNote,
  };
}
