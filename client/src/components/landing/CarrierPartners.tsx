import { useState } from "react";
import { motion } from "framer-motion";

interface Carrier {
  name: string;
  network?: string;
  highlight?: boolean;
}

interface PlanCategory {
  category: string;
  description: string;
}

const carriers: Carrier[] = [
  { name: "Allstate Health", highlight: true },
  { name: "UnitedHealthcare", highlight: true },
  { name: "Blue Cross Blue Shield", highlight: true },
  { name: "Cigna", highlight: true },
  { name: "Aetna", highlight: true },
  { name: "Humana", highlight: true },
  { name: "Manhattan Life", network: "First Health" },
  { name: "Enroll Prime" },
  { name: "IronE Health" },
  { name: "Ambetter" },
  { name: "Oscar Health" },
  { name: "MedMax / AHW", network: "First Health" },
  { name: "Elite Health / ACUSA", network: "First Health" },
  { name: "HealthSmart" },
  { name: "PHCS / Multiplan" },
];

const planCategories: PlanCategory[] = [
  { category: "Major Medical", description: "Comprehensive PPO, HMO, EPO" },
  { category: "ACA / Marketplace", description: "Affordable Care Act plans" },
  { category: "Limited Medical", description: "Budget-friendly set benefits" },
  { category: "Fixed Indemnity", description: "Fixed $ per service/event" },
  { category: "Short-Term Medical", description: "Temporary gap coverage" },
  { category: "Hospital Indemnity", description: "Cash for hospital stays" },
  { category: "Dental & Vision", description: "PPO & Indemnity options" },
  { category: "DVH Bundle", description: "Dental, Vision & Hearing" },
  { category: "Supplemental", description: "Accident, Cancer, Critical Illness" },
  { category: "Disability Income", description: "Income replacement" },
  { category: "Medicare", description: "Supplement & Advantage" },
  { category: "Group Plans", description: "Employer-sponsored coverage" },
];

export function CarrierPartners() {
  const [showAll, setShowAll] = useState(false);
  const visibleCarriers = showAll ? carriers : carriers.slice(0, 9);

  return (
    <section className="py-12 lg:py-20 bg-[#F9F9F7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="w-12 h-1 bg-gradient-to-r from-[#C5A059] to-[#EBD598] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-display font-normal text-[#2C2C2C] mb-4">
            Our Carrier{" "}
            <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
              Partners
            </span>
          </h2>
          <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
            Switch plans or carriers seamlessly — all while keeping the same dedicated agent and agency managing your healthcare.
          </p>
        </motion.div>

        {/* Carrier Name Grid — clean tiles, no dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          {visibleCarriers.map((carrier, index) => (
            <motion.div
              key={carrier.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className={`relative rounded-xl border px-4 py-4 text-center transition-all duration-200 hover:border-[#C5A059]/40 hover:shadow-sm ${
                carrier.highlight
                  ? "bg-white border-[#C5A059]/20 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
                  : "bg-white/60 border-[#E8E4DC]"
              }`}
            >
              <p className="font-display font-semibold text-[#2C2C2C] text-xs sm:text-sm leading-tight">
                {carrier.name}
              </p>
              {carrier.network && (
                <p className="text-[10px] text-[#C5A059] mt-1">{carrier.network}</p>
              )}
            </motion.div>
          ))}
        </div>

        {!showAll && (
          <div className="text-center mb-10">
            <button
              onClick={() => setShowAll(true)}
              className="text-sm font-medium text-[#C5A059] hover:text-[#B8903F] transition-colors underline underline-offset-4"
            >
              + {carriers.length - 9} more partners
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#E8E4DC] to-transparent my-10" />

        {/* Plan Types — horizontal pill/tag layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center"
        >
          <h3 className="text-sm font-medium uppercase tracking-wider text-[#C5A059] mb-6">
            Plan Types We Offer
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {planCategories.map((plan, index) => (
              <motion.div
                key={plan.category}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
                className="group relative"
              >
                <div className="rounded-full border border-[#E8E4DC] bg-white px-4 py-2 hover:border-[#C5A059]/40 hover:shadow-sm transition-all duration-200 cursor-default">
                  <span className="font-display font-semibold text-[#2C2C2C] text-xs sm:text-sm">
                    {plan.category}
                  </span>
                </div>
                {/* Tooltip on hover */}
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#2C2C2C] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  {plan.description}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-[#2C2C2C] rotate-45" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
