import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

interface ClientType {
  title: string;
  description: string;
  bullets: string[];
}

const clientTypes: ClientType[] = [
  {
    title: "Self-Employed Individuals",
    description: "Freelancers, 1099 contractors, gig workers, small business owners",
    bullets: [
      "No employer-sponsored plan to fall back on",
      "Need clear, plain-language access to coverage details",
      "Benefit from a dedicated agent who understands individual plans",
      "Wellness routines to support high-demand, independent lifestyles",
    ],
  },
  {
    title: "Families",
    description: "Married couples, parents with dependents, multi-generational households",
    bullets: [
      "Managing coverage for multiple family members",
      "Need quick access to copays, deductibles, and documents for each person",
      "Callback scheduling when juggling kids, work, and appointments",
      "Foundational wellness routines the whole family can follow",
    ],
  },
  {
    title: "Early Retirees",
    description: "Ages 50-64 — too young for Medicare, too old for employer coverage",
    bullets: [
      "Navigating the gap between employer plans and Medicare",
      "Higher premiums mean understanding every dollar of coverage matters",
      "Policy search to decode complex individual market plans",
      "Preventative wellness protocols designed for long-term vitality",
    ],
  },
  {
    title: "Young Adults Aging Off Parents' Plans",
    description: "Ages 26-30 — just lost coverage and don't know what to do",
    bullets: [
      "First time choosing and understanding health insurance",
      "Need guidance from a real person, not a confusing website",
      "\"Don't Have a Plan?\" feature connects them with a free broker",
      "Build healthy habits early with guided wellness routines",
    ],
  },
  {
    title: "Small Business Owners with Employees",
    description: "2-50 employees — too small for group, too big to ignore",
    bullets: [
      "Offering benefits without a massive HR department",
      "Employees get a self-service portal instead of calling you",
      "Document access and support requests reduce admin burden",
      "Wellness features as an employee benefit that costs nothing extra",
    ],
  },
];

export function WhoWeHelp() {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section className="py-12 lg:py-20 bg-[#FDFBF7]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <p className="text-sm font-medium uppercase tracking-wider text-[#C5A059] mb-3">Who We Help</p>
          <h2 className="text-3xl sm:text-4xl font-display font-normal text-[#2C2C2C] mb-4">
            Built for{" "}
            <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
              Real People
            </span>
          </h2>
          <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
            Whether you're self-employed, raising a family, or navigating coverage for the first time — Sakred was designed for you.
          </p>
        </motion.div>

        <div className="space-y-3">
          {clientTypes.map((client, index) => {
            const isExpanded = expandedItems[index];
            return (
              <motion.div
                key={client.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 overflow-visible ${
                    isExpanded
                      ? "border-[#C5A059]/40 shadow-[0_0_15px_rgba(197,160,89,0.15)]"
                      : "border-[#E8E4DC]"
                  } hover-elevate`}
                  onClick={() => toggleItem(index)}
                  data-testid={`card-client-${client.title.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <div className="flex items-center justify-between p-5 gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-semibold text-[#2C2C2C] text-sm sm:text-base" data-testid={`text-client-title-${index}`}>
                        {client.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#2C2C2C]/50 mt-0.5" data-testid={`text-client-desc-${index}`}>{client.description}</p>
                    </div>
                    <div className="flex items-center flex-shrink-0">
                      <ChevronDown
                        className={`w-4 h-4 text-[#C5A059] transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
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
                          <ul className="space-y-2">
                            {client.bullets.map((bullet, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#C5A059] to-[#EBD598] mt-2 flex-shrink-0" />
                                <span className="text-sm text-[#2C2C2C]/75 leading-relaxed">{bullet}</span>
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
      </div>
    </section>
  );
}
