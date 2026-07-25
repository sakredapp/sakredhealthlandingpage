import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

const INCOME_BRACKETS = [
  "Under $20,000",
  "$20,000 - $40,000",
  "$40,000 - $60,000",
  "$60,000 - $80,000",
  "$80,000 - $100,000",
  "$100,000 - $150,000",
  "$150,000+",
];

interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  dob: string;
  zip: string;
  state: string;
  coverage_for: string;
  annual_household_income: string;
  has_major_medical: string;
  current_coverage_type: string;
  household_size: string;
  sms_consent: boolean;
}

const initialForm: FormData = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  dob: "",
  zip: "",
  state: "",
  coverage_for: "",
  annual_household_income: "",
  has_major_medical: "",
  current_coverage_type: "",
  household_size: "",
  sms_consent: false,
};

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-[#E8E4DC] bg-[#FDFBF7] text-[#2C2C2C] placeholder:text-[#2C2C2C]/40 focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059] transition-colors text-base";

const labelClass = "block text-sm font-medium text-[#2C2C2C]/80 mb-1.5";

export default function GetCoverage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Client-side quick checks
    const phone = form.phone.replace(/\D/g, "");
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!/^\d{5}$/.test(form.zip)) {
      setError("Please enter a valid 5-digit zip code.");
      return;
    }
    if (!form.sms_consent) {
      setError("Please agree to receive SMS messages to continue.");
      return;
    }
    if (form.has_major_medical === "yes" && !form.current_coverage_type) {
      setError("Please select your current coverage type.");
      return;
    }

    setSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        first_name: form.first_name,
        last_name: form.last_name,
        phone,
        dob: form.dob,
        zip: form.zip,
        annual_household_income: form.annual_household_income,
        has_major_medical: form.has_major_medical,
        sms_consent: true,
      };
      if (form.email) payload.email = form.email;
      if (form.state) payload.state = form.state;
      if (form.coverage_for) payload.coverage_for = form.coverage_for;
      if (form.household_size) payload.household_size = Number(form.household_size);
      if (form.has_major_medical === "yes") {
        payload.current_coverage_type = form.current_coverage_type;
      }

      const res = await fetch("/api/intake/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Unable to connect. Please check your internet and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navigation />
      <section className="pt-24 pb-12 lg:pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-[#C5A059]/30 shadow-sm mb-6">
              <MapPin className="w-4 h-4 text-[#C5A059]" />
              <span className="text-sm font-medium text-[#2C2C2C]/80">Find Coverage in Your Area</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-normal tracking-tight text-[#2C2C2C] mb-6">
              Let's find the right{" "}
              <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
                plan for you
              </span>
            </h1>

            <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
              Answer a few quick questions and a licensed Sakred Health agent will reach out with personalized options — no obligation, no pressure.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-10 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]"
          >
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-display font-normal text-[#2C2C2C] mb-3">
                  You're all set!
                </h2>
                <p className="text-[#2C2C2C]/60 max-w-md mx-auto mb-2">
                  A licensed Sakred Health agent will reach out shortly with coverage options tailored to you.
                </p>
                <p className="text-sm text-[#2C2C2C]/50">
                  Keep an eye on your phone — Sakred AI, our AI assistant, will text you within minutes to confirm your details and help schedule a call.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className={labelClass}>First Name *</label>
                    <input
                      id="first_name"
                      type="text"
                      required
                      autoComplete="given-name"
                      className={inputClass}
                      placeholder="Jane"
                      value={form.first_name}
                      onChange={(e) => update("first_name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className={labelClass}>Last Name *</label>
                    <input
                      id="last_name"
                      type="text"
                      required
                      autoComplete="family-name"
                      className={inputClass}
                      placeholder="Doe"
                      value={form.last_name}
                      onChange={(e) => update("last_name", e.target.value)}
                    />
                  </div>
                </div>

                {/* Contact row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className={labelClass}>Phone Number *</label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      autoComplete="tel-national"
                      className={inputClass}
                      placeholder="(555) 123-4567"
                      value={form.phone}
                      onChange={(e) => update("phone", formatPhone(e.target.value))}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className={labelClass}>Email</label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className={inputClass}
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                    />
                  </div>
                </div>

                {/* DOB */}
                <div>
                  <label htmlFor="dob" className={labelClass}>Date of Birth *</label>
                  <input
                    id="dob"
                    type="date"
                    required
                    autoComplete="bday"
                    className={inputClass}
                    value={form.dob}
                    onChange={(e) => update("dob", e.target.value)}
                  />
                </div>

                {/* Location row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="zip" className={labelClass}>Zip Code *</label>
                    <input
                      id="zip"
                      type="text"
                      required
                      inputMode="numeric"
                      maxLength={5}
                      autoComplete="postal-code"
                      className={inputClass}
                      placeholder="75201"
                      value={form.zip}
                      onChange={(e) => update("zip", e.target.value.replace(/\D/g, "").slice(0, 5))}
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className={labelClass}>State</label>
                    <select
                      id="state"
                      autoComplete="address-level1"
                      className={inputClass}
                      value={form.state}
                      onChange={(e) => update("state", e.target.value)}
                    >
                      <option value="">Select state</option>
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Household */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="annual_household_income" className={labelClass}>
                      Annual Household Income *
                    </label>
                    <select
                      id="annual_household_income"
                      required
                      className={inputClass}
                      value={form.annual_household_income}
                      onChange={(e) => update("annual_household_income", e.target.value)}
                    >
                      <option value="">Select range</option>
                      {INCOME_BRACKETS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="household_size" className={labelClass}>Household Size</label>
                    <select
                      id="household_size"
                      className={inputClass}
                      value={form.household_size}
                      onChange={(e) => update("household_size", e.target.value)}
                    >
                      <option value="">Select</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>{n}{n === 8 ? "+" : ""}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Coverage type: Individual or Family */}
                <div>
                  <label className={labelClass}>
                    Are you looking for individual or family coverage? *
                  </label>
                  <div className="flex gap-4 mt-1">
                    {([{ value: "individual", label: "Individual" }, { value: "family", label: "Family" }] as const).map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-colors text-center ${
                          form.coverage_for === opt.value
                            ? "border-[#C5A059] bg-[#C5A059]/5 text-[#2C2C2C]"
                            : "border-[#E8E4DC] bg-[#FDFBF7] text-[#2C2C2C]/60 hover:border-[#C5A059]/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="coverage_for"
                          value={opt.value}
                          required
                          className="sr-only"
                          checked={form.coverage_for === opt.value}
                          onChange={() => update("coverage_for", opt.value)}
                        />
                        <span className="font-medium">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Insurance status */}
                <div>
                  <label className={labelClass}>
                    Do you currently have major medical health insurance? *
                  </label>
                  <div className="flex gap-4 mt-1">
                    {(["yes", "no"] as const).map((v) => (
                      <label
                        key={v}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-colors text-center ${
                          form.has_major_medical === v
                            ? "border-[#C5A059] bg-[#C5A059]/5 text-[#2C2C2C]"
                            : "border-[#E8E4DC] bg-[#FDFBF7] text-[#2C2C2C]/60 hover:border-[#C5A059]/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="has_major_medical"
                          value={v}
                          required
                          className="sr-only"
                          checked={form.has_major_medical === v}
                          onChange={() => {
                            update("has_major_medical", v);
                            if (v === "no") update("current_coverage_type", "");
                          }}
                        />
                        <span className="capitalize font-medium">{v}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Conditional: coverage type */}
                {form.has_major_medical === "yes" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className={labelClass}>What type of coverage do you have? *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                      {([
                        { value: "aca", label: "ACA / Obamacare" },
                        { value: "employer", label: "Employer" },
                        { value: "private", label: "Private Coverage" },
                      ] as const).map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-colors text-center ${
                            form.current_coverage_type === opt.value
                              ? "border-[#C5A059] bg-[#C5A059]/5 text-[#2C2C2C]"
                              : "border-[#E8E4DC] bg-[#FDFBF7] text-[#2C2C2C]/60 hover:border-[#C5A059]/40"
                          }`}
                        >
                          <input
                            type="radio"
                            name="current_coverage_type"
                            value={opt.value}
                            className="sr-only"
                            checked={form.current_coverage_type === opt.value}
                            onChange={() => update("current_coverage_type", opt.value)}
                          />
                          <span className="font-medium text-sm">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* SMS consent */}
                <div className="border-t border-[#E8E4DC] pt-6">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.sms_consent}
                      onChange={(e) => update("sms_consent", e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-[#E8E4DC] text-[#C5A059] focus:ring-[#C5A059]/40 cursor-pointer"
                    />
                    <span className="text-sm text-[#2C2C2C]/60 leading-relaxed">
                      I agree to receive SMS messages from Sakred Health and its agents regarding my insurance inquiry. Message &amp; data rates may apply. Reply STOP to opt out at any time. *
                    </span>
                  </label>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="w-full rounded-full btn-gold-gradient text-[#2C2C2C] px-8 py-6 text-base font-normal shadow-lg shadow-[#C5A059]/20 hover:shadow-[#C5A059]/40 hover:-translate-y-0.5 transition-all border border-[#C5A059] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      See My Options
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-[#2C2C2C]/40">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Your information is encrypted and never shared without your consent.</span>
                </div>
              </form>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-[#2C2C2C]/50">
              Already have a plan?{" "}
              <Link href="/app" className="text-[#C5A059] font-medium hover:underline">
                Explore the Sakred Health app
              </Link>
            </p>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
