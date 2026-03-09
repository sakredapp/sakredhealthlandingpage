import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDownloadDialog } from "./DownloadDialog";

const features = [
  "HIPAA-compliant Healthcare Portal (policy search, coverage, documents)",
  "Dedicated healthcare agent with in-app messaging",
  "Hathr AI Assistant for instant coverage answers",
  "Claims, billing & support request tracking",
  "Chronic condition & life policy management",
  "Estate planning & retirement annuity access",
  "All 18+ Guided Wellness Routines",
  "Daily habit tracking with journey path",
  "Wearable integrations (Fitbit, WHOOP, Oura, Garmin, Apple Health)",
  "Secure document vault with encrypted storage",
];

export function Pricing() {
  const { openDialog, DialogComponent } = useDownloadDialog();

  return (
    <section className="py-12 lg:py-20 bg-[#F9F9F7]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="w-12 h-1 bg-gradient-to-r from-[#C5A059] to-[#EBD598] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-display font-normal text-[#0F172A] mb-4">
            Completely{" "}
            <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
              Free
            </span>
          </h2>
          <p className="text-lg text-[#0F172A]/80 max-w-2xl mx-auto">
            Everything Sakred offers — your healthcare portal, wellness routines, habit tracking, and wearable integrations — at no cost
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-white rounded-2xl p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05),0_10px_20px_-2px_rgba(0,0,0,0.03)] ring-2 ring-[#C5A059] border-transparent">
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-5xl font-bold text-[#0F172A]">$0</span>
              </div>
              <p className="text-sm text-[#0F172A]/70">Free forever. No credit card required.</p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] flex-shrink-0 mt-2" />
                  <span className="text-[#0F172A]/70 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={openDialog}
              className="w-full rounded-full py-6 btn-gold-gradient shadow-lg shadow-[#C5A059]/20"
              data-testid="button-pricing-free"
            >
              Download the App
            </Button>
          </Card>
        </motion.div>
      </div>
      {DialogComponent}
    </section>
  );
}
