import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

const AGE_BRACKETS = ["Under 30", "30–39", "40–49", "50–59", "60–69", "70–79", "80+"];

const AMOUNT_BRACKETS = [
  "Not sure yet",
  "Under $25,000",
  "$25,000 – $100,000",
  "$100,000 – $250,000",
  "$250,000 – $500,000",
  "Over $500,000",
];

function formatPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-[#E8E4DC] bg-[#FDFBF7] text-[#2C2C2C] placeholder:text-[#2C2C2C]/40 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059] transition-colors text-base";
const labelClass = "block text-sm font-medium text-[#2C2C2C]/80 mb-1.5";

interface Props {
  /** Public product id (route slug). The server maps it to the CRM campaign slug. */
  product: string;
  productTitle: string;
  /** When set, shows a "coverage in mind" dropdown with this label. */
  amountLabel?: string;
  /** Prefill + lock the state (used on state landing pages). */
  defaultState?: string;
}

export function ProductIntakeForm({ product, productTitle, amountLabel, defaultState }: Props) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    state: defaultState ?? "",
    zip: "",
    age: "",
    coverage_amount: "",
    notes: "",
    sms_consent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const phone = form.phone.replace(/\D/g, "");
    if (phone.length !== 10) return setError("Please enter a valid 10-digit phone number.");
    if (!form.email.includes("@")) return setError("Please enter a valid email address.");
    if (!form.state) return setError("Please select your state.");
    if (!form.sms_consent) return setError("Please agree to receive messages to continue.");

    setSubmitting(true);
    setError(null);
    try {
      // TrustedForm / Jornaya cert values are injected into these hidden inputs
      // by their scripts when present; forwarded only if populated.
      const tf = (document.querySelector('input[name="trustedform_cert_url"]') as HTMLInputElement | null)?.value;
      const jl = (document.querySelector('input[name="jornaya_lead_id"]') as HTMLInputElement | null)?.value;

      const payload: Record<string, unknown> = {
        product,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone,
        state: form.state,
        sms_consent: true,
      };
      if (form.zip) payload.zip = form.zip;
      if (form.age) payload.age = form.age;
      if (amountLabel && form.coverage_amount) payload.coverage_amount = form.coverage_amount;
      if (form.notes.trim()) payload.notes = form.notes.trim();
      if (tf) payload.trustedform_cert_url = tf;
      if (jl) payload.jornaya_lead_id = jl;

      const res = await fetch("/api/product-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Something went wrong. Please try again.");
      setSubmitted(true);
    } catch {
      setError("Unable to connect. Please check your internet and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-display font-normal text-[#2C2C2C] mb-3">You're all set!</h3>
        <p className="text-[#2C2C2C]/60 max-w-md mx-auto">
          A licensed Sakred Health agent will reach out shortly about {productTitle.toLowerCase()}.
          Keep an eye on your phone — we'll text you within minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* TrustedForm / Jornaya capture (populated by their scripts if enabled). */}
      <input type="hidden" name="trustedform_cert_url" />
      <input type="hidden" name="jornaya_lead_id" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pf-first" className={labelClass}>First Name *</label>
          <input id="pf-first" required autoComplete="given-name" className={inputClass}
            placeholder="Jane" value={form.first_name} onChange={(e) => update("first_name", e.target.value)} />
        </div>
        <div>
          <label htmlFor="pf-last" className={labelClass}>Last Name *</label>
          <input id="pf-last" required autoComplete="family-name" className={inputClass}
            placeholder="Doe" value={form.last_name} onChange={(e) => update("last_name", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pf-phone" className={labelClass}>Phone *</label>
          <input id="pf-phone" type="tel" required autoComplete="tel-national" className={inputClass}
            placeholder="(555) 123-4567" value={form.phone} onChange={(e) => update("phone", formatPhone(e.target.value))} />
        </div>
        <div>
          <label htmlFor="pf-email" className={labelClass}>Email *</label>
          <input id="pf-email" type="email" required autoComplete="email" className={inputClass}
            placeholder="jane@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="pf-state" className={labelClass}>State *</label>
          <select id="pf-state" required autoComplete="address-level1" className={inputClass}
            value={form.state} disabled={!!defaultState} onChange={(e) => update("state", e.target.value)}>
            <option value="">Select</option>
            {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="pf-zip" className={labelClass}>Zip</label>
          <input id="pf-zip" inputMode="numeric" maxLength={5} autoComplete="postal-code" className={inputClass}
            placeholder="75201" value={form.zip} onChange={(e) => update("zip", e.target.value.replace(/\D/g, "").slice(0, 5))} />
        </div>
        <div>
          <label htmlFor="pf-age" className={labelClass}>Age</label>
          <select id="pf-age" className={inputClass} value={form.age} onChange={(e) => update("age", e.target.value)}>
            <option value="">Select</option>
            {AGE_BRACKETS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {amountLabel && (
        <div>
          <label htmlFor="pf-amount" className={labelClass}>{amountLabel}</label>
          <select id="pf-amount" className={inputClass} value={form.coverage_amount}
            onChange={(e) => update("coverage_amount", e.target.value)}>
            <option value="">Select</option>
            {AMOUNT_BRACKETS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="pf-notes" className={labelClass}>Anything we should know?</label>
        <textarea id="pf-notes" rows={2} className={inputClass}
          placeholder="Optional" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
      </div>

      <div className="border-t border-[#E8E4DC] pt-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={form.sms_consent}
            onChange={(e) => update("sms_consent", e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[#E8E4DC] text-[#C5A059] focus:ring-[#C5A059]/40 cursor-pointer" />
          <span className="text-sm text-[#2C2C2C]/60 leading-relaxed">
            I agree to receive calls and SMS messages from Sakred Health and its agents about my inquiry,
            including by automated means. Consent isn't a condition of purchase. Message &amp; data rates may
            apply. Reply STOP to opt out. *
          </span>
        </label>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </motion.div>
      )}

      <Button type="submit" size="lg" disabled={submitting}
        className="w-full rounded-full btn-gold-gradient text-[#2C2C2C] px-8 py-6 text-base font-normal shadow-lg shadow-[#C5A059]/20 hover:shadow-[#C5A059]/40 hover:-translate-y-0.5 transition-all border border-[#C5A059] disabled:opacity-60 disabled:cursor-not-allowed">
        {submitting ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
        ) : (
          <>Inquire about {productTitle}<ArrowRight className="w-4 h-4 ml-2" /></>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-[#2C2C2C]/40">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Your information is encrypted and never shared without your consent.</span>
      </div>
    </form>
  );
}
