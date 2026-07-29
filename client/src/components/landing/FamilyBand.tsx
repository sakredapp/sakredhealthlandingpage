import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Reveal, StampHeading } from "@/components/motion";
import { SITE_IMAGES, hasImage } from "@/data/site-images";

/**
 * Warm human beat between the product grid and the calculator, so the page isn't
 * wall-to-wall cards. Renders as a centered statement today and upgrades to a
 * two-column layout with photography the moment SITE_IMAGES.homeFamilyBand is
 * filled in — no code change needed.
 */
export function FamilyBand() {
  const img = SITE_IMAGES.homeFamilyBand;
  const withPhoto = hasImage(img);

  return (
    <section className="py-12 lg:py-20 bg-gradient-to-b from-[#FDFBF7] to-[#F6F0E2]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 gap-10 lg:gap-16 items-center ${
            withPhoto ? "lg:grid-cols-2" : ""
          }`}
        >
          <div className={withPhoto ? "" : "max-w-2xl mx-auto text-center"}>
            <Reveal>
              <p className="text-sm font-medium uppercase tracking-wider text-[#C5A059] mb-3">
                Why It Matters
              </p>
            </Reveal>
            <StampHeading
              text="Nobody buys insurance"
              accent="for themselves"
              className="text-3xl sm:text-4xl font-display font-normal text-[#2C2C2C] mb-5"
            />
            <Reveal delay={0.12}>
              <p className="text-lg text-[#2C2C2C]/70 leading-relaxed mb-4">
                You buy it for the people who'd have to figure everything out without you. For the kids who
                get to stay in the same school. For the person who shouldn't have to sell the house in the
                worst month of their life.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="text-[#2C2C2C]/60 leading-relaxed mb-7">
                That's the whole job. A licensed agent who takes the time to understand your family, then
                builds the coverage around them — and stays reachable long after the policy is signed.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <Link href="/products">
                <span
                  className={`inline-flex items-center gap-1.5 text-base font-medium text-[#2C2C2C] hover:gap-2.5 transition-all cursor-pointer ${
                    withPhoto ? "" : "justify-center"
                  }`}
                >
                  See how we protect families
                  <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                </span>
              </Link>
            </Reveal>
          </div>

          {withPhoto && (
            <Reveal delay={0.1} y={24}>
              <div className="relative">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-auto rounded-3xl border border-[#E8E4DC] shadow-[0_20px_50px_-20px_rgba(197,160,89,0.4)]"
                  loading="lazy"
                />
                {hasImage(SITE_IMAGES.familyBandOverlay) && (
                  <img
                    src={SITE_IMAGES.familyBandOverlay.src}
                    alt={SITE_IMAGES.familyBandOverlay.alt}
                    className="absolute -bottom-6 -left-4 sm:-left-8 w-36 sm:w-48 aspect-[4/3] object-cover rounded-2xl border-4 border-white shadow-xl -rotate-3"
                    loading="lazy"
                  />
                )}
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
