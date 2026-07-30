import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { PROTOCOLS } from "@/data/protocols";

/**
 * The guided programs inside the app, rendered as real crawlable content —
 * this is the surface that answers "detox routine", "gut reset", and
 * "lymphatic drainage" searches, with each card linking to its full guide.
 */
export function ProtocolsSection() {
  return (
    <section id="protocols" className="py-12 lg:py-20 bg-[#FDFBF7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-12 h-1 bg-gradient-to-r from-[#C5A059] to-[#EBD598] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-display font-normal text-[#2C2C2C] mb-4">
            Guided programs,{" "}
            <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
              scheduled day by day
            </span>
          </h2>
          <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
            Multi-day protocols for sleep, gut, liver, and lymphatic health. The app schedules
            each practice on the right day, tracks your streak, and pairs every program with a
            written guide — so you follow a plan instead of assembling one.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PROTOCOLS.map((protocol, index) => (
            <motion.article
              key={protocol.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (index % 2) * 0.08 }}
              className="group bg-white rounded-2xl border border-[#E8E4DC] p-6 hover:border-[#C5A059]/40 hover:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#C5A059]">
                  {protocol.days} days
                </span>
                <span className="text-[#2C2C2C]/20">·</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#2C2C2C]/45">
                  {protocol.goal}
                </span>
              </div>

              <h3 className="font-display text-xl text-[#2C2C2C] mb-2">{protocol.name}</h3>
              <p className="text-sm text-[#2C2C2C]/65 leading-relaxed mb-4">{protocol.summary}</p>

              <ul className="space-y-1.5 mb-5">
                {protocol.practices.slice(0, 4).map((practice) => (
                  <li key={practice} className="flex gap-2 text-sm text-[#2C2C2C]/70">
                    <span className="mt-[7px] w-1 h-1 rounded-full bg-[#C5A059] shrink-0" />
                    <span>{practice}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/blog/${protocol.postSlug}`}
                className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-[#2C2C2C]/75 hover:text-[#2C2C2C] transition-colors"
              >
                Read the full {protocol.days}-day guide
                <ArrowRight className="w-4 h-4 text-[#C5A059] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
