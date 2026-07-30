import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Reveal, StampHeading } from "@/components/motion";

/**
 * Interactive mortgage-protection estimator: remaining balance + monthly
 * payment + months of extra cushion → suggested coverage, live. Always an
 * *estimate*, never a quote — kept compliance-safe in the copy.
 */
function suggested(balance: number, monthly: number, cushionMonths: number): number {
  return Math.round((balance + monthly * cushionMonths) / 25_000) * 25_000;
}

const SLIDER =
  "w-full h-2 rounded-full appearance-none cursor-pointer bg-[#EDE9E0] [accent-color:#C5A059]";

export function MortgageCalculator({ ctaHref = "#inquire" }: { ctaHref?: string }) {
  const [balance, setBalance] = useState(280_000);
  const [monthly, setMonthly] = useState(2_000);
  const [cushion, setCushion] = useState(12);

  const coverage = suggested(balance, monthly, cushion);

  return (
    <section className="py-12 lg:py-20 bg-[#F6F4EF]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <StampHeading
            text="How much mortgage protection"
            accent="do you actually need?"
            className="text-3xl sm:text-4xl font-display font-normal text-[#2C2C2C] mb-4"
          />
          <Reveal delay={0.12}>
            <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
              Slide to a ballpark based on what's left on your loan, plus a cushion of covered
              payments. It's a starting point — your agent builds the real number with you.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-8 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
              {/* Controls */}
              <div className="space-y-7">
                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <label htmlFor="mc-balance" className="text-sm font-medium text-[#2C2C2C]">
                      Remaining mortgage balance
                    </label>
                    <span className="font-display font-bold text-[#C5A059]">
                      ${balance.toLocaleString()}
                    </span>
                  </div>
                  <input
                    id="mc-balance"
                    type="range"
                    min={50_000}
                    max={1_000_000}
                    step={10_000}
                    value={balance}
                    onChange={(e) => setBalance(Number(e.target.value))}
                    className={SLIDER}
                    aria-valuetext={`$${balance.toLocaleString()} remaining`}
                  />
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <label htmlFor="mc-monthly" className="text-sm font-medium text-[#2C2C2C]">
                      Monthly payment
                    </label>
                    <span className="font-display font-bold text-[#C5A059]">
                      ${monthly.toLocaleString()}/mo
                    </span>
                  </div>
                  <input
                    id="mc-monthly"
                    type="range"
                    min={800}
                    max={6_000}
                    step={100}
                    value={monthly}
                    onChange={(e) => setMonthly(Number(e.target.value))}
                    className={SLIDER}
                    aria-valuetext={`$${monthly.toLocaleString()} per month`}
                  />
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <label htmlFor="mc-cushion" className="text-sm font-medium text-[#2C2C2C]">
                      Extra cushion of covered payments
                    </label>
                    <span className="font-display font-bold text-[#C5A059]">{cushion} mo</span>
                  </div>
                  <input
                    id="mc-cushion"
                    type="range"
                    min={0}
                    max={24}
                    step={1}
                    value={cushion}
                    onChange={(e) => setCushion(Number(e.target.value))}
                    className={SLIDER}
                    aria-valuetext={`${cushion} months of cushion`}
                  />
                </div>
              </div>

              {/* Result */}
              <div className="text-center md:text-left md:border-l md:border-[#E8E4DC] md:pl-12">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C5A059] mb-3">
                  Suggested coverage
                </p>
                <p
                  className="font-display font-bold text-4xl sm:text-5xl text-[#2C2C2C] mb-2 tabular-nums"
                  aria-live="polite"
                >
                  ${coverage.toLocaleString()}
                </p>
                <p className="text-sm text-[#2C2C2C]/55 mb-6">
                  A payoff-plus-cushion estimate — not a quote or an offer of coverage.
                </p>
                <a href={ctaHref}>
                  <Button
                    size="lg"
                    className="rounded-full btn-gold-gradient text-[#2C2C2C] px-8 py-6 text-base font-normal shadow-lg shadow-[#C5A059]/20 hover:shadow-[#C5A059]/40 hover:-translate-y-0.5 transition-all border border-[#C5A059]"
                  >
                    Get a real quote
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
