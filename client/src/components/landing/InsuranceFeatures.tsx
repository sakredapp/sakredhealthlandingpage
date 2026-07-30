import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { GlowCard, Reveal, StampHeading, stagger } from "@/components/motion";

/**
 * "What you get" — deliberately icon-free (type + a gold rule carry the design).
 * The pitch: a real agent, plus the Sakred app / client portal that comes with
 * every plan.
 */
const features: { title: string; description: string }[] = [
  {
    title: "A dedicated licensed agent",
    description:
      "A real person assigned to you — not a call center. They know your plan, your family, and your history, and they pick up the phone.",
  },
  {
    title: "The Sakred Health app",
    description:
      "Your coverage and your wellness in one app — iOS, Android, and web. Policy details, guided routines, habit tracking, and the library, all included.",
  },
  {
    title: "A real client portal",
    description:
      "ID cards, claims, EOBs, and documents in one secure, HIPAA-compliant place — organized and accessible from your phone, not a shoebox.",
  },
  {
    title: "Plain-language policy answers",
    description:
      "Ask what's covered in plain English and get answers pulled from your actual policy documents — no decoding insurance jargon.",
  },
  {
    title: "Message your agent directly",
    description:
      "Questions, claims, callbacks — message your agent or our support team right in the app and track every request to resolution.",
  },
  {
    title: "Wellness, included",
    description:
      "Guided routines, habit tracking, and the full library come with every plan at no extra cost — because coverage is the floor, not the goal.",
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
              Every plan comes with a dedicated agent, the Sakred Health app, and a real client
              portal — not another faceless insurance marketplace.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={stagger(index)}>
              <GlowCard className="group h-full bg-white rounded-2xl border border-[#E8E4DC] p-6 hover:border-[#C5A059]/40 hover:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300">
                <div className="w-10 h-1 rounded-full bg-gradient-to-r from-[#C5A059] to-[#EBD598] mb-4 group-hover:w-16 transition-all duration-300" />
                <h3 className="font-display font-semibold text-[#2C2C2C] text-base mb-2">
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
          <Link href="/app">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-[#C5A059] text-[#2C2C2C] hover:bg-[#C5A059]/5 px-8 py-6 text-base font-normal"
            >
              See the app
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
