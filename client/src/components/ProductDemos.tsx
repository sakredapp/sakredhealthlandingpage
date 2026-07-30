import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/**
 * Animated process vignettes — one per product — styled as the real-world
 * artifact each coverage acts on: a loan statement, a funeral-home invoice, a
 * bank deposit feed, an explanation of benefits, a marketplace checkout.
 * Layered micro-motion (drawn checkmarks, payment shine sweeps, a stamped
 * "PAID IN FULL", rolling balances) — pure framer-motion + rAF, no services.
 *
 * Behavior contract (do not regress):
 *  - Loops while on screen, pauses off screen.
 *  - ALWAYS paints the finished/resolved state first (no blank frames), holds
 *    a beat, then cycles.
 *  - prefers-reduced-motion renders the resolved state statically.
 */

const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;

/* ------------------------------------------------------------------ */
/* Shared kit                                                          */
/* ------------------------------------------------------------------ */

function usePhaseLoop(durations: number[], enabled: boolean): number {
  const last = durations.length - 1;
  const [phase, setPhase] = useState(last);
  useEffect(() => {
    if (!enabled) return;
    let i = last;
    setPhase(i);
    let t: ReturnType<typeof setTimeout>;
    const step = () => {
      i = (i + 1) % durations.length;
      setPhase(i);
      t = setTimeout(step, durations[i]);
    };
    t = setTimeout(step, 1800); // hold the resolved state before the first cycle
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
  return enabled ? phase : last;
}

function useDemoState(durations: number[]) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const enabled = !reduced && inView;
  const phase = usePhaseLoop(durations, enabled);
  return { ref, phase };
}

/** Number that eases from `from` to `to` whenever `play` flips true. */
function Rolling({ from, to, play, duration = 1400, prefix = "$", suffix = "" }: {
  from: number; to: number; play: boolean; duration?: number; prefix?: string; suffix?: string;
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
  return <span className="tabular-nums">{prefix}{Math.round(val).toLocaleString()}{suffix}</span>;
}

/** Checkmark that draws itself on (SVG pathLength). */
function DrawnCheck({ on, className = "", stroke = "#059669" }: { on: boolean; className?: string; stroke?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 ${className}`} aria-hidden="true">
      <motion.path
        d="M4 12.5 L9.5 18 L20 6.5"
        stroke={stroke}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

/** Gold shine that sweeps across its (relative) parent when triggered. */
function Sweep({ play }: { play: boolean }) {
  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#C5A059]/25 to-transparent"
      initial={false}
      animate={play ? { x: ["-120%", "340%"], opacity: 1 } : { x: "-120%", opacity: 0 }}
      transition={play ? { duration: 0.9, ease: "easeInOut" } : { duration: 0 }}
    />
  );
}

/** Rubber stamp that thuds down (scale + settle) when shown. */
function Stamp({ show, children, color = "#059669" }: { show: boolean; children: React.ReactNode; color?: string }) {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none"
      initial={false}
      animate={show ? { opacity: 1, scale: 1, rotate: -10 } : { opacity: 0, scale: 1.9, rotate: -2 }}
      transition={show ? { type: "spring", stiffness: 320, damping: 16 } : { duration: 0.15 }}
    >
      <span
        className="block border-[3px] rounded-md px-2.5 py-1 font-display font-bold text-sm tracking-[0.14em] uppercase"
        style={{ color, borderColor: color, opacity: 0.88 }}
      >
        {children}
      </span>
    </motion.div>
  );
}

/** Document chrome: faux statement header + body + barcode footer. */
function Doc({ kicker, title, meta, children }: {
  kicker: string; title: string; meta: string; children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-2xl border border-[#E8E4DC] bg-white shadow-[0_16px_40px_-20px_rgba(197,160,89,0.45)] overflow-hidden">
      {/* subtle second sheet behind */}
      <div aria-hidden className="absolute -bottom-1.5 left-3 right-3 h-3 rounded-b-2xl bg-[#EDE9E0]" />
      <div className="relative bg-white rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-dashed border-[#E8E4DC]">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#C5A059]">{kicker}</p>
            <p className="font-display font-semibold text-sm text-[#2C2C2C] mt-0.5">{title}</p>
          </div>
          <p className="text-[10px] text-[#2C2C2C]/40 text-right leading-tight whitespace-pre-line">{meta}</p>
        </div>
        <div className="px-5 py-4">{children}</div>
        {/* faux barcode footer */}
        <div className="flex items-center justify-between px-5 pb-3">
          <div
            aria-hidden
            className="h-4 w-24 opacity-25"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, #2C2C2C 0 1.5px, transparent 1.5px 3.5px, #2C2C2C 3.5px 6px, transparent 6px 7px)",
            }}
          />
          <span className="text-[9px] tracking-[0.18em] text-[#2C2C2C]/30 uppercase">Illustration</span>
        </div>
      </div>
    </div>
  );
}

/** Dotted-leader line item, invoice style. */
function LineItem({ label, right, dim = false }: { label: React.ReactNode; right: React.ReactNode; dim?: boolean }) {
  return (
    <div className="relative flex items-baseline gap-2 text-sm py-0.5">
      <span className={dim ? "text-[#2C2C2C]/40" : "text-[#2C2C2C]/75"}>{label}</span>
      <span className="flex-1 border-b border-dotted border-[#2C2C2C]/20 translate-y-[-3px]" />
      <span className="tabular-nums">{right}</span>
    </div>
  );
}

/** Status footer — never empty: pulsing "in progress" → drawn-check resolved. */
function Status({ done, pending, resolved }: { done: boolean; pending: string; resolved: string }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 mt-4 transition-colors duration-300 ${
        done ? "bg-emerald-50 border-emerald-200" : "bg-[#F6F4EF] border-[#E8E4DC]"
      }`}
    >
      {done ? (
        <DrawnCheck on className="flex-shrink-0" />
      ) : (
        <motion.span
          className="flex-shrink-0 w-2.5 h-2.5 mx-[3px] rounded-full bg-[#C5A059]"
          animate={{ opacity: [0.35, 1, 0.35], scale: [1, 1.15, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
      )}
      <span className={`text-sm font-medium ${done ? "text-emerald-800" : "text-[#2C2C2C]/55"}`}>
        {done ? resolved : pending}
      </span>
    </div>
  );
}

/** Animated split bar (e.g. plan pays vs you pay). */
function SplitBar({ segments, play }: { segments: { pct: number; className: string }[]; play: boolean }) {
  return (
    <div className="h-2.5 rounded-full bg-[#F0EBE1] overflow-hidden flex">
      {segments.map((s, i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{ width: play ? `${s.pct}%` : "0%" }}
          transition={{ duration: 0.7, delay: i * 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full ${s.className}`}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mortgage Protection — home loan statement                           */
/* ------------------------------------------------------------------ */
export function MortgageDemo() {
  // 0 statement · 1 payout row sweeps in · 2 balance drains + bar empties · 3 stamped + resolved
  const { ref, phase } = useDemoState([1600, 1100, 1800, 4200]);
  const draining = phase >= 2;
  return (
    <div ref={ref}>
      <Doc kicker="Home loan statement" title="Mortgage · Loan •••• 4821" meta={"Statement 07/2026\nAutopay on"}>
        <LineItem label="Principal remaining" right={<span className="text-[#2C2C2C]">{usd(271_400)}</span>} />
        <LineItem label="Interest & escrow" right={<span className="text-[#2C2C2C]">{usd(12_600)}</span>} />
        <motion.div
          initial={false}
          animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : -6 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-md -mx-1 px-1"
        >
          <Sweep play={phase === 1} />
          <LineItem
            label={<span className="font-medium text-[#B08A3E]">Sakred payout applied</span>}
            right={<span className="font-medium text-[#B08A3E]">− {usd(284_000)}</span>}
          />
        </motion.div>

        <div className="relative border-t border-[#E8E4DC] mt-2 pt-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-[#2C2C2C]">Balance due</span>
            <span className="font-display font-bold text-3xl text-[#2C2C2C]">
              <Rolling from={284_000} to={draining ? 0 : 284_000} play={phase === 2} duration={1600} />
            </span>
          </div>
          <div className="mt-2.5 h-2 rounded-full bg-[#F0EBE1] overflow-hidden">
            <motion.div
              initial={false}
              animate={{ width: draining ? "0%" : "88%" }}
              transition={{ duration: phase === 2 ? 1.6 : 0.3, ease: [0.33, 1, 0.68, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-[#C5A059] to-[#EBD598]"
            />
          </div>
          <Stamp show={phase >= 3}>Paid in full</Stamp>
        </div>

        <Status done={phase >= 3} pending="Payout being applied…" resolved="The house is theirs — free and clear" />
      </Doc>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Final Expense — funeral-home invoice                                */
/* ------------------------------------------------------------------ */
const FE_ITEMS = [
  { name: "Casket", cost: 2_400 },
  { name: "Funeral service", cost: 1_800 },
  { name: "Burial plot", cost: 1_500 },
  { name: "Headstone", cost: 1_200 },
  { name: "Flowers & notices", cost: 900 },
];
const FE_TOTAL = FE_ITEMS.reduce((s, i) => s + i.cost, 0);

export function FinalExpenseDemo() {
  // 0 invoice · 1..5 rows pay one-by-one (sweep + drawn check) · 6 total drains · 7 stamped + resolved
  const { ref, phase } = useDemoState([1500, 480, 480, 480, 480, 700, 1500, 4200]);
  return (
    <div ref={ref}>
      <Doc kicker="Invoice" title="Rosewood Funeral Home" meta={"Inv. 20189\nDue on receipt"}>
        <div className="space-y-0.5 mb-1">
          {FE_ITEMS.map((item, i) => {
            const paid = phase >= i + 1;
            return (
              <div key={item.name} className="relative overflow-hidden rounded-md -mx-1 px-1">
                <Sweep play={phase === i + 1} />
                <LineItem
                  dim={paid}
                  label={<span className={paid ? "line-through" : ""}>{item.name}</span>}
                  right={
                    paid ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                        <DrawnCheck on={paid} className="w-3.5 h-3.5" /> Paid
                      </span>
                    ) : (
                      <span className="text-[#2C2C2C]">{usd(item.cost)}</span>
                    )
                  }
                />
              </div>
            );
          })}
        </div>
        <div className="relative border-t border-[#E8E4DC] pt-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-[#2C2C2C]">Family owes</span>
            <span className="font-display font-bold text-3xl text-[#2C2C2C]">
              <Rolling from={FE_TOTAL} to={phase >= 6 ? 0 : FE_TOTAL} play={phase === 6} duration={1300} />
            </span>
          </div>
          <Stamp show={phase >= 7}>Covered</Stamp>
        </div>
        <Status done={phase >= 7} pending="Policy paying the bill…" resolved="They get to grieve — not fundraise" />
      </Doc>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Annuities — bank deposit feed with running balance                  */
/* ------------------------------------------------------------------ */
const ANN_MONTHS = ["Jan 1", "Feb 1", "Mar 1", "Apr 1", "May 1", "Jun 1"];
const ANN_DEPOSIT = 2_150;

export function AnnuityDemo() {
  // 0..5 deposits land (newest on top) · 6 resolved hold
  const { ref, phase } = useDemoState([950, 950, 950, 950, 950, 950, 4200]);
  const shown = Math.min(phase + 1, ANN_MONTHS.length);
  const balance = 18_400 + shown * ANN_DEPOSIT;
  return (
    <div ref={ref}>
      <Doc kicker="Checking · •••• 2201" title="Guaranteed income deposits" meta={"Annuity\nAuto-deposit"}>
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-xs uppercase tracking-[0.18em] text-[#2C2C2C]/45">Balance</span>
          <span className="font-display font-bold text-2xl text-[#2C2C2C]">
            <Rolling from={balance - ANN_DEPOSIT} to={balance} play={phase < 6} duration={500} />
          </span>
        </div>
        <ul className="space-y-1.5 min-h-[180px]">
          {ANN_MONTHS.slice(0, shown).map((m, i) => (
            <motion.li
              key={m}
              layout
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center justify-between text-sm rounded-lg px-3 py-2 ${
                i === shown - 1 && phase < 6 ? "bg-[#C5A059]/10 border border-[#C5A059]/25" : "bg-[#F6F4EF]"
              }`}
            >
              <span className="text-[#2C2C2C]/60">{m} · Annuity payment</span>
              <span className="font-medium text-emerald-700 tabular-nums inline-flex items-center gap-1.5">
                <DrawnCheck on className="w-3.5 h-3.5" /> +{usd(ANN_DEPOSIT)}
              </span>
            </motion.li>
          ))}
        </ul>
        <Status done={phase >= 6} pending="Deposits arriving…" resolved="Every month. For life. Regardless of the market." />
      </Doc>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* General Life — payout allocation                                    */
/* ------------------------------------------------------------------ */
const GL_ALLOC = [
  { name: "Mortgage cleared", amount: 200_000, pct: 92 },
  { name: "College fund", amount: 150_000, pct: 74 },
  { name: "Years of income replaced", amount: 150_000, pct: 74 },
];

export function GeneralLifeDemo() {
  // 0 quiet · 1 payout counts · 2-4 bars fill w/ checks · 5 resolved
  const { ref, phase } = useDemoState([1100, 1600, 750, 750, 750, 4200]);
  return (
    <div ref={ref}>
      <Doc kicker="Benefit disbursement" title="Policy •••• 0917 · Beneficiary: family" meta={"Term 20\nIn force"}>
        <p className="text-xs uppercase tracking-[0.18em] text-[#2C2C2C]/45 mb-1">Benefit paid</p>
        <p className="font-display font-bold text-4xl text-[#2C2C2C] mb-4">
          <Rolling from={0} to={500_000} play={phase === 1} duration={1500} />
        </p>
        <div className="space-y-3">
          {GL_ALLOC.map((a, i) => {
            const on = phase >= i + 2;
            return (
              <div key={a.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#2C2C2C]/70 inline-flex items-center gap-1.5">
                    <DrawnCheck on={on} className="w-3.5 h-3.5" stroke="#C5A059" />
                    {a.name}
                  </span>
                  <motion.span
                    initial={false}
                    animate={{ opacity: on ? 1 : 0 }}
                    className="tabular-nums text-[#2C2C2C]/55"
                  >
                    {usd(a.amount)}
                  </motion.span>
                </div>
                <div className="h-2 rounded-full bg-[#F0EBE1] overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: on ? `${a.pct}%` : "0%" }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-[#C5A059] to-[#EBD598]"
                  />
                </div>
              </div>
            );
          })}
        </div>
        <Status done={phase >= 5} pending="Putting the benefit to work…" resolved="The paycheck that keeps showing up" />
      </Doc>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Private Health — explanation of benefits                            */
/* ------------------------------------------------------------------ */
export function HealthDemo() {
  // 0 bill · 1 discount sweeps in · 2 plan pays sweeps in · 3 you-pay drains + bar · 4 resolved
  const { ref, phase } = useDemoState([1500, 900, 900, 1500, 4200]);
  return (
    <div ref={ref}>
      <Doc kicker="Explanation of benefits" title="Emergency room visit" meta={"Claim 88-4127\nProcessed"}>
        <LineItem label="Provider billed" right={<span className="text-[#2C2C2C]">{usd(3_850)}</span>} />
        <motion.div initial={false} animate={{ opacity: phase >= 1 ? 1 : 0 }} transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-md -mx-1 px-1">
          <Sweep play={phase === 1} />
          <LineItem dim label="Plan-negotiated discount" right={<span>− {usd(1_140)}</span>} />
        </motion.div>
        <motion.div initial={false} animate={{ opacity: phase >= 2 ? 1 : 0 }} transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-md -mx-1 px-1">
          <Sweep play={phase === 2} />
          <LineItem
            label={<span className="font-medium text-[#B08A3E]">Your plan paid</span>}
            right={<span className="font-medium text-[#B08A3E]">− {usd(2_180)}</span>}
          />
        </motion.div>

        <div className="border-t border-[#E8E4DC] mt-2 pt-3">
          <div className="flex items-baseline justify-between mb-2.5">
            <span className="text-sm font-medium text-[#2C2C2C]">You pay</span>
            <span className="font-display font-bold text-3xl text-[#2C2C2C]">
              <Rolling from={3_850} to={phase >= 3 ? 530 : 3_850} play={phase === 3} duration={1400} />
            </span>
          </div>
          <SplitBar
            play={phase >= 3}
            segments={[
              { pct: 30, className: "bg-[#EDE9E0]" },
              { pct: 56, className: "bg-gradient-to-r from-[#C5A059] to-[#EBD598]" },
              { pct: 14, className: "bg-[#2C2C2C]/70" },
            ]}
          />
          <div className="flex justify-between text-[10px] text-[#2C2C2C]/40 mt-1">
            <span>Discount</span>
            <span>Plan paid</span>
            <span>You</span>
          </div>
        </div>
        <Status done={phase >= 4} pending="Your plan is processing the claim…" resolved="A bad day — not a financial event" />
      </Doc>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ACA — marketplace checkout                                          */
/* ------------------------------------------------------------------ */
export function AcaDemo() {
  // 0 sticker price · 1 credit sweeps in · 2 you-pay drains + bar · 3 resolved
  const { ref, phase } = useDemoState([1500, 1000, 1500, 4200]);
  return (
    <div ref={ref}>
      <Doc kicker="Marketplace enrollment" title="Silver plan · Family of three" meta={"Plan year 2026\nEligible"}>
        <LineItem label="Monthly premium" right={<span className="text-[#2C2C2C]">$612/mo</span>} />
        <motion.div initial={false} animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : -6 }}
          transition={{ duration: 0.35 }} className="relative overflow-hidden rounded-md -mx-1 px-1">
          <Sweep play={phase === 1} />
          <LineItem
            label={<span className="font-medium text-[#B08A3E]">Premium tax credit</span>}
            right={<span className="font-medium text-[#B08A3E]">− $464/mo</span>}
          />
        </motion.div>

        <div className="border-t border-[#E8E4DC] mt-2 pt-3">
          <div className="flex items-baseline justify-between mb-2.5">
            <span className="text-sm font-medium text-[#2C2C2C]">You pay</span>
            <span className="font-display font-bold text-3xl text-[#2C2C2C]">
              <Rolling from={612} to={phase >= 2 ? 148 : 612} play={phase === 2} duration={1400} />
              <span className="text-base font-normal text-[#2C2C2C]/50">/mo</span>
            </span>
          </div>
          <SplitBar
            play={phase >= 2}
            segments={[
              { pct: 76, className: "bg-gradient-to-r from-[#C5A059] to-[#EBD598]" },
              { pct: 24, className: "bg-[#2C2C2C]/70" },
            ]}
          />
          <div className="flex justify-between text-[10px] text-[#2C2C2C]/40 mt-1">
            <span>Credit covers</span>
            <span>You</span>
          </div>
        </div>
        <Status done={phase >= 3} pending="Checking your subsidy…" resolved="Same plan — a fraction of the sticker price" />
      </Doc>
    </div>
  );
}

/* ------------------------------------------------------------------ */

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
