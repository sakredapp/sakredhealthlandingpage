import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, Check } from "lucide-react";
import { Reveal, StampHeading, stagger } from "@/components/motion";
import { SITE_IMAGES, hasImage } from "@/data/site-images";

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
    detail: "ACA marketplaces limit your choices. Through Sakred, you access a wide range of plan types — major medical, supplemental, dental, vision, Medicare, and more — matched to your specific situation by a licensed agent.",
  },
  {
    title: "You want all your protection in one place",
    detail: "Your health is part of your life. Through Sakred you can pair health coverage with term, whole, and indexed universal life insurance, mortgage protection (MPI), final expense, and annuities — every box checked, all under one agent who knows your complete picture.",
  },
];

export function WhyPrivate() {
  const photo = SITE_IMAGES.whyPrivate;
  const withPhoto = hasImage(photo);

  return (
    <section className="py-12 lg:py-20 bg-[#F6F4EF]">
      <div className={`${withPhoto ? "max-w-6xl" : "max-w-4xl"} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="text-center mb-12">
          <Reveal>
            <div className="w-12 h-1 bg-gradient-to-r from-[#C5A059] to-[#EBD598] mx-auto mb-6" />
          </Reveal>
          <StampHeading
            text="Why"
            accent="Private Health Insurance?"
            className="text-3xl sm:text-4xl font-display font-normal text-[#2C2C2C] mb-4"
          />
          <Reveal delay={0.12}>
            <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
              Millions of Americans fall through the cracks — earning too much for subsidies but not enough to overpay. That's exactly who we serve.
            </p>
          </Reveal>
        </div>

        <div className={withPhoto ? "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start" : ""}>
        {withPhoto && (
          <Reveal delay={0.1} y={24} className="order-last lg:order-first">
            <div className="lg:sticky lg:top-28">
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-64 sm:h-80 lg:h-[500px] object-cover rounded-3xl border border-[#E8E4DC] shadow-[0_20px_50px_-25px_rgba(197,160,89,0.45)]"
                loading="lazy"
              />
            </div>
          </Reveal>
        )}

        <div className="space-y-4">
          {reasons.map((reason, index) => (
            <Reveal
              key={reason.title}
              delay={stagger(index)}
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
            </Reveal>
          ))}
        </div>
        </div>

        <Reveal delay={0.1} className="text-center mt-10">
          <Link href="/products">
            <Button
              size="lg"
              className="rounded-full btn-gold-gradient text-[#2C2C2C] px-8 py-6 text-base font-normal shadow-lg shadow-[#C5A059]/20 hover:shadow-[#C5A059]/40 hover:-translate-y-0.5 transition-all border border-[#C5A059]"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Check Coverage in Your Zip Code
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
