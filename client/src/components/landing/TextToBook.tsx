import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MessageSquareText, Clock, CalendarCheck } from "lucide-react";
import { Reveal, StampHeading } from "@/components/motion";

/**
 * Prefer-to-text section: a real click-to-text button plus an animated sample
 * thread showing how a prospect can handle everything over text.
 *
 * The number is resolved per-visitor by /api/local-number, which reads the
 * visitor's state from Vercel's geo headers and returns the matching local DID
 * (falling back to a general number). While the CRM numbers aren't populated
 * yet the API returns null and the button falls back to /get-coverage, so
 * nothing is ever broken in production.
 */
// The general home CTA has NO keyword on purpose. A matched keyword makes the
// CRM open an AI session with product_intent_locked = true — right for product
// pages (the page IS the visitor's intent) but wrong here: an undeclared visitor
// would get locked into a product the AI won't correct off. No keyword = lead
// still created + attributed to the home page, just unassigned for human triage
// (the safe failure). Set this to the general keyword once the CRM provides it.
const SMS_KEYWORD: string = "";

type Msg = { from: "user" | "agent"; text: string };

const THREAD: Msg[] = [
  { from: "user", text: "Hi! I need health coverage — no employer plan. Do you cover Texas?" },
  { from: "agent", text: "We do! Is this just for you, or the whole family?" },
  { from: "user", text: "Me, my wife, and two kids." },
  { from: "agent", text: "Perfect. I can line up a few budget-friendly options. Easier to text or hop on a quick call?" },
  { from: "user", text: "Text is way easier 🙂" },
  { from: "agent", text: "You got it — I'll send 3 plans this afternoon, and I've booked us a 10-min follow-up for Tue at 2pm ✓" },
];

function TypingDots() {
  return (
    <span className="inline-flex gap-1 py-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#2C2C2C]/40"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </span>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.from === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-br from-[#C5A059] to-[#B8944D] text-white rounded-br-md"
            : "bg-white text-[#2C2C2C] border border-[#E8E4DC] rounded-bl-md"
        }`}
      >
        {msg.text}
      </div>
    </div>
  );
}

function ThreadPlayer() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [count, setCount] = useState(reduced ? THREAD.length : 0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (reduced || !inView) return;

    let timers: ReturnType<typeof setTimeout>[] = [];
    const at = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    function play() {
      setCount(0);
      setTyping(false);
      let t = 600;
      THREAD.forEach((m, i) => {
        if (m.from === "agent") {
          at(() => setTyping(true), t);
          t += 1000;
          at(() => {
            setTyping(false);
            setCount(i + 1);
          }, t);
          t += 500;
        } else {
          t += 750;
          at(() => setCount(i + 1), t);
          t += 200;
        }
      });
      at(play, t + 4500); // hold finished thread, then loop
    }
    play();

    return () => timers.forEach(clearTimeout);
  }, [inView, reduced]);

  const shown = THREAD.slice(0, count);

  return (
    <div
      ref={ref}
      className="rounded-[2rem] border border-[#E8E4DC] bg-[#F6F4EF] shadow-[0_20px_50px_-20px_rgba(197,160,89,0.35)] overflow-hidden"
    >
      {/* header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-[#E8E4DC]">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C5A059] to-[#EBD598] flex items-center justify-center text-white font-display font-bold text-sm">
          S
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-[#2C2C2C]">Sakred Health</p>
          <p className="text-xs text-[#2C2C2C]/50">Typically replies in minutes</p>
        </div>
      </div>

      {/* messages: fixed height, bottom-anchored, top fade so overflow doesn't hard-cut */}
      <div
        className="relative h-[320px] px-4 py-4 flex flex-col justify-end gap-2.5"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0, #000 42px, #000 100%)",
          maskImage: "linear-gradient(to bottom, transparent 0, #000 42px, #000 100%)",
        }}
      >
        {shown.map((m, i) => (
          <motion.div
            key={i}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            <Bubble msg={m} />
          </motion.div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-white border border-[#E8E4DC] px-4">
              <TypingDots />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function TextToBook() {
  const [number, setNumber] = useState<string | null>(null);
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/local-number")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.number) return;
        setNumber(data.number);
        setDisplay(data.display ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const hasNumber = !!number;
  // iOS + most Android accept the `?&body=` form.
  const smsHref = `sms:${number ?? ""}?&body=${encodeURIComponent(SMS_KEYWORD)}`;

  return (
    <section className="py-12 lg:py-20 bg-[#F9F9F7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* copy */}
          <div>
            <Reveal>
              <p className="text-sm font-medium uppercase tracking-wider text-[#C5A059] mb-3">
                Prefer to text?
              </p>
            </Reveal>
            <StampHeading
              text="Skip the phone tag."
              accent="Just text us."
              className="text-3xl sm:text-4xl font-display font-normal text-[#2C2C2C] mb-4"
            />
            <Reveal delay={0.12}>
              <p className="text-lg text-[#2C2C2C]/70 mb-8 leading-relaxed">
                Ask questions, compare plans, and book a time — all over text, on your schedule.
                A real licensed agent picks it up. No hold music, no call center.
              </p>
            </Reveal>

            <div className="space-y-4 mb-8">
              {[
                { icon: <MessageSquareText className="w-5 h-5" />, text: "Answers to your actual questions — not a bot runaround" },
                { icon: <Clock className="w-5 h-5" />, text: "Reply whenever it's convenient; we pick up where you left off" },
                { icon: <CalendarCheck className="w-5 h-5" />, text: "Book a quick call by text once you're ready — never before" },
              ].map((item, i) => (
                <Reveal key={i} delay={0.15 + i * 0.06}>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#C5A059]/10 to-[#EBD598]/10 flex items-center justify-center text-[#C5A059]">
                      {item.icon}
                    </span>
                    <span className="text-sm text-[#2C2C2C]/75 leading-relaxed pt-1.5">{item.text}</span>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.3}>
              {hasNumber ? (
                <div>
                  <a href={smsHref}>
                    <Button
                      size="lg"
                      className="rounded-full btn-gold-gradient text-[#2C2C2C] px-8 py-6 text-base font-normal shadow-lg shadow-[#C5A059]/20 hover:shadow-[#C5A059]/40 hover:-translate-y-0.5 transition-all border border-[#C5A059]"
                    >
                      <MessageSquareText className="w-4 h-4 mr-2" />
                      Text us now
                    </Button>
                  </a>
                  {display && (
                    <p className="text-sm text-[#2C2C2C]/50 mt-3">
                      Or text <span className="font-semibold text-[#2C2C2C]">{SMS_KEYWORD}</span> to{" "}
                      <a href={smsHref} className="font-medium text-[#C5A059] hover:underline">
                        {display}
                      </a>
                    </p>
                  )}
                </div>
              ) : (
                <Link href="/get-coverage">
                  <Button
                    size="lg"
                    className="rounded-full btn-gold-gradient text-[#2C2C2C] px-8 py-6 text-base font-normal shadow-lg shadow-[#C5A059]/20 hover:shadow-[#C5A059]/40 hover:-translate-y-0.5 transition-all border border-[#C5A059]"
                  >
                    <MessageSquareText className="w-4 h-4 mr-2" />
                    Start a conversation
                  </Button>
                </Link>
              )}
            </Reveal>
          </div>

          {/* animated thread */}
          <Reveal delay={0.1} y={24}>
            <ThreadPlayer />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
