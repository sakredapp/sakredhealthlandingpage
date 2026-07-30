import { useParams, Link } from "wouter";
import { Check } from "lucide-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Reveal, StampHeading } from "@/components/motion";
import { getStateCopy } from "@/data/state-copy";
import { TextCta } from "@/components/TextCta";
import { ProductIntakeForm } from "@/components/ProductIntakeForm";
import { MortgageDemo, DemoDisclaimer } from "@/components/ProductDemos";
import { MortgageCalculator } from "@/components/landing/MortgageCalculator";
import { useSeo, SITE_URL } from "@/lib/seo";
import { getState } from "@/data/states";
import { getProduct } from "@/data/products";
import statsData from "@/data/state-stats.json";

const STATS = (statsData as { _meta: { source: string; year: number }; states: Record<string, StateStat> });

interface StateStat {
  name: string;
  medianHomeValue: number | null;
  medianOwnerCostWithMortgage: number | null;
  medianHouseholdIncome: number | null;
  homeownershipRate: number | null;
  medianAge: number | null;
}

const usd = (n: number | null) => (n == null ? "—" : `$${n.toLocaleString()}`);

export default function StateMortgageProtection() {
  const { state: slug = "" } = useParams<{ state: string }>();
  const state = getState(slug);
  const stat = state ? STATS.states[state.abbr] : undefined;
  const mp = getProduct("mortgage-protection");

  useSeo({
    title: state
      ? `Mortgage Protection in ${state.name} | Sakred Health`
      : "Mortgage protection by state | Sakred Health",
    description:
      state && stat
        ? `The median ${state.name} home is worth ${usd(stat.medianHomeValue)}, with owners paying about ${usd(stat.medianOwnerCostWithMortgage)}/mo on a mortgage. See how mortgage protection can pay off the balance so your family keeps the home — free quote, no obligation.`
        : "Mortgage protection insurance that pays off your home loan so your family keeps the house.",
    canonical: state ? `/mortgage-protection/${state.slug}` : "/products/mortgage-protection",
    noindex: !state,
    jsonLd:
      state && stat
        ? {
            "@context": "https://schema.org",
            "@type": "Service",
            name: `Mortgage Protection Insurance in ${state.name}`,
            serviceType: "Mortgage Protection Insurance",
            provider: { "@type": "InsuranceAgency", name: "Sakred Health", url: SITE_URL },
            areaServed: { "@type": "State", name: state.name },
            description: `Mortgage protection life insurance for ${state.name} homeowners, sized to a median home value of ${usd(stat.medianHomeValue)}.`,
            url: `${SITE_URL}/mortgage-protection/${state.slug}`,
          }
        : undefined,
  });

  if (!state || !stat || !mp) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navigation />
        <main className="pt-24 pb-20 px-4 text-center">
          <div className="max-w-lg mx-auto py-20">
            <h1 className="text-3xl font-display font-normal text-[#2C2C2C] mb-4">State not found</h1>
            <p className="text-[#2C2C2C]/60 mb-8">We couldn't find that state page.</p>
            <Button asChild className="rounded-full btn-gold-gradient text-[#2C2C2C] border border-[#C5A059]">
              <Link href="/products/mortgage-protection">Mortgage protection</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const copy = getStateCopy(state, stat, STATS.states);

  const tiles = [
    { label: "Median home value", value: usd(stat.medianHomeValue) },
    { label: "Median mortgage payment", value: stat.medianOwnerCostWithMortgage != null ? `${usd(stat.medianOwnerCostWithMortgage)}/mo` : "—" },
    { label: "Homeowners", value: stat.homeownershipRate != null ? `${stat.homeownershipRate}%` : "—" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navigation />
      <main className="pt-24">
        {/* Hero */}
        <section className="pb-10 lg:pb-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
              <div>
                <Reveal>
                  <p className="text-sm font-medium uppercase tracking-wider text-[#C5A059] mb-3">
                    Mortgage Protection · {state.name}
                  </p>
                </Reveal>
                <StampHeading
                  as="h1"
                  text={copy.headline.text}
                  accent={copy.headline.accent}
                  className="text-3xl sm:text-4xl lg:text-5xl font-display font-normal text-[#2C2C2C] mb-4 leading-tight"
                />
                <Reveal delay={0.12}>
                  <p className="text-lg text-[#2C2C2C]/70 leading-relaxed mb-6">{copy.intro}</p>
                </Reveal>
                <Reveal delay={0.18}>
                  <ul className="space-y-2.5 mb-8">
                    {copy.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-[#C5A059] to-[#EBD598] flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-white" />
                        </span>
                        <span className="text-sm text-[#2C2C2C]/75">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
                {/* Animated "what this coverage does" vignette */}
                <Reveal delay={0.2}>
                  <div className="mb-8">
                    <MortgageDemo />
                    <DemoDisclaimer />
                  </div>
                </Reveal>

                <Reveal delay={0.24}>
                  <TextCta keyword={mp.smsKeyword} state={state.abbr} />
                </Reveal>
              </div>

              {/* Form */}
              <Reveal delay={0.1} y={24}>
                <div
                  id="inquire"
                  className="scroll-mt-28 bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] lg:sticky lg:top-24">
                  <h2 className="font-display font-semibold text-xl text-[#2C2C2C] mb-1">
                    {copy.formHeading}
                  </h2>
                  <p className="text-sm text-[#2C2C2C]/55 mb-6">{copy.ctaNote}</p>
                  <ProductIntakeForm
                    product={mp.slug}
                    productTitle="Mortgage Protection"
                    amountLabel={mp.amountLabel}
                    defaultState={state.abbr}
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Real, cited stat tiles */}
        <section className="py-12 lg:py-16 bg-[#F6F4EF]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <StampHeading
              text={copy.numbersHeading.text}
              accent={copy.numbersHeading.accent}
              className="text-2xl sm:text-3xl font-display font-normal text-[#2C2C2C] mb-8 text-center"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {tiles.map((t, i) => (
                <Reveal key={t.label} delay={i * 0.08}>
                  <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 text-center">
                    <p className="font-display font-bold text-3xl text-[#C5A059] mb-1">{t.value}</p>
                    <p className="text-sm text-[#2C2C2C]/60">{t.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <p className="text-xs text-[#2C2C2C]/45 text-center mt-6">
              Source: {STATS._meta.source}.
            </p>
          </div>
        </section>

        {/* Tone- and state-specific closing section (varies per page to avoid duplicate copy) */}
        <section className="py-12 lg:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <StampHeading
              text={copy.whyHeading.text}
              accent={copy.whyHeading.accent}
              className="text-2xl sm:text-3xl font-display font-normal text-[#2C2C2C] mb-4"
            />
            <Reveal delay={0.12}>
              <p className="text-[#2C2C2C]/70 leading-relaxed max-w-2xl mx-auto">{copy.whyBody}</p>
            </Reveal>
          </div>
        </section>

        <MortgageCalculator ctaHref="#inquire" />
      </main>
      <Footer />
    </div>
  );
}
