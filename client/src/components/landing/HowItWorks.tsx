import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

const steps = [
  {
    title: "Download & Create Your Account",
    description: "Get the app and set up your profile in under two minutes. Start exploring wellness routines and healthy habits right away — no plan required.",
  },
  {
    title: "Link Your Healthcare Plan",
    description: "If you have coverage, connect your plan to unlock your full portal — policy search, coverage breakdowns, document access, and dedicated agent support.",
  },
  {
    title: "Build Your Wellness Foundation",
    description: "Follow guided routines, track daily habits, and connect your wearables. Your healthcare portal and preventative wellness tools work together in one place.",
  },
];

export function HowItWorks() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section className="py-6 lg:py-10 bg-[#F9F9F7]">
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
            How It Works
          </h2>
          <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
            Get started in minutes — healthcare access and wellness tools, together
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-3"
        >
          {steps.map((step, index) => (
            <Card
              key={step.title}
              className="bg-white border-[#E8E4DC] overflow-hidden cursor-pointer transition-all duration-200"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              data-testid={`card-step-${index}`}
            >
              <div className="flex items-center justify-between p-5">
                <h3 className="font-display font-semibold text-[#2C2C2C] text-sm sm:text-base">
                  {step.title}
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
                        {step.description}
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
