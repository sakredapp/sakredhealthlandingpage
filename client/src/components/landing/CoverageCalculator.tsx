import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { Reveal, StampHeading } from "@/components/motion";

/**
 * Interactive life-insurance coverage estimator. Sliders update the suggested
 * amount live. This is an *estimate* (a common income-replacement rule), never a
 * quote — real numbers come from underwriting. Kept compliance-safe in the copy.
 */
function suggestedCoverage(income: number, years: number, dependents: number): number {
  // Income replacement + a per-dependent buffer (education/care). Rounded to $25k.
  const raw = income * years + dependents * 100_000;
  return Math.round(raw / 25_000) * 25_000;
}

const SLIDER =
  "w-full h-2 rounded-full appearance-none cursor-pointer bg-[#EDE9E0] [accent-color:#C5A059]";

export function CoverageCalculator() {
  const [income, setIncome] = useState(85_000);
  const [years, setYears] = useState(20);
  const [dependents, setDependents] = useState(2);

  const coverage = suggestedCoverage(income, years, dependents);

  return (
    <section className="py-12 lg:py-20 bg-[#F6F4EF]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <StampHeading
            text="How much life insurance"
            accent="do you actually need?"
            className="text-3xl sm:text-4xl font-display font-normal text-[#2C2C2C] mb-4"
          />
          <Reveal delay={0.12}>
            <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
              Slide to see a ballpark based on replacing your income and protecting your
              dependents. It's a starting point — your agent builds the real number with you.
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
                    <label htmlFor="cc-income" className="text-sm font-medium text-[#2C2C2C]">
                      Annual income
                    </label>
                    <span className="font-display font-bold text-[#C5A059]">
                      ${income.toLocaleString()}
                    </span>
                  </div>
                  <input
                    id="cc-income"
                    type="range"
                    min={25_000}
                    max={500_000}
                    step={5_000}
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className={SLIDER}
                    aria-valuetext={`$${income.toLocaleString()} per year`}
                  />
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <label htmlFor="cc-years" className="text-sm font-medium text-[#2C2C2C]">
                      Years to replace
                    </label>
                    <span className="font-display font-bold text-[#C5A059]">{years} yrs</span>
                  </div>
                  <input
                    id="cc-years"
                    type="range"
                    min={5}
                    max={30}
                    step={1}
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className={SLIDER}
                    aria-valuetext={`${years} years`}
                  />
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <label htmlFor="cc-dependents" className="text-sm font-medium text-[#2C2C2C]">
                      Dependents
                    </label>
                    <span className="font-display font-bold text-[#C5A059]">{dependents}</span>
                  </div>
                  <input
                    id="cc-dependents"
                    type="range"
                    min={0}
                    max={6}
                    step={1}
                    value={dependents}
                    onChange={(e) => setDependents(Number(e.target.value))}
                    className={SLIDER}
                    aria-valuetext={`${dependents} dependents`}
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
                  A common income-replacement estimate — not a quote or an offer of coverage.
                </p>
                <Link href="/products">
                  <Button
                    size="lg"
                    className="rounded-full btn-gold-gradient text-[#2C2C2C] px-8 py-6 text-base font-normal shadow-lg shadow-[#C5A059]/20 hover:shadow-[#C5A059]/40 hover:-translate-y-0.5 transition-all border border-[#C5A059]"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Get a real quote
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
