import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { Reveal, StampHeading } from "@/components/motion";
import { SITE_IMAGES, hasImage } from "@/data/site-images";

const steps = [
  {
    n: "01",
    title: "Request a quote",
    detail: "Enter your zip and answer a few quick questions — takes about two minutes.",
  },
  {
    n: "02",
    title: "We compare your options",
    detail: "Your dedicated agent shops health and life plans matched to your budget and situation.",
  },
  {
    n: "03",
    title: "You pick a plan",
    detail: "Clear, plain-language options side by side — no jargon, no pressure to decide.",
  },
  {
    n: "04",
    title: "You're covered",
    detail: "We handle enrollment and stay on as your agent for claims, questions, and renewals.",
  },
];

/**
 * Staged walker: each step lights in turn on a loop, completed steps stay marked,
 * so the whole path reads at a glance. Gated on visibility (no animation off-screen)
 * and honors reduced motion by showing every step as already done, no loop.
 */
export function HowGettingCoveredWorks() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  // current = index of the step currently lighting up; steps before it are "done".
  // current === steps.length means all four are done (the held finished state).
  const [current, setCurrent] = useState(reduced ? steps.length : -1);

  useEffect(() => {
    if (reduced || !inView) return;

    let timers: ReturnType<typeof setTimeout>[] = [];
    const at = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    function run() {
      let t = 350;
      steps.forEach((_, i) => {
        at(() => setCurrent(i), t);
        t += 1150;
      });
      at(() => setCurrent(steps.length), t); // mark last done
      at(run, t + 3200); // hold the finished state, then loop
    }
    run();

    return () => timers.forEach(clearTimeout);
  }, [inView, reduced]);

  const photo = SITE_IMAGES.howItWorks;
  const withPhoto = hasImage(photo);

  return (
    <section className="py-12 lg:py-20 bg-[#FDFBF7]">
      <div className={`${withPhoto ? "max-w-6xl" : "max-w-3xl"} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="text-center mb-10">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-wider text-[#C5A059] mb-3">How It Works</p>
          </Reveal>
          <StampHeading
            text="Getting covered,"
            accent="step by step"
            className="text-3xl sm:text-4xl font-display font-normal text-[#2C2C2C] mb-4"
          />
          <Reveal delay={0.12}>
            <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
              No forms to decode, no call centers. A real agent walks you through it.
            </p>
          </Reveal>
        </div>

        <div className={withPhoto ? "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start" : ""}>
        {withPhoto && (
          <Reveal delay={0.1} y={24} className="order-last lg:order-first">
            <div className="lg:sticky lg:top-28">
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-64 sm:h-80 lg:h-[440px] object-cover rounded-3xl border border-[#E8E4DC] shadow-[0_20px_50px_-25px_rgba(197,160,89,0.45)]"
                loading="lazy"
              />
            </div>
          </Reveal>
        )}

        <div ref={ref} className="space-y-3">
          {steps.map((step, i) => {
            const isDone = i < current;
            const isOn = i === current;
            return (
              <Reveal key={step.n} delay={Math.min(i * 0.07, 0.28)}>
                <div
                  className={`flex items-start gap-4 rounded-2xl border p-5 sm:p-6 transition-all duration-300 ${
                    isOn
                      ? "border-[#C5A059] bg-[#FBF7EE] shadow-[0_8px_30px_rgba(197,160,89,0.14)]"
                      : isDone
                        ? "border-[#C5A059]/30 bg-white"
                        : "border-[#E8E4DC] bg-white"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm transition-all duration-300 ${
                      isDone
                        ? "bg-gradient-to-br from-[#C5A059] to-[#EBD598] text-white"
                        : isOn
                          ? "bg-[#C5A059]/15 text-[#C5A059] ring-2 ring-[#C5A059]"
                          : "bg-[#F2EEE6] text-[#2C2C2C]/50"
                    }`}
                  >
                    {isDone ? <Check className="w-5 h-5" /> : step.n}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-display font-semibold text-[#2C2C2C] text-base mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#2C2C2C]/65 leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
}
