import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MapPin } from "lucide-react";
import { AmbientBlob, Reveal, StampHeading } from "@/components/motion";

export function FinalCTA() {
  return (
    <section className="py-12 lg:py-20 bg-gradient-to-b from-[#F6F4EF] to-[#EDE9E0] relative overflow-hidden">
      <AmbientBlob
        className="absolute top-0 left-1/4 w-96 h-96 bg-[#C5A059]/8 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        duration={8}
      />
      <AmbientBlob
        className="absolute bottom-0 right-1/4 w-72 h-72 bg-[#EBD598]/15 rounded-full blur-3xl"
        animate={{ scale: [1, 0.9, 1], opacity: [0.3, 0.4, 0.3] }}
        duration={10}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <StampHeading
          text="Healthcare coverage"
          accent="that works for you"
          className="text-3xl sm:text-4xl lg:text-5xl font-display font-normal text-[#2C2C2C] mb-6"
        />

        <Reveal delay={0.14}>
          <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto mb-10">
            Stop overpaying for coverage you don't understand. Get a dedicated agent, a plan that fits your budget, and a portal to manage it all — in under 5 minutes.
          </p>
        </Reveal>

        <Reveal delay={0.22} className="mb-10">
          <Link href="/get-coverage">
            <Button
              size="lg"
              className="rounded-full btn-gold-gradient text-[#2C2C2C] px-10 py-7 text-lg font-normal shadow-lg shadow-[#C5A059]/20 hover:shadow-[#C5A059]/40 hover:-translate-y-0.5 transition-all border border-[#C5A059]"
            >
              <MapPin className="w-5 h-5 mr-2" />
              See Plans in Your Area
            </Button>
          </Link>
          <p className="text-sm text-[#2C2C2C]/50 mt-4">
            Free consultation — no obligation, no pressure
          </p>
        </Reveal>
      </div>
    </section>
  );
}
