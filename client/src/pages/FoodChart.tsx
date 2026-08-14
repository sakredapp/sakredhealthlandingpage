/**
 * /food-chart — rebuilt as an interactive reference.
 *
 * The data is untouched: 197 foods across the same categories, still living in
 * `data/food-chart.ts` so the prerenderer and the page render from one source.
 * What changed is that it's now a tool rather than a long page — search,
 * category and scale filters, a legend that stays with you, and cards that
 * work on a phone.
 *
 * Two deliberate choices:
 *
 *   · The scale is muted sage → gold → clay, not green → amber → red. Both
 *     ends belong in a balanced diet, and a red chip next to "cranberry" reads
 *     as a prohibition rather than a rating.
 *   · The bottom CTA is "explore more resources", not "start a detox
 *     protocol". Detox is no longer what this site is for (brief §18).
 *
 * The skippable email gate is preserved — it is a working lead capture and
 * removing it wasn't asked for. It can always be skipped, and the skip is
 * remembered.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Mail, Search, X } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal, StampHeading } from "@/components/motion";
import {
  LEVEL_ORDER,
  foodData,
  levelConfig,
  type PHLevel,
} from "@/data/food-chart";
import { useSeo, SITE_URL } from "@/lib/seo";

const STORAGE_KEY = "sakred_food_chart_subscribed";
const TOTAL_FOODS = foodData.reduce((n, category) => n + category.items.length, 0);

/* ------------------------------------------------------------------ *
 * Scale pieces
 * ------------------------------------------------------------------ */

/** The seven-segment indicator. One segment lit, the rest faint. */
function ScaleMark({ level }: { level: PHLevel }) {
  const active = levelConfig[level].position;
  return (
    <span className="flex shrink-0 gap-[2px]" aria-hidden="true">
      {LEVEL_ORDER.map((step, index) => (
        <span
          key={step}
          className="block h-3.5 w-[3px] rounded-full"
          style={{
            backgroundColor: levelConfig[step].color,
            opacity: index + 1 === active ? 1 : 0.22,
          }}
        />
      ))}
    </span>
  );
}

function LevelPill({ level, short = false }: { level: PHLevel; short?: boolean }) {
  const config = levelConfig[level];
  return (
    <span
      className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: config.bgColor, color: config.color }}
    >
      {short ? config.short : config.label}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Email gate
 * ------------------------------------------------------------------ */

function EmailGate({
  onSubscribe,
  onSkip,
}: {
  onSubscribe: (email: string) => void;
  onSkip: () => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-sakred-espresso/45 backdrop-blur-sm"
        onClick={onSkip}
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="food-gate-title"
        className="relative w-full max-w-md rounded-3xl border border-sakred-stone bg-sakred-surface p-7 shadow-[0_40px_80px_-40px_rgba(28,26,23,0.6)]"
      >
        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-sakred-gold/40 bg-sakred-gold/10">
          <Mail className="h-5 w-5 text-sakred-gold-deep" aria-hidden="true" />
        </span>
        <h2 id="food-gate-title" className="font-display text-2xl text-sakred-espresso">
          The full chart, free
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-sakred-ink/65">
          All {TOTAL_FOODS} foods, rated. Leave an email and we&rsquo;ll send the
          occasional cited piece worth reading — or skip and read it now.
        </p>

        <form
          className="mt-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!email.includes("@")) {
              setError("Please enter a valid email address.");
              return;
            }
            onSubscribe(email);
          }}
        >
          <label className="sr-only" htmlFor="food-gate-email">
            Email address
          </label>
          <input
            id="food-gate-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-sakred-stone bg-sakred-canvas px-4 py-3 text-sm text-sakred-espresso outline-none focus:border-sakred-gold"
          />
          {error && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="mt-3 w-full rounded-full border border-sakred-gold bg-gradient-to-r from-sakred-gold via-sakred-gold-light to-sakred-gold px-6 py-3 text-sm font-medium text-sakred-espresso"
          >
            Show me the chart
          </button>
        </form>

        <button
          type="button"
          onClick={onSkip}
          className="mt-3 w-full text-center text-xs text-sakred-ink/50 hover:text-sakred-espresso"
        >
          No thanks, just show the chart
        </button>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

export default function FoodChart() {
  const [gateOpen, setGateOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [levels, setLevels] = useState<PHLevel[]>([]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useSeo({
    title: `Anti-Inflammatory Food Chart — ${TOTAL_FOODS} Foods Rated`,
    description: `${TOTAL_FOODS} everyday foods rated from strongly anti-inflammatory to highly inflammatory, across fruits, vegetables, grains, proteins, fats and seasonings. Search, filter and compare.`,
    canonical: "/food-chart",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: "Sakred Health Anti-Inflammatory Food Chart",
      description: `${TOTAL_FOODS} foods rated on a seven-point inflammation scale.`,
      url: `${SITE_URL}/food-chart`,
      creator: { "@type": "Organization", name: "Sakred Health", url: SITE_URL },
      variableMeasured: "Inflammation rating",
      keywords: foodData.map((c) => c.category).join(", "),
    },
  });

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== "true") setGateOpen(true);
  }, []);

  const dismissGate = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setGateOpen(false);
  };

  const subscribe = async (email: string) => {
    try {
      await fetch("/api/email-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "food_chart" }),
      });
    } catch (error) {
      // A failed signup must never cost the visitor the chart they came for.
      console.error("[food-chart] email signup failed:", error);
    }
    dismissGate();
  };

  /* ---- filtering ---- */
  const filtered = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return foodData
      .filter((group) => !category || group.category === category)
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            (!needle || item.name.toLowerCase().includes(needle)) &&
            (levels.length === 0 || levels.includes(item.level))
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [term, category, levels]);

  const matchCount = filtered.reduce((n, group) => n + group.items.length, 0);
  const filtering = Boolean(term.trim()) || category !== null || levels.length > 0;

  const toggleLevel = (level: PHLevel) =>
    setLevels((current) =>
      current.includes(level) ? current.filter((l) => l !== level) : [...current, level]
    );

  const toggleCollapsed = (name: string) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const clearAll = () => {
    setTerm("");
    setCategory(null);
    setLevels([]);
  };

  return (
    <SiteLayout solidHeader>
      <AnimatePresence>
        {gateOpen && <EmailGate onSubscribe={subscribe} onSkip={dismissGate} />}
      </AnimatePresence>

      {/* ---- header ---- */}
      <header className="surface-atlas border-b border-sakred-stone">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-sakred-gold-deep">
            Reference
          </p>
          <StampHeading
            as="h1"
            text="Anti-Inflammatory"
            accent="Food Chart"
            className="font-display text-3xl leading-tight tracking-tight text-sakred-espresso sm:text-4xl lg:text-5xl"
          />
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-sakred-ink/70">
            {TOTAL_FOODS} everyday foods on a seven-point scale, from strongly
            anti-inflammatory to highly inflammatory. Chronic inflammation is a shared
            driver across metabolic, cardiovascular and digestive conditions, and diet
            is one of the few inputs you control daily.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sakred-ink/55">
            Both ends of this scale have a place in a balanced diet. Awareness is the
            goal, not restriction.
          </p>
        </div>
      </header>

      {/* ---- sticky controls + legend ---- *
       * Sticks under the fixed header so the scale is always readable while
       * scrolling a list of 197 rows. Without it you lose the meaning of the
       * colours about four categories down. */}
      <div className="sticky top-16 z-30 border-b border-sakred-stone bg-sakred-surface/95 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 rounded-full border border-sakred-stone bg-sakred-canvas px-4 focus-within:border-sakred-gold/70">
            <Search className="h-4 w-4 shrink-0 text-sakred-ink/40" aria-hidden="true" />
            <label className="sr-only" htmlFor="food-search">
              Search foods
            </label>
            <input
              id="food-search"
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search a food…"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-sakred-espresso outline-none placeholder:text-sakred-ink/40"
            />
            {term && (
              <button type="button" onClick={() => setTerm("")} aria-label="Clear search">
                <X className="h-4 w-4 text-sakred-ink/40 hover:text-sakred-espresso" />
              </button>
            )}
          </div>

          {/* scale filter — doubles as the legend */}
          <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1">
            {LEVEL_ORDER.map((level) => {
              const config = levelConfig[level];
              const active = levels.includes(level);
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => toggleLevel(level)}
                  aria-pressed={active}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors duration-micro ${
                    active ? "border-sakred-espresso/40" : "border-transparent"
                  }`}
                  style={{ backgroundColor: config.bgColor, color: config.color }}
                >
                  {active && <Check className="h-3 w-3" aria-hidden="true" />}
                  {config.short}
                </button>
              );
            })}
          </div>

          {/* category filter */}
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setCategory(null)}
              aria-pressed={category === null}
              className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors duration-micro ${
                category === null
                  ? "border-sakred-gold bg-sakred-gold/15 text-sakred-gold-deep"
                  : "border-sakred-stone bg-sakred-surface text-sakred-ink/65"
              }`}
            >
              All categories
            </button>
            {foodData.map((group) => (
              <button
                key={group.category}
                type="button"
                onClick={() => setCategory(group.category)}
                aria-pressed={category === group.category}
                className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors duration-micro ${
                  category === group.category
                    ? "border-sakred-gold bg-sakred-gold/15 text-sakred-gold-deep"
                    : "border-sakred-stone bg-sakred-surface text-sakred-ink/65"
                }`}
              >
                {group.category}
              </button>
            ))}
          </div>

          {filtering && (
            <div className="mt-2 flex items-center justify-between text-xs text-sakred-ink/55">
              <span aria-live="polite">
                {matchCount} of {TOTAL_FOODS} foods
              </span>
              <button
                type="button"
                onClick={clearAll}
                className="font-medium text-sakred-gold-deep hover:text-sakred-espresso"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---- the chart ---- */}
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-sakred-stone bg-sakred-surface p-10 text-center">
            <p className="font-display text-xl text-sakred-espresso">
              No foods match that.
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-4 rounded-full border border-sakred-stone bg-sakred-surface px-5 py-2.5 text-sm font-medium text-sakred-espresso lift-card"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((group) => {
              const isCollapsed = collapsed.has(group.category);
              const sorted = [...group.items].sort((a, b) => b.level - a.level);

              return (
                <section
                  key={group.category}
                  className="overflow-hidden rounded-2xl border border-sakred-stone bg-sakred-surface"
                >
                  <button
                    type="button"
                    onClick={() => toggleCollapsed(group.category)}
                    aria-expanded={!isCollapsed}
                    className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors duration-micro hover:bg-sakred-surface-alt"
                  >
                    <span>
                      <span className="block font-display text-xl text-sakred-espresso">
                        {group.category}
                      </span>
                      <span className="mt-0.5 block text-sm leading-snug text-sakred-ink/55">
                        {group.description}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 pt-1">
                      <span className="text-xs text-sakred-ink/45">{sorted.length}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-sakred-ink/45 transition-transform duration-card ${
                          isCollapsed ? "" : "rotate-180"
                        }`}
                        aria-hidden="true"
                      />
                    </span>
                  </button>

                  {!isCollapsed && (
                    <ul className="divide-y divide-sakred-stone/50 border-t border-sakred-stone/60">
                      {sorted.map((item) => (
                        <li
                          key={item.name}
                          className="flex items-center justify-between gap-3 px-5 py-2.5 transition-colors duration-micro hover:bg-sakred-surface-alt"
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <ScaleMark level={item.level} />
                            <span className="truncate text-sm text-sakred-espresso">
                              {item.name}
                            </span>
                          </span>
                          <LevelPill level={item.level} short />
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {/* ---- CTA. Not "start a detox protocol". ---- */}
        <Reveal className="mt-12">
          <div className="rounded-3xl border border-sakred-stone bg-sakred-surface-alt p-8 sm:p-10">
            <h2 className="font-display text-2xl leading-tight text-sakred-espresso">
              Explore more health resources
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-sakred-ink/65">
              The chart is one reference. The library has the cited long-form writing
              behind it, and the network has the practitioners who can tell you which
              parts of it matter for you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/resources"
                className="rounded-full border border-sakred-gold bg-gradient-to-r from-sakred-gold via-sakred-gold-light to-sakred-gold px-5 py-2.5 text-sm font-medium text-sakred-espresso"
              >
                All resources
              </Link>
              <Link
                href="/discover"
                className="rounded-full border border-sakred-stone bg-sakred-surface px-5 py-2.5 text-sm font-medium text-sakred-espresso lift-card"
              >
                Find a practitioner
              </Link>
              <Link
                href="/blog"
                className="rounded-full border border-sakred-stone bg-sakred-surface px-5 py-2.5 text-sm font-medium text-sakred-espresso lift-card"
              >
                Read the research
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </SiteLayout>
  );
}
