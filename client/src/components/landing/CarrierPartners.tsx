import { motion } from "framer-motion";

const networkStats = [
  { stat: "A-rated", label: "We work with financially strong, top-rated insurance partners" },
  { stat: "50 states", label: "Coverage options available across all U.S. states" },
  { stat: "1 agent", label: "One dedicated licensed agent across all your plans" },
  { stat: "Free", label: "No cost to work with us — we're paid when you're placed" },
];

const healthPlans = [
  { category: "Major Medical", description: "Comprehensive health coverage (PPO, HMO, EPO)" },
  { category: "ACA / Marketplace", description: "Affordable Care Act compliant plans" },
  { category: "Limited Medical", description: "Budget-friendly plans with set benefit limits" },
  { category: "Fixed Indemnity", description: "Pays fixed dollar amounts per service or event" },
  { category: "Short-Term Medical", description: "Temporary coverage for gaps in insurance" },
  { category: "Hospital Indemnity", description: "Cash payouts for hospital stays" },
  { category: "Dental & Vision", description: "Standalone dental (PPO & Indemnity) and vision" },
  { category: "DVH", description: "Bundled Dental, Vision & Hearing coverage" },
  { category: "Supplemental", description: "Accident, Critical Illness, Cancer — pays on top of primary" },
  { category: "Disability Income", description: "Income replacement during disability" },
  { category: "Medicare", description: "Medicare Supplement & Medicare Advantage" },
];

const lifeAndRetirement = [
  { category: "Term Life Insurance", description: "Affordable level coverage for 10, 20, or 30 years" },
  { category: "Whole Life Insurance", description: "Permanent coverage with guaranteed cash value growth" },
  { category: "Indexed Universal Life (IUL)", description: "Permanent life insurance with market-linked cash value" },
  { category: "Mortgage Protection (MPI)", description: "Term life insurance sized to pay off your mortgage — not a loan or lending product" },
  { category: "Final Expense", description: "Small whole life policies that cover funeral and end-of-life costs" },
  { category: "Annuities", description: "Guaranteed retirement income — fixed, indexed, and immediate options" },
];

export function CarrierPartners() {
  return (
    <section className="py-12 lg:py-20 bg-[#F9F9F7]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2C2C2C] mb-3">
            Our Network & Coverage
          </h2>
          <p className="text-[#2C2C2C]/60 text-base sm:text-lg max-w-2xl mx-auto">
            Your health is part of your life — so we make sure every box is checked, not just one. Health coverage, life insurance, and retirement income, all through one agency and one dedicated agent.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="bg-white rounded-2xl border border-[#E8E4DC] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-8 sm:p-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
            {/* Network Stats */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-[#C5A059] mb-6">
                Our Network
              </h3>
              <ul className="space-y-5">
                {networkStats.map((item) => (
                  <li key={item.stat} className="flex items-start gap-4">
                    <span className="font-display font-bold text-2xl text-[#C5A059] leading-none shrink-0 w-16">
                      {item.stat}
                    </span>
                    <span className="text-sm text-[#2C2C2C]/65 leading-snug pt-1">
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Plan Categories — Health + Life & Retirement */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-[#C5A059] mb-6">
                  Health Coverage
                </h3>
                <ul className="space-y-3">
                  {healthPlans.map((plan) => (
                    <li key={plan.category} className="flex items-start gap-2.5">
                      <span className="mt-2 w-1 h-1 rounded-full bg-[#2C2C2C]/40 shrink-0" />
                      <span className="text-sm sm:text-base">
                        <span className="font-display font-semibold text-[#2C2C2C]">{plan.category}</span>
                        <span className="text-[#2C2C2C]/50"> — {plan.description}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-[#C5A059] mb-6">
                  Life Insurance & Retirement
                </h3>
                <ul className="space-y-3">
                  {lifeAndRetirement.map((plan) => (
                    <li key={plan.category} className="flex items-start gap-2.5">
                      <span className="mt-2 w-1 h-1 rounded-full bg-[#2C2C2C]/40 shrink-0" />
                      <span className="text-sm sm:text-base">
                        <span className="font-display font-semibold text-[#2C2C2C]">{plan.category}</span>
                        <span className="text-[#2C2C2C]/50"> — {plan.description}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
