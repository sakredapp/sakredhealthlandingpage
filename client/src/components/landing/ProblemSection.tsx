import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

const problems = [
  {
    title: "Scattered Health Info",
    description: "Your policy lives in one place, your doctor's notes in another, and your wellness data on three different apps. Nothing talks to each other.",
  },
  {
    title: "Confusing Coverage",
    description: "Understanding what your plan covers shouldn't require a law degree. Most people don't know their deductible, copays, or network details.",
  },
  {
    title: "Reactive, Not Preventative",
    description: "Traditional healthcare waits until something breaks. There's no bridge between your insurance benefits and the daily habits that keep you well.",
  },
  {
    title: "No Single Source",
    description: "Policy documents, wellness routines, wearable data, and provider support are all disconnected — making it harder to stay on top of your health.",
  },
];

export function ProblemSection() {
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
            Healthcare Shouldn't{" "}
            <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
              Feel This Hard
            </span>
          </h2>
          <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
            Your health information is fragmented across dozens of apps, portals, and paperwork. Sakred brings it all together.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-3"
        >
          {problems.map((problem, index) => (
            <Card
              key={problem.title}
              className="bg-white border-[#E8E4DC] overflow-hidden cursor-pointer transition-all duration-200"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              data-testid={`card-problem-${index}`}
            >
              <div className="flex items-center justify-between p-5">
                <h3 className="font-display font-semibold text-[#2C2C2C] text-sm sm:text-base">
                  {problem.title}
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
                        {problem.description}
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
