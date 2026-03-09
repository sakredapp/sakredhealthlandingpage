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
    answer: "Sakred Health is an all-in-one healthcare and preventative wellness platform. It combines a full healthcare client portal — policy search, coverage breakdowns, document access, and dedicated agent support — with guided wellness routines, healthy habits, and wearable integrations. Think of it as the bridge between your healthcare plan and your daily well-being.",
  },
  {
    question: "Do I need a healthcare plan to use Sakred?",
    answer: "No. You can use our wellness routines, habit tracking, and wearable integrations without any plan. If you do have coverage through an employer or provider that partners with Sakred, you can link your plan to unlock the full healthcare portal. And if you don't have a plan yet, we can connect you with a private broker for free.",
  },
  {
    question: "What does the Healthcare Portal include?",
    answer: "When your plan is linked, you get: plain-language policy search (no more digging through PDFs), a coverage overview with your deductible, copays, and out-of-pocket max, document access to download policy files anytime, a dedicated benefits specialist you can call or request callbacks from, and a support request system for claims and billing questions.",
  },
  {
    question: "What kind of wellness routines are available?",
    answer: "We offer 18+ structured routines covering digestive stability, metabolic support, nervous system regulation, hormonal balance, and more. Each routine is 14-28 days and follows a foundational sequencing approach — meaning we build your basics first before introducing more advanced protocols.",
  },
  {
    question: "Which wearables are supported?",
    answer: "We integrate with Fitbit, WHOOP, Oura Ring, and Garmin. Apple Health is also supported through our native iOS app. Connect your devices to sync steps, heart rate, sleep quality, HRV tracking, recovery scores, and more.",
  },
  {
    question: "Is my data private and secure?",
    answer: "Absolutely. Your data is encrypted using industry-standard AES-256 encryption and stored securely. We never sell your personal information. Your healthcare data and wellness information are kept separate and you have full control over your data — including the ability to export or delete it anytime.",
  },
  {
    question: "Is Sakred really free?",
    answer: "Yes — Sakred Health is completely free. You get full access to the healthcare portal, all 18+ guided wellness routines, habit tracking, wearable integrations, and the wellness library at no cost. No credit card required, no hidden fees.",
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
