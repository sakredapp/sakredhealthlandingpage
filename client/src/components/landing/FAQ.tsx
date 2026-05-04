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
    answer: "Sakred Health is a licensed life and health insurance agency that connects individuals, families, and small businesses with affordable health and life insurance options. Every client gets a dedicated licensed agent, a HIPAA-compliant portal to manage their coverage, and access to a full preventative wellness ecosystem — all included at no extra cost.",
  },
  {
    question: "Who is Sakred Health for?",
    answer: "We primarily serve people who don't have employer-sponsored coverage and don't qualify for ACA/Obamacare subsidies — self-employed individuals, 1099 contractors, small business owners, families, pre-retirees, young adults aging off their parents' plans, and anyone navigating the private insurance market.",
  },
  {
    question: "What types of plans do you offer?",
    answer: "On the health side: major medical (PPO, HMO, EPO), ACA/Marketplace plans, limited medical, fixed indemnity, short-term medical, hospital indemnity, dental & vision, DVH bundles, supplemental (accident, cancer, critical illness), disability income, Medicare (supplement & advantage), and group employer-sponsored plans. On the life and retirement side: term life, whole life, Indexed Universal Life (IUL), Mortgage Protection Insurance (MPI), final expense, and annuities.",
  },
  {
    question: "Do you offer life insurance and annuities?",
    answer: "Yes. Your health is part of your life — so we make sure every box is checked, not just one. We offer term life (10/20/30-year), whole life, Indexed Universal Life (IUL), Mortgage Protection Insurance (MPI — term life sized to pay off your mortgage if something happens to you, not a loan), final expense (small whole life for funeral and end-of-life costs), and annuities (fixed, indexed, and immediate options for guaranteed retirement income). Your dedicated agent handles both your health and life coverage so you have one person who knows your full picture.",
  },
  {
    question: "Is Mortgage Protection the same as a mortgage or refinance?",
    answer: "No. Mortgage Protection Insurance (MPI) is a life insurance policy — not a loan, refinance, or lending product. It's term life insurance with a death benefit sized to pay off the remaining balance on your mortgage if you pass away during the term, so your family isn't forced to sell the home. Sakred Health is a licensed life and health insurance agency, not a mortgage lender or broker.",
  },
  {
    question: "How is this different from Healthcare.gov or an insurance marketplace?",
    answer: "Marketplaces are self-service — you're on your own comparing plans and figuring out what's covered. With Sakred, you get a dedicated agent who understands your situation, finds the right plan for you, and stays with you after enrollment for claims, questions, and renewals. Plus you get a full client portal and wellness app included.",
  },
  {
    question: "Do I get a real person to help me?",
    answer: "Yes — every Sakred client is assigned a licensed healthcare agent. They're not a chatbot or a call center. Your agent knows your plan, your family, and your history. You can message them directly through the app or schedule a call anytime.",
  },
  {
    question: "Is there a cost to use Sakred Health?",
    answer: "There's no fee to work with us. As a licensed agency, we earn a commission when a policy is placed — you pay nothing extra. The client portal, wellness routines, habit tracking, and all app features are included with every plan at no additional cost.",
  },
  {
    question: "What if I already have coverage but want better options?",
    answer: "We can review your current plan and find better options for you. If there's a better fit — lower premiums, better coverage, or additional benefits — your agent will walk you through the switch. You keep the same agent and agency throughout.",
  },
  {
    question: "How do I get started?",
    answer: "Click 'See Plans in Your Area,' enter your zip code, and answer a few quick questions about your situation. A licensed agent will reach out with personalized options — no obligation, no pressure.",
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
