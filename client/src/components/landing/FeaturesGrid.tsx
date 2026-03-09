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
        title: "Policy Search",
        bullets: [
          "Search your entire policy document in plain language",
          "No more digging through 80-page PDFs",
          "Type a question like \"what's my copay for a specialist\" and get highlighted excerpts ranked by relevance",
          "Results pulled directly from your actual policy document",
        ],
        benefit: "Understand your coverage in seconds, not hours.",
      },
      {
        title: "Coverage Overview",
        bullets: [
          "See your deductible, copays, out-of-pocket max, and network type at a glance",
          "PCP, specialist, urgent care, and ER copays broken down clearly",
          "Coinsurance percentages and Rx tier pricing",
          "All pulled directly from your plan — no manual entry",
        ],
        benefit: "Your full benefits summary on one screen.",
      },
      {
        title: "Document Access",
        bullets: [
          "Download your policy documents anytime, right from the app",
          "Access ID cards, EOBs, claims, and letters in-app",
          "View and share PDFs without calling your carrier",
          "Everything organized and searchable",
        ],
        benefit: "Your insurance paperwork, always in your pocket.",
      },
      {
        title: "Dedicated Agent",
        bullets: [
          "Assigned benefits specialist who already knows your plan",
          "One-tap call or callback request",
          "Select up to 3 preferred callback time slots",
          "Add notes so your agent comes prepared",
        ],
        benefit: "Real human support from someone who knows your situation.",
      },
      {
        title: "Support Requests",
        bullets: [
          "Submit questions by category: Claims, Coverage, Billing, Provider Search",
          "Track status from submission through resolution",
          "No more sitting on hold or repeating your story",
          "Full history of every request and response",
        ],
        benefit: "Get answers without the runaround.",
      },
    ],
  },
  {
    category: "Preventative Wellness",
    features: [
      {
        title: "Personalized Daily Dashboard",
        bullets: [
          "Time-of-day-aware home screen that greets you by name",
          "14-day animated journey path tracking your progress",
          "Active routine progress, streak count, and quick-start action cards",
          "One screen tells you everything — what to do today and how far you've come",
        ],
        benefit: "Open the app and instantly know what to do today.",
      },
      {
        title: "Guided Wellness Routines (7-30 Day Programs)",
        bullets: [
          "Structured reset programs: Digestive Stability, Metabolic Support, Nervous System Regulation, and more",
          "Choose Lite (15-20 min/day) or Intensive (45-60 min/day) intensity",
          "Each routine includes goal, duration, \"Who Is It For,\" and \"Expected Results\"",
          "One tap enrolls you and auto-generates your daily habits for the full program",
        ],
        benefit: "Like having a wellness coach hand you a day-by-day plan for any health goal.",
      },
      {
        title: "Daily Habits & Tracking",
        bullets: [
          "Each day's habits appear as a checklist with one-tap completion",
          "Every habit includes a \"Why It Matters\" explanation and \"Quick Tip\"",
          "Estimated duration and recommended time of day for each habit",
          "Cadence badges (daily, weekly, one-time) keep you on track",
        ],
        benefit: "Abstract wellness goals become concrete daily actions.",
      },
      {
        title: "Habits Encyclopedia",
        bullets: [
          "Searchable library of every wellness habit across all routines",
          "Browse by keyword or category with full science-backed explanations",
          "Add individual habits without committing to a full routine",
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
        benefit: "Objective health data from devices you already wear — no manual logging.",
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
            A full self-service healthcare portal and preventative wellness platform — designed to work together
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
