import { motion } from "framer-motion";
import { Shield, Search, FolderLock, MessageCircle, Activity, Heart, Watch, Landmark } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  tag: string;
}

const features: Feature[] = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Your Insurance, Simplified",
    description: "Policies, premiums, deductibles, copays, and Rx tiers — all on one screen with direct insurance portal links.",
    tag: "Portal",
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: "Search Your Policy",
    description: "Ask plain-language questions and get highlighted answers pulled directly from your plan documents.",
    tag: "Portal",
  },
  {
    icon: <FolderLock className="w-6 h-6" />,
    title: "Secure Document Vault",
    description: "ID cards, EOBs, claim letters — encrypted, organized, searchable, and always in your pocket.",
    tag: "Portal",
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Agent & AI Support",
    description: "HIPAA-compliant messaging with your dedicated agent, plus Hathr AI for instant coverage answers 24/7.",
    tag: "Portal",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Guided Wellness Routines",
    description: "7-30 day reset programs for gut health, sleep, energy, and detox — with daily habit tracking and streaks.",
    tag: "Wellness",
  },
  {
    icon: <Watch className="w-6 h-6" />,
    title: "Wearable Integrations",
    description: "Sync Fitbit, WHOOP, Oura Ring, Garmin, and Apple Health — all your health data in one place.",
    tag: "Wellness",
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: "Claims & Support Tracking",
    description: "Submit tickets, book callbacks, and track every request and resolution with your agent.",
    tag: "Portal",
  },
  {
    icon: <Landmark className="w-6 h-6" />,
    title: "Life Policies & Estate Planning",
    description: "Manage life policies, retirement annuities, and estate documents alongside your health coverage.",
    tag: "Planning",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-12 lg:py-20 bg-[#F9F9F7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-12 h-1 bg-gradient-to-r from-[#C5A059] to-[#EBD598] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-display font-normal text-[#2C2C2C] mb-4">
            Everything You Need,{" "}
            <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
              One App
            </span>
          </h2>
          <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
            A HIPAA-compliant healthcare portal, preventative wellness platform, and long-term planning ecosystem — all designed to work together
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group bg-white rounded-2xl border border-[#E8E4DC] p-6 hover:border-[#C5A059]/40 hover:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C5A059]/10 to-[#EBD598]/10 flex items-center justify-center text-[#C5A059] mb-4 group-hover:from-[#C5A059]/20 group-hover:to-[#EBD598]/20 transition-colors duration-300">
                {feature.icon}
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#C5A059]/70 mb-2 block">
                {feature.tag}
              </span>
              <h3 className="font-display font-semibold text-[#2C2C2C] text-sm sm:text-base mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[#2C2C2C]/65 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
