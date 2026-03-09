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
          "Full visibility into active policies, carrier details, premiums, deductibles, and copays",
          "Direct portal links to your carrier's website from one dashboard",
          "Coinsurance percentages, Rx tier pricing, and network type at a glance",
          "All pulled directly from your plan — no manual entry",
        ],
        benefit: "Your full benefits summary on one screen.",
      },
      {
        title: "Search Your Policy",
        bullets: [
          "Full-text search across all your uploaded policy documents",
          "Ask plain-language questions like \"what's my deductible for specialist visits\"",
          "Get highlighted answers pulled directly from your plan documents with page references",
          "No more digging through 80-page PDFs",
        ],
        benefit: "Understand your coverage in seconds, not hours.",
      },
      {
        title: "Secure Document Vault",
        bullets: [
          "Access uploaded policy documents, ID cards, EOBs, and claim letters anytime",
          "Encrypted storage with signed download links",
          "View and share PDFs without calling your carrier",
          "Everything organized and searchable",
        ],
        benefit: "Your insurance paperwork — encrypted and always in your pocket.",
      },
      {
        title: "Talk to Your Agent",
        bullets: [
          "Message your dedicated healthcare agent directly inside the app",
          "HIPAA-compliant, encrypted, and real-time messaging",
          "Categorize messages by topic: claims, billing, coverage, referrals",
          "Request callbacks at your preferred time and track read receipts",
        ],
        benefit: "Real human support from someone who knows your situation.",
      },
      {
        title: "Hathr AI Assistant",
        bullets: [
          "Get instant answers to policy and coverage questions from our AI assistant",
          "Searches your actual plan data and returns personalized answers",
          "If it can't help, one tap escalates to your human agent",
          "Available 24/7 for quick coverage questions",
        ],
        benefit: "Instant, personalized answers — with a human fallback.",
      },
      {
        title: "Support Requests & Callbacks",
        bullets: [
          "Submit tickets by category: Claims, Coverage, Billing, Provider Search",
          "Book a callback with up to 3 preferred time slots",
          "Your agent's contact info always on-screen",
          "Full history of every request and resolution",
        ],
        benefit: "Get answers without the runaround.",
      },
    ],
  },
  {
    category: "Preventative Wellness",
    features: [
      {
        title: "Guided Reset Routines (7-30 Day Programs)",
        bullets: [
          "Multi-day programs built around functional wellness — gut health, sleep optimization, energy recovery, detox & drainage, nervous system support, and more",
          "Choose Lite (15-20 min/day) or Intensive (45-60 min/day) based on your pace",
          "Each routine includes science-backed daily habits, progress tracking, and recommended supplies",
          "One tap enrolls you and auto-generates your daily habits for the full program",
        ],
        benefit: "Like having a wellness coach hand you a day-by-day plan for any health goal.",
      },
      {
        title: "Daily Habit Tracking",
        bullets: [
          "Check off habits each day with instant visual feedback on your journey path",
          "14-day timeline showing momentum, streaks, and completion at a glance",
          "Every habit includes \"Why It Matters,\" the science behind it, and practical tips",
          "Cadence badges (daily, weekly, one-time) keep you on track",
        ],
        benefit: "Abstract wellness goals become concrete daily actions.",
      },
      {
        title: "Habits Encyclopedia",
        bullets: [
          "Full searchable library of wellness practices across sleep, gut, mental clarity, stress, energy, and hydration",
          "Browse by keyword or category with full science-backed explanations",
          "Add any habit to your day individually, or enroll in the full routine it belongs to",
          "Build your own custom daily wellness protocol",
        ],
        benefit: "Pick and choose practices that fit your life.",
      },
    ],
  },
  {
    category: "Wearable Integrations",
    features: [
      {
        title: "Connect Your Devices",
        bullets: [
          "Fitbit — steps, heart rate, sleep, active minutes, calories",
          "WHOOP — recovery score, strain, HRV tracking",
          "Oura Ring — sleep quality, readiness, activity, heart rate",
          "Garmin — VO2 Max, Body Battery, stress, sleep",
          "Apple Health — steps, heart rate, sleep, workouts (iOS)",
        ],
        benefit: "Real-time health data from devices you already wear — all in one place.",
      },
    ],
  },
  {
    category: "Long-Term Planning",
    features: [
      {
        title: "Chronic Condition & Life Policies",
        bullets: [
          "Access and manage life insurance policies designed for chronic conditions",
          "View policy details, premiums, and coverage terms in plain language",
          "Dedicated agent support for policy questions and claims",
          "Everything organized alongside your health coverage",
        ],
        benefit: "Coverage for your future, managed alongside your health.",
      },
      {
        title: "Estate Planning & Retirement Annuities",
        bullets: [
          "Estate planning resources and document access in one secure vault",
          "Retirement annuity details, payout schedules, and carrier info",
          "Work with your dedicated agent on long-term financial planning",
          "Your healthcare and financial future — finally in the same place",
        ],
        benefit: "Plan for the long term without juggling separate advisors.",
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
