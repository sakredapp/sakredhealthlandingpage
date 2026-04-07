import { motion } from "framer-motion";

interface PlanCategory {
  category: string;
  description: string;
}

const carriers = [
  "Allstate Health",
  "UnitedHealthcare",
  "Blue Cross Blue Shield",
  "Cigna",
  "Aetna",
  "Humana",
  "Manhattan Life",
  "Enroll Prime",
  "IronE Health",
  "Ambetter",
  "Oscar Health",
  "MedMax / AHW",
  "Elite Health / ACUSA",
  "HealthSmart",
  "PHCS / Multiplan",
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
  return (
    <section className="py-12 lg:py-20 bg-[#F9F9F7]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
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

        {/* Carrier Name Grid */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-8">
          {carriers.map((name, index) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
              className="rounded-lg border border-[#E8E4DC] bg-white px-4 py-2.5 text-center hover:border-[#C5A059]/40 hover:shadow-sm transition-all duration-200"
            >
              <p className="font-display font-semibold text-[#2C2C2C] text-xs sm:text-sm whitespace-nowrap">
                {name}
              </p>
            </motion.div>
          ))}
        </div>

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
