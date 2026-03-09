import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useDownloadDialog } from "./DownloadDialog";

const portalFeatures = [
  {
    title: "Policy Search",
    description: "Search your entire policy document in plain language — no more digging through 80-page PDFs.",
  },
  {
    title: "Coverage Overview",
    description: "See your deductible, copays, out-of-pocket max, and network type at a glance — pulled directly from your plan.",
  },
  {
    title: "Document Access",
    description: "Download your policy documents anytime, right from the app.",
  },
  {
    title: "Dedicated Agent",
    description: "Call or request a callback from your assigned benefits specialist — someone who already knows your plan.",
  },
  {
    title: "Support Requests",
    description: "Submit questions about claims, billing, or coverage and track responses in one place.",
  },
];

export function ParasiteCleanse() {
  const { openDialog, DialogComponent } = useDownloadDialog();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section className="py-6 lg:py-10 bg-gradient-to-b from-[#FDFBF7] to-[#F6F4EF]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-12 h-1 bg-gradient-to-r from-[#C5A059] to-[#EBD598] mx-auto mb-6" />
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold text-[#2C2C2C] mb-6">
            What Sakred{" "}
            <span className="text-[#C5A059]">Members Get</span>
          </h2>
          
          <p className="text-lg text-[#2C2C2C]/70 max-w-3xl mx-auto leading-relaxed">
            When your plan is linked, your Healthcare tab becomes a full self-service portal.
            Access your benefits, search your policy, and get personalized support — all in one place.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-3 mb-10"
        >
          {portalFeatures.map((feature, index) => (
            <Card
              key={feature.title}
              className="bg-white border-[#E8E4DC] overflow-hidden cursor-pointer transition-all duration-200"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              data-testid={`card-portal-feature-${index}`}
            >
              <div className="flex items-center justify-between p-5">
                <h3 className="font-display font-semibold text-[#2C2C2C] text-sm sm:text-base">
                  {feature.title}
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
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          <Card className="p-6 lg:p-8 bg-white border-[#E8E4DC]">
            <h3 className="font-display font-semibold text-[#2C2C2C] mb-1">Already Have a Plan?</h3>
            <p className="text-sm text-[#2C2C2C]/50 mb-4">Activate your healthcare portal</p>
            <p className="text-sm text-[#2C2C2C]/70 leading-relaxed mb-5">
              If your employer or provider has partnered with Sakred, enter your email to unlock your full benefits portal — including policy search, coverage details, and direct agent support.
            </p>
            <Button
              onClick={openDialog}
              size="lg"
              className="w-full rounded-full btn-gold-gradient text-[#2C2C2C] border border-[#C5A059] shadow-lg shadow-[#C5A059]/20 gap-2"
              data-testid="button-activate-portal"
            >
              Activate My Portal
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>

          <Card className="p-6 lg:p-8 bg-white border-[#E8E4DC]">
            <h3 className="font-display font-semibold text-[#2C2C2C] mb-1">Don't Have a Plan?</h3>
            <p className="text-sm text-[#2C2C2C]/50 mb-4">Discover what's available in your area</p>
            <p className="text-sm text-[#2C2C2C]/70 leading-relaxed mb-5">
              Speak with a private healthcare broker — completely free — to explore options tailored to your needs, budget, and location. No obligations, no pressure.
            </p>
            <Button
              onClick={openDialog}
              variant="outline"
              size="lg"
              className="w-full rounded-full border-[#C5A059] text-[#2C2C2C] hover:bg-[#C5A059]/10"
              data-testid="button-explore-options"
            >
              Explore My Options
            </Button>
          </Card>
        </motion.div>
      </div>
      {DialogComponent}
    </section>
  );
}
