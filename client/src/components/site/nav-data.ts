/**
 * The site's navigation, in one place.
 *
 * Header, footer, mobile drawer and the prerenderer all read from here, so a
 * route can't end up in the footer but missing from the drawer — which is how
 * pages quietly become unreachable.
 *
 * The order encodes the pivot: discovery first, coverage fourth. Insurance is
 * not hidden and not demoted to a footer link; it is one of six top-level
 * destinations rather than the identity of the site (brief §14, §36).
 */

export interface NavLink {
  label: string;
  href: string;
  /** Shown under the label in the Coverage menu and the mobile drawer. */
  description?: string;
}

/** The six coverage lines. Slugs match the existing, indexed product routes. */
export const COVERAGE_LINKS: NavLink[] = [
  {
    label: "Mortgage Protection",
    href: "/products/mortgage-protection",
    description: "Keep the home, not the payment.",
  },
  {
    label: "Life Insurance",
    href: "/products/life-insurance",
    description: "Your income, protected for the people who count on it.",
  },
  {
    label: "Final Expense",
    href: "/products/final-expense",
    description: "So the hardest week never comes with a bill.",
  },
  {
    label: "Private Health Insurance",
    href: "/products/health-insurance",
    description: "Real coverage, a real agent, on your budget.",
  },
  {
    label: "ACA Marketplace",
    href: "/products/aca-plans",
    description: "Marketplace coverage, handled for you.",
  },
  {
    label: "Retirement & Annuities",
    href: "/products/retirement-annuities",
    description: "Guaranteed income you can't outlive.",
  },
];

export const PRIMARY_NAV: NavLink[] = [
  { label: "Discover Care", href: "/discover" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Resources", href: "/resources" },
  { label: "For Practitioners", href: "/for-practitioners" },
  { label: "Blog", href: "/blog" },
];

export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: "Discover",
    links: [
      { label: "Find Care", href: "/discover" },
      { label: "Modalities", href: "/discover#modalities" },
      { label: "Recommend Someone", href: "/recommend" },
    ],
  },
  {
    title: "Sakred Health",
    links: [
      { label: "How It Works", href: "/#how-it-works" },
      { label: "App", href: "/app" },
      { label: "For Practitioners", href: "/for-practitioners" },
      { label: "Get Coverage", href: "/get-coverage" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Library", href: "/resources#library" },
      { label: "Food Chart", href: "/food-chart" },
      { label: "Blog", href: "/blog" },
      { label: "Real Foods Market", href: "/resources#market" },
    ],
  },
  {
    title: "Coverage",
    links: [
      { label: "Private Health", href: "/products/health-insurance" },
      { label: "Life", href: "/products/life-insurance" },
      { label: "Mortgage Protection", href: "/products/mortgage-protection" },
      { label: "Final Expense", href: "/products/final-expense" },
      { label: "ACA Marketplace", href: "/products/aca-plans" },
      { label: "Retirement", href: "/products/retirement-annuities" },
    ],
  },
  {
    title: "Legal & Support",
    links: [
      { label: "Privacy", href: "/privacy-policy" },
      { label: "Terms", href: "/terms-of-service" },
      { label: "SMS Opt-In", href: "/opt-in" },
      { label: "AI & Privacy", href: "/ai-privacy" },
      { label: "Contact", href: "/get-coverage" },
    ],
  },
];
