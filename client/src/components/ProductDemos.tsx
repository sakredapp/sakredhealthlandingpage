import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

/**
 * Animated process vignettes — one per product — showing what the coverage
 * actually *does*: the mortgage draining to $0, the funeral bill being paid,
 * monthly annuity checks arriving, a payout funding the family, a doctor's
 * bill shrinking. Pure framer-motion + rAF, no external services.
 *
 * All demos: loop while on screen, pause off screen, and render their final
 * "resolved" state statically under prefers-reduced-motion.
 */

const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;

/** Cycle through phases 0..durations.length-1 while enabled; hold last phase when disabled. */
function usePhaseLoop(durations: number[], enabled: boolean, holdLast: boolean): number {
  const [phase, setPhase] = useState(holdLast ? durations.length - 1 : 0);
  useEffect(() => {
    if (!enabled) return;
    setPhase(0);
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const next = () => {
      t = setTimeout(() => {
        i = (i + 1) % durations.length;
        setPhase(i);
        next();
      }, durations[i]);
    };
    next();
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
  return enabled ? phase : durations.length - 1;
}

/** Number that eases from `from` to `to` whenever `play` flips true. */
function Rolling({ from, to, play, duration = 1400, prefix = "$" }: {
  from: number; to: number; play: boolean; duration?: number; prefix?: string;
}) {
  const [val, setVal] = useState(play ? from : to);
  useEffect(() => {
    if (!play) { setVal(to); return; }
    setVal(from);
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, from, to, duration]);
  return <span className="tabular-nums">{prefix}{Math.round(val).toLocaleString()}</span>;
}

function Shell({ label, children, footer }: { label: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#E8E4DC] bg-white shadow-[0_16px_40px_-20px_rgba(197,160,89,0.4)] overflow-hidden">
      <div className="px-5 py-3 bg-[#F6F4EF] border-b border-[#E8E4DC]">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#C5A059]">{label}</span>
      </div>
      <div className="p-5">{children}</div>
      {footer && <div className="px-5 pb-5">{footer}</div>}
    </div>
  );
}

function Resolved({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 6 }}
      transition={{ duration: 0.35 }}
      className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3"
    >
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
        <Check className="w-3 h-3 text-white" />
      </span>
      <span className="text-sm font-medium text-emerald-800">{children}</span>
    </motion.div>
  );
}

function useDemoState(count: number, durations: number[]) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const enabled = !reduced && inView;
  const phase = usePhaseLoop(durations, enabled, !!reduced);
  return { ref, phase, reduced: !!reduced };
}

/* ---------------- Mortgage Protection ---------------- */
export function MortgageDemo() {
  // 0 wait · 1 payout chip · 2 balance drains · 3 resolved (hold)
  const { ref, phase } = useDemoState(4, [1200, 900, 1700, 3600]);
  return (
    <div ref={ref}>
      <Shell label="If something happens to you">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm text-[#2C2C2C]/60">Remaining mortgage balance</span>
        </div>
        <p className="font-display font-bold text-4xl text-[#2C2C2C] mb-3">
          <Rolling from={284_000} to={phase >= 3 ? 0 : phase === 2 ? 0 : 284_000} play={phase === 2} duration={1600} />
        </p>
        <motion.div
          initial={false}
          animate={{ opacity: phase >= 1 ? 1 : 0, x: phase >= 1 ? 0 : -8 }}
          className="inline-flex items-center gap-2 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/30 px-3 py-1.5 mb-4"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
          <span className="text-xs font-medium text-[#2C2C2C]/75">Mortgage protection payout applied</span>
        </motion.div>
        <Resolved show={phase >= 3}>The house is theirs — free and clear</Resolved>
      </Shell>
    </div>
  );
}

/* ---------------- Final Expense ---------------- */
const FE_ITEMS = [
  { name: "Casket", cost: 2_400 },
  { name: "Funeral service", cost: 1_800 },
  { name: "Burial plot", cost: 1_500 },
  { name: "Headstone", cost: 1_200 },
  { name: "Flowers & notices", cost: 900 },
];
const FE_TOTAL = FE_ITEMS.reduce((s, i) => s + i.cost, 0);

export function FinalExpenseDemo() {
  // 0-4 items appear · 5 total · 6 policy pays (rows flip) · 7 resolved
  const { ref, phase } = useDemoState(8, [500, 420, 420, 420, 420, 1100, 1500, 3600]);
  return (
    <div ref={ref}>
      <Shell label="What a goodbye actually costs">
        <ul className="space-y-1.5 mb-3">
          {FE_ITEMS.map((item, i) => {
            const visible = phase >= i;
            const paid = phase >= 6;
            return (
              <motion.li
                key={item.name}
                initial={false}
                animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -8 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-between text-sm"
              >
                <span className={paid ? "text-[#2C2C2C]/40 line-through" : "text-[#2C2C2C]/75"}>{item.name}</span>
                <span className={`tabular-nums ${paid ? "text-emerald-600 font-medium" : "text-[#2C2C2C]"}`}>
                  {paid ? "Paid ✓" : usd(item.cost)}
                </span>
              </motion.li>
            );
          })}
        </ul>
        <div className="flex items-center justify-between border-t border-[#E8E4DC] pt-3 mb-4">
          <span className="text-sm font-medium text-[#2C2C2C]">Family owes</span>
          <span className="font-display font-bold text-2xl text-[#2C2C2C]">
            <Rolling from={FE_TOTAL} to={phase >= 6 ? 0 : FE_TOTAL} play={phase === 6} duration={1300} />
          </span>
        </div>
        <Resolved show={phase >= 7}>They get to grieve — not fundraise</Resolved>
      </Shell>
    </div>
  );
}

/* ---------------- Annuities ---------------- */
const MONTHS = ["January", "February", "March", "April", "May", "June"];
export function AnnuityDemo() {
  // phases 0..5 add a deposit each; 6 resolved hold
  const { ref, phase } = useDemoState(7, [900, 900, 900, 900, 900, 900, 3800]);
  const shown = Math.min(phase + 1, MONTHS.length);
  return (
    <div ref={ref}>
      <Shell label="Guaranteed monthly income">
        <ul className="space-y-1.5 mb-4 min-h-[168px]">
          {MONTHS.slice(0, shown).map((m) => (
            <motion.li
              key={m}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between text-sm rounded-lg bg-[#F6F4EF] px-3 py-2"
            >
              <span className="text-[#2C2C2C]/70">{m}</span>
              <span className="font-medium text-emerald-700 tabular-nums">+ $2,150 deposited ✓</span>
            </motion.li>
          ))}
        </ul>
        <Resolved show={phase >= 6}>Every month. For life. Regardless of the market.</Resolved>
      </Shell>
    </div>
  );
}

/* ---------------- General Life ---------------- */
const GL_ALLOC = [
  { name: "Mortgage cleared", pct: 40 },
  { name: "College fund", pct: 30 },
  { name: "Years of income replaced", pct: 30 },
];
export function GeneralLifeDemo() {
  // 0 wait · 1 payout counts · 2-4 bars fill · 5 resolved
  const { ref, phase } = useDemoState(6, [900, 1500, 700, 700, 700, 3800]);
  return (
    <div ref={ref}>
      <Shell label="What a policy can do">
        <p className="text-sm text-[#2C2C2C]/60 mb-1">Benefit paid to your family</p>
        <p className="font-display font-bold text-4xl text-[#2C2C2C] mb-4">
          <Rolling from={0} to={500_000} play={phase === 1} duration={1400} />
        </p>
        <div className="space-y-3 mb-4">
          {GL_ALLOC.map((a, i) => {
            const on = phase >= i + 2;
            return (
              <div key={a.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#2C2C2C]/70">{a.name}</span>
                  {on && <Check className="w-3.5 h-3.5 text-[#C5A059]" />}
                </div>
                <div className="h-2 rounded-full bg-[#F0EBE1] overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: on ? `${a.pct + 55}%` : "0%" }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-[#C5A059] to-[#EBD598]"
                  />
                </div>
              </div>
            );
          })}
        </div>
        <Resolved show={phase >= 5}>The paycheck that keeps showing up</Resolved>
      </Shell>
    </div>
  );
}

/* ---------------- Private Health ---------------- */
export function HealthDemo() {
  // 0 bill · 1 plan pays chip · 2 balance shrinks · 3 resolved
  const { ref, phase } = useDemoState(4, [1300, 900, 1600, 3600]);
  return (
    <div ref={ref}>
      <Shell label="An ER visit, with coverage">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-[#2C2C2C]/70">Emergency room bill</span>
          <span className="tabular-nums text-[#2C2C2C]">{usd(3_850)}</span>
        </div>
        <motion.div
          initial={false}
          animate={{ opacity: phase >= 1 ? 1 : 0, x: phase >= 1 ? 0 : -8 }}
          className="flex items-center justify-between text-sm mb-3 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/25 px-3 py-2"
        >
          <span className="text-[#2C2C2C]/75 font-medium">Your plan pays</span>
          <span className="tabular-nums text-[#2C2C2C] font-medium">− {usd(3_320)}</span>
        </motion.div>
        <div className="flex items-baseline justify-between border-t border-[#E8E4DC] pt-3 mb-4">
          <span className="text-sm font-medium text-[#2C2C2C]">You pay</span>
          <span className="font-display font-bold text-3xl text-[#2C2C2C]">
            <Rolling from={3_850} to={phase >= 2 ? 530 : 3_850} play={phase === 2} duration={1400} />
          </span>
        </div>
        <Resolved show={phase >= 3}>A bad day — not a financial event</Resolved>
      </Shell>
    </div>
  );
}

/* ---------------- ACA ---------------- */
export function AcaDemo() {
  // 0 premium · 1 subsidy chip · 2 premium shrinks · 3 resolved
  const { ref, phase } = useDemoState(4, [1300, 900, 1600, 3600]);
  return (
    <div ref={ref}>
      <Shell label="The subsidy check most people skip">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-[#2C2C2C]/70">Marketplace premium</span>
          <span className="tabular-nums text-[#2C2C2C]">$612/mo</span>
        </div>
        <motion.div
          initial={false}
          animate={{ opacity: phase >= 1 ? 1 : 0, x: phase >= 1 ? 0 : -8 }}
          className="flex items-center justify-between text-sm mb-3 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/25 px-3 py-2"
        >
          <span className="text-[#2C2C2C]/75 font-medium">Premium tax credit applied</span>
          <span className="tabular-nums text-[#2C2C2C] font-medium">− $464/mo</span>
        </motion.div>
        <div className="flex items-baseline justify-between border-t border-[#E8E4DC] pt-3 mb-4">
          <span className="text-sm font-medium text-[#2C2C2C]">You pay</span>
          <span className="font-display font-bold text-3xl text-[#2C2C2C]">
            <Rolling from={612} to={phase >= 2 ? 148 : 612} play={phase === 2} duration={1400} />
            <span className="text-base font-normal text-[#2C2C2C]/50">/mo</span>
          </span>
        </div>
        <Resolved show={phase >= 3}>Same plan — a fraction of the sticker price</Resolved>
      </Shell>
    </div>
  );
}

/** Illustrative-numbers disclaimer every demo needs. */
export function DemoDisclaimer() {
  return (
    <p className="text-[11px] text-[#2C2C2C]/40 mt-2">
      Example for illustration only — not a quote, rate, or guarantee. Actual figures depend on your
      plan, age, health, and carrier.
    </p>
  );
}

export function ProductDemo({ slug }: { slug: string }) {
  const demo =
    slug === "mortgage-protection" ? <MortgageDemo /> :
    slug === "final-expense" ? <FinalExpenseDemo /> :
    slug === "retirement-annuities" ? <AnnuityDemo /> :
    slug === "life-insurance" ? <GeneralLifeDemo /> :
    slug === "health-insurance" ? <HealthDemo /> :
    slug === "aca-plans" ? <AcaDemo /> :
    null;
  if (!demo) return null;
  return (
    <div>
      {demo}
      <DemoDisclaimer />
    </div>
  );
}
