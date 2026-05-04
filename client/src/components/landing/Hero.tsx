import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MapPin } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F9F9F7] pt-16">
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-[#C5A059]/20 rounded-full blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-[#EBD598]/30 rounded-full blur-3xl"
        animate={{
          x: [0, -20, 0],
          y: [0, 30, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C5A059]/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-[#C5A059]/30 shadow-sm mb-8"
        >
          <span className="text-sm font-medium text-[#2C2C2C]/80">Health & Life Insurance for Individuals, Families & Small Businesses</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-display font-normal tracking-tight text-[#2C2C2C] mb-6"
        >
          Affordable health coverage{" "}
          <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
            without the confusion
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-[#2C2C2C]/70 max-w-3xl mx-auto mb-4 leading-relaxed"
        >
          No employer plan? Don't qualify for an ACA subsidy? You're not stuck. Sakred Health connects you with private health insurance from 15+ insurance companies — with a dedicated agent who actually picks up the phone.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-base text-[#2C2C2C]/55 max-w-2xl mx-auto mb-8"
        >
          Major medical, short-term, dental & vision, Medicare, group plans, term & whole life, IULs, annuities, mortgage protection (MPI) and final expense — all through one agency, one agent, one app.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4"
        >
          <Link href="/get-coverage">
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
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-sm text-[#2C2C2C]/45"
        >
          Free consultation — no obligation, no pressure
        </motion.p>
      </div>
    </section>
  );
}
