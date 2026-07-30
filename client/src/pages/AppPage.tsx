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
import { ProtocolsSection } from "@/components/landing/ProtocolsSection";
import { useSeo } from "@/lib/seo";
import type { Testimonial } from "@shared/schema";

export default function AppPage() {
  const { data: testimonials, isLoading: testimonialsLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials", { featured: true }],
  });

  useSeo({
    title: "Health App with Guided Detox, Gut & Sleep Routines | Sakred Health",
    description:
      "Follow guided multi-day wellness protocols — liver detox, gut reset, lymphatic drainage, and sleep — with daily habit tracking, streaks, reminders, and wearable sync. Plus your policy and agent in the same app.",
    canonical: "/app",
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navigation />
      <AppHero />
      <AppShowcase />
      <AppCTA />
      <ProtocolsSection />
      <FeaturesGrid />
      <Testimonials testimonials={testimonials || []} isLoading={testimonialsLoading} />
      <AppPricing />
      <AppFAQ />
      <Footer />
    </div>
  );
}
