import { Navigation } from "@/components/landing/Navigation";
import { Hero } from "@/components/landing/Hero";
import { ProductsOverview } from "@/components/landing/ProductsOverview";
import { InsuranceFeatures } from "@/components/landing/InsuranceFeatures";
import { WhoWeHelp } from "@/components/landing/WhoWeHelp";
import { HowGettingCoveredWorks } from "@/components/landing/HowGettingCoveredWorks";
import { CarrierPartners } from "@/components/landing/CarrierPartners";
import { FamilyBand } from "@/components/landing/FamilyBand";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { ScrollProgress } from "@/components/motion";
import { useSeo } from "@/lib/seo";

export default function Landing() {
  useSeo({
    title: "Sakred Health — Mortgage Protection, Life & Health Insurance in All 50 States",
    description:
      "A licensed agency covering mortgage protection, life, final expense, health, and retirement annuities — with a dedicated agent who builds coverage around your family. Free consultation, no obligation.",
    canonical: "/",
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navigation />
      <ScrollProgress />
      <Hero />
      {/* Products up front: the home page should answer "what do you do?" before
          it starts arguing for any single product. */}
      <ProductsOverview />
      <WhoWeHelp />
      <HowGettingCoveredWorks />
      <CarrierPartners />
      <FamilyBand />
      <InsuranceFeatures />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
