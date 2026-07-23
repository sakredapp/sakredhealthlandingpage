import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { Reveal, StampHeading, stagger } from "@/components/motion";

interface ClientType {
  title: string;
  description: string;
  bullets: string[];
}

const clientTypes: ClientType[] = [
  {
    title: "Self-Employed & 1099 Contractors",
    description: "Freelancers, gig workers, small business owners — no employer plan",
    bullets: [
      "No employer-sponsored coverage to fall back on",
      "Need affordable options beyond the ACA marketplace",
      "Want a dedicated agent who understands individual and self-employed plans",
      "Need help comparing major medical, short-term, and fixed indemnity options",
    ],
  },
  {
    title: "Families & Households",
    description: "Married couples, parents with dependents, multi-generational households",
    bullets: [
      "Managing coverage for multiple family members across different insurance plans",
      "Need clear visibility into copays, deductibles, and out-of-pocket maximums",
      "Want life insurance and estate planning alongside health coverage",
      "Looking for dental, vision, and supplemental plans bundled together",
    ],
  },
  {
    title: "Pre-Retirees & Retirees (50+)",
    description: "Planning for Medicare transitions, retirement income, and legacy",
    bullets: [
      "Navigating Medicare Supplement vs. Medicare Advantage decisions",
      "Need help with retirement annuities and income planning",
      "Want chronic condition life policies managed alongside health coverage",
      "Looking for a single agent who handles all their coverage in one place",
    ],
  },
  {
    title: "People with Chronic Conditions",
    description: "Anyone managing ongoing health conditions who needs comprehensive coverage",
    bullets: [
      "Need plans that cover specialists, prescriptions, and ongoing treatments",
      "Want chronic condition life insurance options",
      "Need a dedicated agent for claims, referrals, and pre-authorizations",
      "Want plain-language policy search to understand what's actually covered",
    ],
  },
  {
    title: "Young Adults (26-30)",
    description: "Just aged off parents' plan — first time navigating insurance alone",
    bullets: [
      "First time choosing health insurance independently",
      "Need guidance from a real person, not a confusing government website",
      "Want affordable plans that don't sacrifice essential coverage",
      "Looking for a simple way to compare options and enroll quickly",
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
        <div className="text-center mb-8">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-wider text-[#C5A059] mb-3">Who We Help</p>
          </Reveal>
          <StampHeading
            text="Built for"
            accent="Real People"
            className="text-3xl sm:text-4xl font-display font-normal text-[#2C2C2C] mb-4"
          />
          <Reveal delay={0.12}>
            <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
              Whether you're self-employed, raising a family, or navigating coverage for the first time — Sakred was designed for you.
            </p>
          </Reveal>
        </div>

        <div className="space-y-3">
          {clientTypes.map((client, index) => {
            const isExpanded = expandedItems[index];
            return (
              <Reveal key={client.title} delay={stagger(index)}>
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
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
