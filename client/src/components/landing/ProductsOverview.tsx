import { Link } from "wouter";
import { ArrowRight, Home, HeartHandshake, Umbrella, Stethoscope, TrendingUp } from "lucide-react";
import { Reveal, StampHeading, GlowCard, stagger } from "@/components/motion";
import { PRODUCTS } from "@/data/products";

/**
 * All five products introduced in one compact, dynamic section — the home page's
 * answer to "what do you actually do?" Each card links deeper to its own page.
 *
 * Layout note: a plain 3-column grid leaves an awkward hole on the last row with
 * five items. Instead we run a 6-column grid on desktop: the two highest-volume
 * products (mortgage protection, health) span 3 columns as featured cards, and
 * the remaining three span 2 each — two full, balanced rows with no dead space.
 */
const ICONS: Record<string, React.ReactNode> = {
  "mortgage-protection": <Home className="w-6 h-6" />,
  "health-insurance": <Stethoscope className="w-6 h-6" />,
  "final-expense": <HeartHandshake className="w-6 h-6" />,
  "life-insurance": <Umbrella className="w-6 h-6" />,
  "retirement-annuities": <TrendingUp className="w-6 h-6" />,
};

const FEATURED = ["mortgage-protection", "health-insurance"];

export function ProductsOverview() {
  const featured = FEATURED.map((s) => PRODUCTS.find((p) => p.slug === s)).filter(
    (p): p is (typeof PRODUCTS)[number] => !!p,
  );
  const rest = PRODUCTS.filter((p) => !FEATURED.includes(p.slug));

  return (
    <section id="products" className="py-12 lg:py-20 bg-[#F9F9F7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-wider text-[#C5A059] mb-3">
              What We Protect
            </p>
          </Reveal>
          <StampHeading
            text="Your home, your health,"
            accent="your family's future"
            className="text-3xl sm:text-4xl font-display font-normal text-[#2C2C2C] mb-4"
          />
          <Reveal delay={0.12}>
            <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
              Most agencies sell you one policy and disappear. We cover the whole picture —
              mortgage protection, life, health, and retirement — with one licensed agent who knows
              all of it.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
          {/* Featured: the two we write most */}
          {featured.map((p, i) => (
            <Reveal key={p.slug} delay={stagger(i)} className="lg:col-span-3">
              <Link href={`/products/${p.slug}`} className="block h-full">
                <GlowCard className="group h-full bg-white rounded-2xl border border-[#E8E4DC] p-7 hover:border-[#C5A059]/50 hover:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C5A059]/15 to-[#EBD598]/15 flex items-center justify-center text-[#C5A059] group-hover:from-[#C5A059]/25 group-hover:to-[#EBD598]/25 transition-colors duration-300">
                      {ICONS[p.slug]}
                    </div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-[#C5A059]/70 border border-[#C5A059]/25 rounded-full px-2.5 py-1">
                      {p.pillar}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-[#2C2C2C] text-xl mb-1.5">
                    {p.title}
                  </h3>
                  <p className="text-base text-[#2C2C2C]/75 mb-2">{p.tagline}</p>
                  <p className="text-sm text-[#2C2C2C]/60 leading-relaxed flex-1">{p.blurb}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#2C2C2C] group-hover:gap-2.5 transition-all">
                    Learn about {p.title}
                    <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                  </span>
                </GlowCard>
              </Link>
            </Reveal>
          ))}

          {/* The rest */}
          {rest.map((p, i) => (
            <Reveal key={p.slug} delay={stagger(i + 2)} className="lg:col-span-2">
              <Link href={`/products/${p.slug}`} className="block h-full">
                <GlowCard className="group h-full bg-white rounded-2xl border border-[#E8E4DC] p-6 hover:border-[#C5A059]/50 hover:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C5A059]/10 to-[#EBD598]/10 flex items-center justify-center text-[#C5A059] mb-4 group-hover:from-[#C5A059]/20 group-hover:to-[#EBD598]/20 transition-colors duration-300">
                    {ICONS[p.slug]}
                  </div>
                  <h3 className="font-display font-semibold text-[#2C2C2C] text-base mb-1">
                    {p.title}
                  </h3>
                  <p className="text-sm text-[#C5A059] mb-2">{p.tagline}</p>
                  <p className="text-sm text-[#2C2C2C]/60 leading-relaxed flex-1">{p.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#2C2C2C] group-hover:gap-2.5 transition-all">
                    Learn more
                    <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                  </span>
                </GlowCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
