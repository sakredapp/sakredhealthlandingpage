import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Sakred Health?",
    answer: "Sakred Health is an all-in-one private healthcare and preventative wellness ecosystem. It combines a HIPAA-compliant client portal — policy search, coverage breakdowns, secure document vault, Hathr AI assistant, and dedicated agent messaging — with guided wellness routines, daily habit tracking, and wearable integrations. Beyond healthcare, Sakred also gives you access to chronic condition life policies, estate planning, and retirement annuities — so your entire health and long-term planning lives in one place.",
  },
  {
    question: "Do I need a healthcare plan to use Sakred?",
    answer: "No. You can use our wellness routines, habit tracking, and wearable integrations without any plan. If you do have coverage through an employer or provider that partners with Sakred, you can link your plan to unlock the full healthcare portal. And if you don't have a plan yet, we can connect you with a private broker for free.",
  },
  {
    question: "What does the Healthcare Portal include?",
    answer: "When your plan is linked, you get: full visibility into active policies, carrier details, premiums, deductibles, and copays. Full-text policy search with highlighted answers and page references. A secure document vault for ID cards, EOBs, and claim letters. HIPAA-compliant in-app messaging with your dedicated agent. The Hathr AI assistant for instant policy questions. And a support request system with callback scheduling.",
  },
  {
    question: "What about chronic conditions, estate planning, and retirement?",
    answer: "Sakred goes beyond day-to-day healthcare. Activated clients can access chronic condition life insurance policies, estate planning resources, and retirement annuity details — all managed in the same secure portal alongside your health coverage. Your dedicated agent can help with questions across all of these areas.",
  },
  {
    question: "What kind of wellness routines are available?",
    answer: "We offer 18+ guided reset routines covering gut health, sleep optimization, energy recovery, detox & drainage, nervous system support, hydration, focus, and more. Each routine runs 7-30 days with Lite (15-20 min/day) or Intensive (45-60 min/day) options. Every routine includes science-backed daily habits, progress tracking, and recommended supplies.",
  },
  {
    question: "Which wearables are supported?",
    answer: "We integrate with Fitbit, WHOOP, Oura Ring, Garmin, and Apple Health. Connect your devices to sync steps, heart rate, HRV, sleep scores, recovery, strain, and more — all in one place.",
  },
  {
    question: "Is my data private and secure?",
    answer: "Absolutely. Sakred is built to be HIPAA-compliant. Your data is encrypted using industry-standard AES-256 encryption and stored securely. All agent messaging is encrypted end-to-end. We never sell your personal information, and you have full control over your data — including the ability to export or delete it anytime.",
  },
  {
    question: "Is Sakred really free?",
    answer: "Yes — Sakred Health is completely free for activated clients. You get full access to the healthcare portal, wellness routines, habit tracking, wearable integrations, Hathr AI, and the secure document vault at no cost. No credit card required, no hidden fees.",
  },
];

export function FAQ() {
  return (
    <section className="py-12 lg:py-20 bg-[#FDFBF7]">
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
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-lg text-[#0F172A]/70">
            Everything you need to know about Sakred Health
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-2xl px-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-0 overflow-hidden"
              >
                <AccordionTrigger
                  className="text-left text-[#0F172A] font-medium py-5 hover:no-underline"
                  data-testid={`button-faq-${index}`}
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#0F172A]/70 pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-12"
        >
          <p className="text-[#0F172A]/70">
            Have more questions?{" "}
            <Link href="/ai-privacy" className="text-[#C5A059] font-medium hover:underline" data-testid="link-ai-privacy">
              Learn about AI & Privacy
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
