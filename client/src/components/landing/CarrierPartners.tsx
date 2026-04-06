import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

interface PlanType {
  name: string;
  description: string;
}

interface Carrier {
  name: string;
  plans: string[];
  network?: string;
}

interface PlanCategory {
  category: string;
  description: string;
}

const carriers: Carrier[] = [
  {
    name: "Allstate Health",
    plans: [
      "Fixed Indemnity (Foundation Health, Access Plan, Health Expense Protection)",
      "Short-Term Medical (Standard STM, TrioMED, Renewable PPO STM)",
      "Dental PPO & Select Dental",
      "DVH — Dental, Vision & Hearing",
      "Supplemental (Accident, Cancer & Heart/Stroke, Critical Illness)",
      "Disability Income",
      "Senior Plans (Senior Indemnity, My Life Senior)",
      "Virtual Care Add-ons (Recuro Rx, Virtual Urgent Care, Behavioral Health)",
    ],
  },
  {
    name: "UnitedHealthcare (UHOne)",
    plans: [
      "Fixed Indemnity (Health ProtectorGuard, Guard Plan, Guard Plus)",
      "Hospital Indemnity (Hospital SafeGuard)",
    ],
  },
  {
    name: "Manhattan Life",
    plans: [
      "Accident Coverage (24 Hour Accident, Voluntary Group, Affordable Choice)",
      "Critical Illness (Critical Protection CPR, CP4000 CancerCare)",
      "Disability Income (Central Income Security DI, Group DI)",
      "Hospital Indemnity & Hospital Indemnity Select",
      "DVH — Dental, Vision & Hearing",
      "Short-Term Care",
    ],
    network: "First Health Network",
  },
  {
    name: "Enroll Prime",
    plans: [
      "Major Medical (Gold, Silver, Bronze tiers)",
      "Limited Medical (Ease, LITE, MEC Care, MedAccess/MVP)",
      "Dental & Vision (DVP plans at multiple benefit levels)",
      "Coverage tiers: Member, +Spouse, +Children, +Family",
    ],
  },
  {
    name: "IronE Health",
    plans: [
      "Major Medical (PSM Classic, PSM HSA, PSM Value, PSM BCBS, PSM Million)",
    ],
  },
  {
    name: "MedMax / MyFirstHealth / AHW",
    plans: ["Major Medical plans"],
    network: "First Health Network",
  },
  {
    name: "Elite Health / ACUSA",
    plans: ["Limited Medical / Fixed Benefit plans"],
    network: "First Health Network",
  },
  {
    name: "Cigna",
    plans: ["Major Medical", "PPO & HMO networks"],
  },
  {
    name: "Aetna",
    plans: ["Major Medical", "PPO network"],
  },
  {
    name: "Blue Cross Blue Shield (BCBS)",
    plans: ["Major Medical", "ACA / Marketplace plans", "PPO, HMO, EPO networks"],
  },
  {
    name: "Ambetter",
    plans: ["ACA / Marketplace plans"],
  },
  {
    name: "Oscar Health",
    plans: ["ACA / Marketplace plans"],
  },
  {
    name: "Humana",
    plans: ["Major Medical", "Medicare Advantage", "Supplemental"],
  },
  {
    name: "HealthSmart",
    plans: ["PPO network / Limited Medical plans"],
  },
  {
    name: "PHCS / Multiplan",
    plans: ["PPO network (used across multiple carriers)"],
  },
];

const planCategories: PlanCategory[] = [
  { category: "Major Medical", description: "Comprehensive health coverage (PPO, HMO, EPO)" },
  { category: "ACA / Marketplace", description: "Affordable Care Act compliant plans" },
  { category: "Limited Medical", description: "Budget-friendly plans with set benefit limits" },
  { category: "Fixed Indemnity", description: "Pays fixed dollar amounts per service or event" },
  { category: "Short-Term Medical", description: "Temporary coverage for gaps in insurance" },
  { category: "Hospital Indemnity", description: "Cash payouts for hospital stays" },
  { category: "Dental & Vision", description: "Standalone dental and vision coverage (PPO & Indemnity)" },
  { category: "DVH", description: "Bundled Dental, Vision & Hearing" },
  { category: "Supplemental", description: "Accident, Critical Illness, Cancer — pays on top of primary" },
  { category: "Disability Income", description: "Income replacement during disability" },
  { category: "Medicare", description: "Medicare Supplement & Medicare Advantage" },
  { category: "Group", description: "Employer-sponsored group coverage" },
];

export function CarrierPartners() {
  const [expandedCarriers, setExpandedCarriers] = useState<Record<number, boolean>>({});
  const [showAllCarriers, setShowAllCarriers] = useState(false);

  const toggleCarrier = (index: number) => {
    setExpandedCarriers((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const visibleCarriers = showAllCarriers ? carriers : carriers.slice(0, 6);

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
          <div className="w-12 h-1 bg-gradient-to-r from-[#C5A059] to-[#EBD598] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-display font-normal text-[#2C2C2C] mb-4">
            Our Carrier{" "}
            <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
              Partners
            </span>
          </h2>
          <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
            We work with top-rated insurance carriers so you can switch plans or carriers seamlessly — all while keeping the same dedicated agent and agency managing your healthcare.
          </p>
        </motion.div>

        {/* Carrier Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {visibleCarriers.map((carrier, index) => {
            const isExpanded = expandedCarriers[index];
            return (
              <motion.div
                key={carrier.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 overflow-visible h-full ${
                    isExpanded
                      ? "border-[#C5A059]/40 shadow-[0_0_15px_rgba(197,160,89,0.15)]"
                      : "border-[#E8E4DC]"
                  } hover-elevate`}
                  onClick={() => toggleCarrier(index)}
                >
                  <div className="flex items-center justify-between p-4 gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-semibold text-[#2C2C2C] text-sm sm:text-base">
                        {carrier.name}
                      </h4>
                      {carrier.network && (
                        <p className="text-xs text-[#C5A059] mt-0.5">{carrier.network}</p>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#C5A059] flex-shrink-0 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CardContent className="px-4 pb-4 pt-0">
                          <ul className="space-y-1.5">
                            {carrier.plans.map((plan, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#C5A059] to-[#EBD598] mt-1.5 flex-shrink-0" />
                                <span className="text-sm text-[#2C2C2C]/75 leading-relaxed">{plan}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {!showAllCarriers && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <button
              onClick={() => setShowAllCarriers(true)}
              className="text-sm font-medium text-[#C5A059] hover:text-[#B8903F] transition-colors underline underline-offset-4"
            >
              View all {carriers.length} carrier partners
            </button>
          </motion.div>
        )}

        {/* Plan Types Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12"
        >
          <h3 className="text-sm font-medium uppercase tracking-wider text-[#C5A059] mb-4 text-center">
            Plan Types We Offer
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {planCategories.map((plan, index) => (
              <motion.div
                key={plan.category}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <Card className="border-[#E8E4DC] p-3 h-full hover:border-[#C5A059]/30 transition-colors duration-200">
                  <h4 className="font-display font-semibold text-[#2C2C2C] text-xs sm:text-sm mb-1">
                    {plan.category}
                  </h4>
                  <p className="text-xs text-[#2C2C2C]/60 leading-snug">{plan.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
