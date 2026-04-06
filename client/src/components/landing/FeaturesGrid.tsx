import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

interface FeatureItem {
  title: string;
  bullets: string[];
  benefit: string;
}

interface FeatureCategory {
  category: string;
  features: FeatureItem[];
}

const featureCategories: FeatureCategory[] = [
  {
    category: "Healthcare Portal",
    features: [
      {
        title: "Your Insurance, Simplified",
        bullets: [
          "Active policies, premiums, deductibles, copays, and Rx tiers — all on one screen",
          "Direct portal links to your carrier's website from your dashboard",
        ],
        benefit: "Your full benefits summary on one screen.",
      },
      {
        title: "Search Your Policy",
        bullets: [
          "Ask plain-language questions and get highlighted answers from your actual plan documents",
          "No more digging through 80-page PDFs",
        ],
        benefit: "Understand your coverage in seconds, not hours.",
      },
      {
        title: "Secure Document Vault",
        bullets: [
          "Policy documents, ID cards, EOBs, and claim letters — encrypted and always accessible",
          "Organized, searchable, and shareable without calling your carrier",
        ],
        benefit: "Your insurance paperwork — encrypted and always in your pocket.",
      },
      {
        title: "Talk to Your Agent & AI Assistant",
        bullets: [
          "HIPAA-compliant messaging with your dedicated agent — categorized by topic",
          "Hathr AI delivers instant answers from your plan data, with one-tap human escalation",
          "Submit support tickets, book callbacks, and track every request",
        ],
        benefit: "Real human support + instant AI answers — always in your pocket.",
      },
    ],
  },
  {
    category: "Preventative Wellness",
    features: [
      {
        title: "Guided Routines & Habit Tracking",
        bullets: [
          "7-30 day reset programs for gut health, sleep, energy, detox, and more",
          "Daily habit tracking with streaks, science-backed explanations, and progress journeys",
          "Searchable habits encyclopedia — build your own custom wellness protocol",
        ],
        benefit: "A wellness coach in your pocket — day-by-day plans for any health goal.",
      },
      {
        title: "Wearable Integrations",
        bullets: [
          "Sync Fitbit, WHOOP, Oura Ring, Garmin, and Apple Health",
          "Real-time health data from devices you already wear — all in one place",
        ],
        benefit: "Your health data unified, not scattered.",
      },
    ],
  },
  {
    category: "Long-Term Planning",
    features: [
      {
        title: "Life Policies & Estate Planning",
        bullets: [
          "Manage chronic condition life policies, retirement annuities, and estate documents",
          "Your dedicated agent supports both healthcare and long-term financial planning",
        ],
        benefit: "Your healthcare and financial future — finally in the same place.",
      },
    ],
  },
];

export function FeaturesGrid() {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section id="features" className="py-12 lg:py-20 bg-[#F9F9F7]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="w-12 h-1 bg-gradient-to-r from-[#C5A059] to-[#EBD598] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-display font-normal text-[#2C2C2C] mb-4">
            Everything You Need,{" "}
            <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
              One App
            </span>
          </h2>
          <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
            A HIPAA-compliant healthcare portal, preventative wellness platform, and long-term planning ecosystem — all designed to work together
          </p>
        </motion.div>

        <div className="space-y-8">
          {featureCategories.map((cat) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-sm font-medium uppercase tracking-wider text-[#C5A059] mb-3">{cat.category}</h3>
              <div className="space-y-3">
                {cat.features.map((feature) => {
                  const key = `${cat.category}-${feature.title}`;
                  const isExpanded = expandedItems[key];
                  return (
                    <Card
                      key={feature.title}
                      className={`cursor-pointer transition-all duration-300 overflow-visible ${
                        isExpanded
                          ? "border-[#C5A059]/40 shadow-[0_0_15px_rgba(197,160,89,0.15)]"
                          : "border-[#E8E4DC]"
                      } hover-elevate`}
                      onClick={() => toggleItem(key)}
                      data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s/g, '-')}`}
                    >
                      <div className="flex items-center justify-between p-5">
                        <h4 className="font-display font-semibold text-[#2C2C2C] text-sm sm:text-base" data-testid={`text-feature-title-${feature.title.toLowerCase().replace(/\s/g, '-')}`}>
                          {feature.title}
                        </h4>
                        <ChevronDown
                          className={`w-4 h-4 text-[#C5A059] flex-shrink-0 ml-4 transition-transform duration-200 ${
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
                            <CardContent className="px-5 pb-5 pt-0">
                              <ul className="space-y-2 mb-4">
                                {feature.bullets.map((bullet, i) => (
                                  <li key={i} className="flex items-start gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#C5A059] to-[#EBD598] mt-2 flex-shrink-0" />
                                    <span className="text-sm text-[#2C2C2C]/75 leading-relaxed">{bullet}</span>
                                  </li>
                                ))}
                              </ul>
                              <div className="pt-3 border-t border-[#C5A059]/10">
                                <p className="text-sm font-medium text-[#C5A059] italic" data-testid={`text-feature-benefit-${feature.title.toLowerCase().replace(/\s/g, '-')}`}>
                                  {feature.benefit}
                                </p>
                              </div>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
