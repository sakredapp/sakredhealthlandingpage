import { Navigation } from "@/components/landing/Navigation";
import { Hero } from "@/components/landing/Hero";
import { InsuranceFeatures } from "@/components/landing/InsuranceFeatures";
import { WhoWeHelp } from "@/components/landing/WhoWeHelp";
import { HowGettingCoveredWorks } from "@/components/landing/HowGettingCoveredWorks";
import { CarrierPartners } from "@/components/landing/CarrierPartners";
import { WhyPrivate } from "@/components/landing/WhyPrivate";
import { CoverageCalculator } from "@/components/landing/CoverageCalculator";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { ScrollProgress } from "@/components/motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navigation />
      <ScrollProgress />
      <Hero />
      <WhoWeHelp />
      <HowGettingCoveredWorks />
      <CarrierPartners />
      <WhyPrivate />
      <CoverageCalculator />
      <InsuranceFeatures />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
