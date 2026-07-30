import { motion } from "framer-motion";

interface Feature {
  title: string;
  description: string;
  tag: string;
}

const features: Feature[] = [
  {
    title: "All Your Coverage, One View",
    description: "Policy cards for Health, Life, and Annuity — premiums, deductibles, member IDs, and documents, together in the Policy tab.",
    tag: "Policy",
  },
  {
    title: "Plain-Language Policy Search",
    description: "Ask a question about any plan and get highlighted answers pulled straight from your own policy documents.",
    tag: "Policy",
  },
  {
    title: "Your Agent + Sakred AI",
    description: "HIPAA-compliant messaging, callbacks, and support requests with your dedicated agent — plus Sakred AI for instant answers.",
    tag: "Policy",
  },
  {
    title: "Guided Routines & Daily Habits",
    description: "Multi-day terrain protocols — liver & detox, gut reset, digestion, sleep — with daily habit tracking and streaks.",
    tag: "Habits",
  },
  {
    title: "eBook Library & Reader",
    description: "A storefront and your owned library, with an in-app reader and audio — the education behind every protocol.",
    tag: "Library",
  },
  {
    title: "Terrain Translator & Ask",
    description: "Type a symptom to see root causes and what to do, search across your books, or send a question to your team.",
    tag: "Library",
  },
  {
    title: "Curated Marketplace",
    description: "Shop the trusted products a protocol calls for — search, browse, and build routine shopping lists in a tap.",
    tag: "Shop",
  },
  {
    title: "Wearable Sync",
    description: "Connect Garmin, Oura, WHOOP, and Fitbit for real-time sync — steps, heart rate, HRV, sleep, recovery, and strain.",
    tag: "Wearables",
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
            Everything you get,{" "}
            <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
              one membership
            </span>
          </h2>
          <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
            Across Home, Habits, Policy, Library, and Shop — your coverage, preventative wellness, and everyday guidance, designed to work together
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
              <div className="w-8 h-[3px] rounded-full bg-gradient-to-r from-[#C5A059] to-[#EBD598] mb-4 group-hover:w-12 transition-all duration-300" />
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
