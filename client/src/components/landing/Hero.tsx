import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MapPin } from "lucide-react";
import { AmbientBlob, StampHeading, fadeUp } from "@/components/motion";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F9F9F7] pt-16">
      <AmbientBlob
        className="absolute top-20 left-10 w-72 h-72 bg-[#C5A059]/20 rounded-full blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        duration={8}
      />
      <AmbientBlob
        className="absolute bottom-20 right-10 w-96 h-96 bg-[#EBD598]/30 rounded-full blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 0.9, 1] }}
        duration={10}
      />
      <AmbientBlob
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C5A059]/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        duration={12}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          {...fadeUp(0)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-[#C5A059]/30 shadow-sm mb-8"
        >
          <span className="text-sm font-medium text-[#2C2C2C]/80">Mortgage Protection · Life · Health · Retirement</span>
        </motion.div>

        <StampHeading
          as="h1"
          text="Your whole life,"
          accent="covered."
          delay={0.1}
          className="text-4xl sm:text-5xl lg:text-6xl font-display font-normal tracking-tight text-[#2C2C2C] mb-6"
        />

        {/* One line only — the headline does the work. */}
        <motion.p
          {...fadeUp(0.35)}
          className="text-lg sm:text-xl text-[#2C2C2C]/70 max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          Health, home, and family — one agency, one agent, all 50 states.
        </motion.p>

        <motion.div
          {...fadeUp(0.5)}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4"
        >
          <Link href="/products">
            <Button
              size="lg"
              className="rounded-full btn-gold-gradient text-[#2C2C2C] px-10 py-7 text-lg font-normal shadow-lg shadow-[#C5A059]/30 hover:shadow-[#C5A059]/50 hover:-translate-y-0.5 transition-all border border-[#C5A059]"
            >
              <MapPin className="w-5 h-5 mr-2" />
              See Plans in Your Area
            </Button>
          </Link>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-sm text-[#2C2C2C]/45"
        >
          Free consultation — no obligation, no pressure
        </motion.p>
      </div>
    </section>
  );
}
