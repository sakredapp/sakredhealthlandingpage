import { useEffect, useState } from "react";
import { MessageSquareText, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, StampHeading } from "@/components/motion";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

/**
 * Dedicated "text us" section for product (and state) pages — replaces the old
 * lone TextCta button, which rendered nothing when the number lookup failed and
 * gave no context when it didn't.
 *
 * Always visible: resolves the visitor's local number by geo, and falls back to
 * a state picker when geo can't (the CRM assigns a local DID per state, so the
 * number must match where the visitor lives). Keyword appears in the button
 * label AND the helper line — people who dial manually must include it or the
 * text can't be routed. `?&body=` form is required for iOS + Android.
 */
interface Props {
  keyword: string;
  productTitle: string;
  /** Lock the state (state landing pages). Hides the picker. */
  fixedState?: string;
}

export function TextUsSection({ keyword, productTitle, fixedState }: Props) {
  const [state, setState] = useState(fixedState ?? "");
  const [number, setNumber] = useState<string | null>(null);
  const [display, setDisplay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const url = state
      ? `/api/local-number?state=${encodeURIComponent(state)}`
      : "/api/local-number";
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.number) {
          setNumber(data.number);
          setDisplay(data.display ?? data.number);
          if (!state && data.state) setState(data.state); // reflect geo in the picker
        } else {
          setNumber(null);
          setDisplay(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNumber(null);
          setDisplay(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [state]);

  const smsHref = number ? `sms:${number}?&body=${encodeURIComponent(keyword)}` : undefined;

  return (
    <section className="py-12 lg:py-16 bg-[#2C2C2C]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* copy */}
          <div>
            <Reveal>
              <p className="text-sm font-medium uppercase tracking-wider text-[#EBD598] mb-3">
                Prefer to text?
              </p>
            </Reveal>
            <StampHeading
              text={`Text ${keyword}.`}
              accent="We'll take it from there."
              className="text-3xl sm:text-4xl font-display font-normal text-white mb-4"
            />
            <Reveal delay={0.12}>
              <p className="text-lg text-white/65 leading-relaxed mb-6">
                Skip the forms and the phone tag — text <strong className="text-white">{keyword}</strong> to
                your local Sakred line and handle your {productTitle.toLowerCase()} questions by message, on
                your schedule.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <ul className="space-y-2.5">
                {[
                  "A licensed agent on the other end — not a runaround",
                  "Reply whenever it suits you; we pick up where you left off",
                  "Book a call by text only if and when you want one",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#C5A059] shrink-0" />
                    <span className="text-sm text-white/70 leading-relaxed">{line}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* number card */}
          <Reveal delay={0.1} y={24}>
            <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)]">
              {!fixedState && (
                <div className="mb-5">
                  <label htmlFor="txt-state" className="block text-sm font-medium text-[#2C2C2C]/80 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 inline mr-1 text-[#C5A059]" />
                    Your state
                  </label>
                  <select
                    id="txt-state"
                    className="w-full px-4 py-3 rounded-xl border border-[#E8E4DC] bg-[#FDFBF7] text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059] transition-colors text-base"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  >
                    <option value="">Select your state</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <p className="text-xs text-[#2C2C2C]/45 mt-1.5">
                    We give you the local number for your state — the same one we'll reply from.
                  </p>
                </div>
              )}

              {number && smsHref ? (
                <>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#C5A059] mb-2">
                    Your local Sakred line
                  </p>
                  <p className="font-display font-bold text-3xl sm:text-4xl text-[#2C2C2C] mb-5 tabular-nums">
                    {display}
                  </p>
                  <a href={smsHref} className="block">
                    <Button
                      size="lg"
                      className="w-full rounded-full btn-gold-gradient text-[#2C2C2C] px-8 py-6 text-base font-normal shadow-lg shadow-[#C5A059]/20 hover:shadow-[#C5A059]/40 hover:-translate-y-0.5 transition-all border border-[#C5A059]"
                    >
                      <MessageSquareText className="w-4 h-4 mr-2" />
                      Text {keyword} to {display}
                    </Button>
                  </a>
                  <p className="text-xs text-[#2C2C2C]/50 mt-3 text-center">
                    Typing it in yourself? Start your message with{" "}
                    <strong className="text-[#2C2C2C]">{keyword}</strong> so it reaches the right team.
                  </p>
                </>
              ) : (
                <div className="text-center py-6">
                  <MessageSquareText className="w-8 h-8 text-[#C5A059]/50 mx-auto mb-3" />
                  <p className="text-sm text-[#2C2C2C]/60">
                    {loading
                      ? "Finding your local number…"
                      : fixedState
                        ? "Our local line is briefly unavailable — the form above works around the clock."
                        : "Select your state above to get your local Sakred number."}
                  </p>
                </div>
              )}

              <p className="text-[11px] text-[#2C2C2C]/40 mt-5 leading-relaxed">
                By texting {keyword} you agree to receive text messages from Sakred Health about your
                inquiry. Message frequency varies; message &amp; data rates may apply. Reply STOP to opt
                out or HELP for help.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
