import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/landing/Navigation";
import { Hero } from "@/components/landing/Hero";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { WhoWeHelp } from "@/components/landing/WhoWeHelp";
import { CarrierPartners } from "@/components/landing/CarrierPartners";
import { AppShowcase } from "@/components/landing/AppShowcase";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import type { Testimonial } from "@shared/schema";

export default function Landing() {
  const { data: testimonials, isLoading: testimonialsLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials", { featured: true }],
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navigation />
      <Hero />
      <FeaturesGrid />
      <WhoWeHelp />
      <CarrierPartners />
      <AppShowcase />
      <Testimonials testimonials={testimonials || []} isLoading={testimonialsLoading} />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
