import { CountUp, Reveal, StampHeading } from "@/components/motion";

/**
 * Slim trust band. The plan-type deep dives and the mortgage-protection story
 * live on their product pages now (products.ts detailSections) — this section
 * just states the credentials, fast, in one clean row.
 *
 * `count` rolls the number up on scroll; anything without one is a word, not a
 * metric, and stays static. Never animate toward a number the agency can't
 * stand behind.
 */
const networkStats: { stat: string; count?: number; suffix?: string; label: string }[] = [
  { stat: "Licensed", label: "Life & health insurance agency" },
  { stat: "50", count: 50, suffix: "", label: "States with coverage options" },
  { stat: "1", label: "Dedicated agent across all your plans" },
  { stat: "$0", label: "Cost to you — carriers pay us, not clients" },
];

export function CarrierPartners() {
  return (
    <section className="py-12 lg:py-16 bg-[#F9F9F7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <StampHeading
            text="One agency,"
            accent="every box checked"
            className="font-display text-3xl sm:text-4xl font-normal text-[#2C2C2C] mb-3"
          />
          <Reveal delay={0.12}>
            <p className="text-[#2C2C2C]/60 text-base sm:text-lg max-w-2xl mx-auto">
              Health, life, and retirement through one licensed agency — and one dedicated agent who
              knows your whole picture.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-[#E8E4DC] bg-[#E8E4DC]">
          {networkStats.map((item, i) => (
            <Reveal key={item.label} delay={i * 0.06} className="bg-white">
              <div className="h-full px-6 py-8 text-center">
                <span className="block font-display font-bold text-3xl sm:text-4xl text-[#C5A059] leading-none mb-2">
                  {item.count !== undefined ? <CountUp to={item.count} suffix={item.suffix} /> : item.stat}
                </span>
                <span className="block text-sm text-[#2C2C2C]/60 leading-snug">{item.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
