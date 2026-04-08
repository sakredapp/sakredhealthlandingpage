import { Navigation } from "@/components/landing/Navigation";
import { Hero } from "@/components/landing/Hero";
import { InsuranceFeatures } from "@/components/landing/InsuranceFeatures";
import { WhoWeHelp } from "@/components/landing/WhoWeHelp";
import { CarrierPartners } from "@/components/landing/CarrierPartners";
import { WhyPrivate } from "@/components/landing/WhyPrivate";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navigation />
      <Hero />
      <WhoWeHelp />
      <InsuranceFeatures />
      <CarrierPartners />
      <WhyPrivate />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
