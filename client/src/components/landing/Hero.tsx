import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MapPin, ArrowRight } from "lucide-react";
import { AmbientBlob, StampHeading, fadeUp } from "@/components/motion";

/* The three policies a family stacks with us — rendered as document cards
   that file themselves into a pile, like a desk at the home office. */
const POLICIES = [
  { title: "Health Plan", line: "PPO network · family of four", rotate: -7, x: -36, y: 0 },
  { title: "Mortgage Protection", line: "Matched to a 30-year note", rotate: 4, x: 28, y: 64 },
  { title: "Retirement Annuity", line: "Guaranteed lifetime income", rotate: -2, x: -10, y: 128 },
];

function PolicyCard({
  policy,
  index,
}: {
  policy: (typeof POLICIES)[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotate: policy.rotate - 8, scale: 0.96 }}
      animate={{ opacity: 1, y: policy.y, rotate: policy.rotate, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 16, delay: 0.55 + index * 0.28 }}
      style={{ x: policy.x, zIndex: index + 1 }}
      className="absolute left-1/2 top-0 -ml-36 w-72"
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 5.5 + index, repeat: Infinity, ease: "easeInOut", delay: index * 0.8 }}
        className="rounded-2xl bg-white border border-[#E8E4DC] shadow-[0_18px_40px_-18px_rgba(44,44,44,0.25)] p-5"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#C5A059] mb-1">
              Sakred Health · Policy
            </p>
            <h3 className="font-display text-lg text-[#2C2C2C] leading-tight">{policy.title}</h3>
          </div>
          <span className="shrink-0 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/25 px-2.5 py-0.5 text-[10px] font-medium text-[#8a6d33] mt-0.5">
            Active
          </span>
        </div>
        <p className="text-xs text-[#2C2C2C]/55 mb-4">{policy.line}</p>
        <div className="space-y-1.5 mb-4">
          <div className="h-1.5 rounded-full bg-[#F0EDE6] w-4/5" />
          <div className="h-1.5 rounded-full bg-[#F0EDE6] w-3/5" />
        </div>
        <div className="flex items-end justify-between">
          <div className="h-1.5 rounded-full bg-[#F0EDE6] w-1/4" />
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C5A059] to-[#EBD598] flex items-center justify-center shadow-sm">
            <div className="w-4 h-4 rounded-full border border-white/60" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PolicyStack() {
  return (
    <div className="relative h-[380px] sm:h-[420px] w-full max-w-md mx-auto" aria-hidden="true">
      {/* soft desk glow behind the pile */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#C5A059]/15 rounded-full blur-3xl" />

      {POLICIES.map((p, i) => (
        <PolicyCard key={p.title} policy={p} index={i} />
      ))}

      {/* proof chip clips onto the pile last */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 1.7 }}
        className="absolute left-1/2 -translate-x-1/2 bottom-2 z-10"
      >
        <div className="flex items-center gap-2 rounded-full bg-[#2C2C2C] text-white pl-3 pr-4 py-2 shadow-lg shadow-[#2C2C2C]/20">
          <MapPin className="w-3.5 h-3.5 text-[#EBD598]" />
          <span className="text-xs font-medium tracking-wide whitespace-nowrap">Licensed in all 50 states</span>
        </div>
      </motion.div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F9F9F7] pt-28 pb-16 lg:pt-16 lg:pb-0 lg:min-h-screen lg:flex lg:items-center">
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

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Copy column */}
          <div className="text-center lg:text-left">
            <motion.div
              {...fadeUp(0)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-[#C5A059]/30 shadow-sm mb-8"
            >
              <span className="text-xs sm:text-sm font-medium text-[#2C2C2C]/80">
                Mortgage Protection · Life · Health · Retirement
              </span>
            </motion.div>

            <StampHeading
              as="h1"
              text="Your whole life,"
              accent="covered."
              delay={0.1}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-normal tracking-tight text-[#2C2C2C] mb-6"
            />

            <motion.p
              {...fadeUp(0.35)}
              className="text-lg sm:text-xl text-[#2C2C2C]/70 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              The health plan, the mortgage protection, and the retirement income behind it —
              built together by one dedicated agent who knows your family.
            </motion.p>

            <motion.div
              {...fadeUp(0.5)}
              className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4 mb-4"
            >
              <Link href="/products">
                <Button
                  size="lg"
                  className="rounded-full btn-gold-gradient text-[#2C2C2C] px-7 py-5 text-base font-normal shadow-md shadow-[#C5A059]/25 hover:shadow-[#C5A059]/45 hover:-translate-y-0.5 transition-all border border-[#C5A059]"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  See Plans in Your Area
                </Button>
              </Link>
              <Link
                href="/get-coverage"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#2C2C2C]/70 hover:text-[#2C2C2C] transition-colors"
              >
                Get a free quote
                <ArrowRight className="w-4 h-4 text-[#C5A059] group-hover:translate-x-0.5 transition-transform" />
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

          {/* Visual column */}
          <div className="lg:pl-8">
            <PolicyStack />
          </div>
        </div>
      </div>
    </section>
  );
}
