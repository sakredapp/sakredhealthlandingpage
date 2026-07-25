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
    question: "What is the Sakred Health app?",
    answer: "The Sakred Health app is an all-in-one wellness and coverage platform organized into six tabs: Home, Habits, Policy, Library, Shop, and Profile. It pairs a HIPAA-compliant Policy portal — coverage breakdowns, plain-language policy search, secure documents, Sakred AI, and dedicated agent messaging — with guided routines, daily habit tracking, an eBook library and community, a curated shop, and wearable sync.",
  },
  {
    question: "What does the Policy tab include?",
    answer: "When your coverage is linked, you get policy cards for Health, Life, and Annuity — not health-only — with premiums, deductibles, copays, and member IDs. Plain-language policy search returns highlighted answers with page references. There's a secure document vault for ID cards, EOBs, and claim letters, HIPAA-compliant messaging with your dedicated agent, callback and support requests, and a self-serve activation flow. Not a member yet? The tab shows how to get covered.",
  },
  {
    question: "What's in the Library and Shop tabs?",
    answer: "The Library is an eBook storefront and your owned library with an in-app reader and audio, a Community Forum with general chat and breakout threads, and Ask & Search — the Terrain Translator (type a symptom to see root causes, the reasoning behind them, and what to do), search across your books, and a question queue to our team. The Shop is a curated product marketplace with search, product pages, buy links, and routine shopping lists so you can shop exactly what a protocol calls for.",
  },
  {
    question: "What kind of routines and habits are available?",
    answer: "The Habits tab lets you check off daily habits and start guided Routines — multi-day protocols organized by goal or 'terrain' (liver & detox, gut reset, digestion, sleep, and more). Each runs on a clear day-by-day plan with science-backed habits, a routine walkthrough, progress tracking, and a Habits Encyclopedia to learn the why behind every step.",
  },
  {
    question: "What is Sakred AI?",
    answer: "Sakred AI is the app's built-in assistant, grounded in our terrain-based wellness approach. Ask it about protocols, your habits, or your coverage and get instant, plain-language guidance. It works alongside the Terrain Translator, which turns a symptom into likely root causes and practical next steps.",
  },
  {
    question: "Which wearables are supported?",
    answer: "Connect Garmin, Oura, WHOOP, and Fitbit. Devices sync in real time to bring steps, heart rate, HRV, sleep scores, recovery, and strain into the app alongside your habits — managed from the Profile tab.",
  },
  {
    question: "Is my data private and secure?",
    answer: "Absolutely. Sakred is built to be HIPAA-compliant. Your data is encrypted using industry-standard AES-256 encryption and stored securely. All agent messaging is encrypted end-to-end. We never sell your personal information, and you have full control over your data — including the ability to export or delete it anytime.",
  },
  {
    question: "Is the app free?",
    answer: "Yes — the Sakred Health app is included with every Sakred Health plan at no extra cost. You get full access to the Policy portal, guided routines and habits, the eBook library and community, the shop, wearable sync, and Sakred AI. No add-ons, no hidden fees. It runs on iOS, Android, and the web at sakredapp.com.",
  },
];

export function AppFAQ() {
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
            Everything you need to know about the Sakred Health app
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
                <AccordionTrigger className="text-left text-[#0F172A] font-medium py-5 hover:no-underline">
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
            <Link href="/ai-privacy" className="text-[#C5A059] font-medium hover:underline">
              Learn about AI & Privacy
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
