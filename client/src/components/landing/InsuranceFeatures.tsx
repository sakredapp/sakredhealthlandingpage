import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Search, FolderLock, MessageCircle, Activity, UserCheck, MapPin } from "lucide-react";
import { GlowCard, Reveal, StampHeading, stagger } from "@/components/motion";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <UserCheck className="w-6 h-6" />,
    title: "Your Own Dedicated Agent",
    description: "A licensed agent assigned to you — not a call center. They know your plan, your family, and your history.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Coverage That Fits Your Budget",
    description: "Major medical, short-term, fixed indemnity, supplemental, and more — we find the right plan for your situation.",
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: "Plain-Language Policy Search",
    description: "Ask questions about your plan in plain English and get highlighted answers pulled directly from your policy docs.",
  },
  {
    icon: <FolderLock className="w-6 h-6" />,
    title: "Secure Document Vault",
    description: "ID cards, EOBs, claim letters — encrypted, organized, and always accessible from your phone.",
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Sakred AI + Agent Messaging",
    description: "Get instant answers from our AI assistant or message your agent directly — all HIPAA-compliant.",
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: "Claims & Support Tracking",
    description: "Submit tickets, schedule callbacks, and track every claim and resolution in one place.",
  },
];

export function InsuranceFeatures() {
  return (
    <section id="features" className="py-12 lg:py-20 bg-[#F9F9F7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Reveal>
            <div className="w-12 h-1 bg-gradient-to-r from-[#C5A059] to-[#EBD598] mx-auto mb-6" />
          </Reveal>
          <StampHeading
            text="What You Get With"
            accent="Sakred Health"
            className="text-3xl sm:text-4xl font-display font-normal text-[#2C2C2C] mb-4"
          />
          <Reveal delay={0.12}>
            <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
              Real coverage, a real agent, and a real portal to manage everything — not another faceless insurance marketplace.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={stagger(index)}>
              <GlowCard className="group h-full bg-white rounded-2xl border border-[#E8E4DC] p-6 hover:border-[#C5A059]/40 hover:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C5A059]/10 to-[#EBD598]/10 flex items-center justify-center text-[#C5A059] mb-4 group-hover:from-[#C5A059]/20 group-hover:to-[#EBD598]/20 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-display font-semibold text-[#2C2C2C] text-sm sm:text-base mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#2C2C2C]/65 leading-relaxed">
                  {feature.description}
                </p>
              </GlowCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="text-center mt-10">
          <Link href="/get-coverage">
            <Button
              size="lg"
              className="rounded-full btn-gold-gradient text-[#2C2C2C] px-8 py-6 text-base font-normal shadow-lg shadow-[#C5A059]/20 hover:shadow-[#C5A059]/40 hover:-translate-y-0.5 transition-all border border-[#C5A059]"
            >
              <MapPin className="w-4 h-4 mr-2" />
              See Affordable Options Near You
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
