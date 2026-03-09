import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

const transformations = [
  {
    title: "Know Your Coverage Instantly",
    description: "No more calling your insurance company or searching through paperwork. Your policy details, coverage limits, and network info are always at your fingertips.",
  },
  {
    title: "Build Daily Wellness Structure",
    description: "Follow guided routines that support your foundational health — gut function, hydration, nervous system regulation, and metabolic balance.",
  },
  {
    title: "Connect Your Wearables",
    description: "Sync data from Fitbit, WHOOP, Oura Ring, Garmin, and Apple Health to get a fuller picture of your daily wellness alongside your healthcare info.",
  },
  {
    title: "Get Support When You Need It",
    description: "Reach your dedicated benefits specialist directly through the app. Submit claims questions, request callbacks, and track every response.",
  },
  {
    title: "Take a Preventative Approach",
    description: "Bridge the gap between insurance coverage and daily wellness. Build the internal foundation that keeps you ahead of problems instead of reacting to them.",
  },
  {
    title: "Stay Organized Effortlessly",
    description: "Policy documents, wellness progress, habit tracking, and provider contacts — everything lives in one place instead of scattered across a dozen apps.",
  },
];

export function LifeTransformation() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section className="py-6 lg:py-10 bg-[#FDFBF7]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <div className="w-12 h-1 bg-gradient-to-r from-[#C5A059] to-[#EBD598] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-display font-normal text-[#2C2C2C] mb-4">
            What Changes When{" "}
            <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
              Everything's Connected
            </span>
          </h2>
          <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
            When your healthcare access and wellness habits live in the same place, you stop managing your health in fragments.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-3"
        >
          {transformations.map((item, index) => (
            <Card
              key={item.title}
              className="bg-white border-[#E8E4DC] overflow-hidden cursor-pointer transition-all duration-200"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              data-testid={`card-transformation-${index}`}
            >
              <div className="flex items-center justify-between p-5">
                <h3 className="font-display font-semibold text-[#2C2C2C] text-sm sm:text-base">
                  {item.title}
                </h3>
                <ChevronDown
                  className={`w-4 h-4 text-[#C5A059] flex-shrink-0 ml-4 transition-transform duration-200 ${
                    expandedIndex === index ? "rotate-180" : ""
                  }`}
                />
              </div>
              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-5 pt-0">
                      <p className="text-sm text-[#2C2C2C]/70 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
