import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, Check } from "lucide-react";

const reasons = [
  {
    title: "You earn too much for ACA subsidies",
    detail: "If your household income exceeds 400% of the federal poverty level, you won't get marketplace help. Private plans can be more affordable than unsubsidized ACA premiums.",
  },
  {
    title: "You're self-employed or 1099",
    detail: "No employer plan? Private health insurance gives you flexibility to pick coverage that matches your budget and needs — not a one-size-fits-all group plan.",
  },
  {
    title: "You need coverage between jobs",
    detail: "COBRA is expensive. Short-term medical or fixed indemnity plans bridge the gap until your next employer plan kicks in.",
  },
  {
    title: "You want a dedicated agent — not a call center",
    detail: "Every Sakred client gets a licensed agent who knows your plan, picks up the phone, and stays with you from enrollment through claims.",
  },
  {
    title: "You want more plan options",
    detail: "ACA marketplaces limit your choices. Through Sakred, you access 15+ carriers and 12 plan types — major medical, supplemental, dental, vision, Medicare, and more.",
  },
];

export function WhyPrivate() {
  return (
    <section className="py-12 lg:py-20 bg-[#F6F4EF]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-12 h-1 bg-gradient-to-r from-[#C5A059] to-[#EBD598] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-display font-normal text-[#2C2C2C] mb-4">
            Why{" "}
            <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
              Private Health Insurance?
            </span>
          </h2>
          <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
            Millions of Americans fall through the cracks — earning too much for subsidies but not enough to overpay. That's exactly who we serve.
          </p>
        </motion.div>

        <div className="space-y-4">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="bg-white rounded-2xl border border-[#E8E4DC] p-6 hover:border-[#C5A059]/30 transition-colors duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#C5A059] to-[#EBD598] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-[#2C2C2C] text-base mb-1">
                    {reason.title}
                  </h3>
                  <p className="text-sm text-[#2C2C2C]/65 leading-relaxed">
                    {reason.detail}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-10"
        >
          <Link href="/get-coverage">
            <Button
              size="lg"
              className="rounded-full btn-gold-gradient text-[#2C2C2C] px-8 py-6 text-base font-normal shadow-lg shadow-[#C5A059]/20 hover:shadow-[#C5A059]/40 hover:-translate-y-0.5 transition-all border border-[#C5A059]"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Check Coverage in Your Zip Code
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
