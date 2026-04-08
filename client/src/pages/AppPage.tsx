import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/landing/Navigation";
import { AppShowcase } from "@/components/landing/AppShowcase";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { Testimonials } from "@/components/landing/Testimonials";
import { Footer } from "@/components/landing/Footer";
import { AppHero } from "@/components/landing/AppHero";
import { AppFAQ } from "@/components/landing/AppFAQ";
import { AppCTA } from "@/components/landing/AppCTA";
import { AppPricing } from "@/components/landing/AppPricing";
import type { Testimonial } from "@shared/schema";

export default function AppPage() {
  const { data: testimonials, isLoading: testimonialsLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials", { featured: true }],
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navigation />
      <AppHero />
      <FeaturesGrid />
      <AppShowcase />
      <Testimonials testimonials={testimonials || []} isLoading={testimonialsLoading} />
      <AppPricing />
      <AppFAQ />
      <AppCTA />
      <Footer />
    </div>
  );
}
