/**
 * /recommend — a public recommendation form.
 *
 * Files into the canonical `health_network_submissions` table, the same
 * pipeline the app uses. There is no website-specific submissions store, so
 * there is one review queue rather than two (brief §21, §31).
 *
 * The confirmation copy is deliberately careful: it thanks the person and says
 * a human will look. It never says the practice has been added, because it
 * hasn't been, and the whole value of the network is that nothing gets added
 * without someone checking.
 */
import { useState } from "react";
import { useSearch } from "wouter";
import { Check, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { StampHeading, Reveal } from "@/components/motion";
import { AtlasCanvas } from "@/components/map/AtlasCanvas";
import { useRecommendMutation } from "@/lib/network";
import { Turnstile } from "@/components/health/Turnstile";
import { track } from "@/lib/analytics";
import { SEED_MODALITIES } from "@/data/modalities";
import { useSeo } from "@/lib/seo";
import type { RecommendationKind } from "@shared/network-submissions";

const field =
  "w-full rounded-xl border border-sakred-stone bg-sakred-surface px-4 py-2.5 text-sm text-sakred-espresso outline-none transition-colors duration-micro placeholder:text-sakred-ink/35 focus:border-sakred-gold";
const label = "mb-1.5 block text-sm font-medium text-sakred-espresso";

export default function Recommend() {
  const search = useSearch();
  const prefill = new URLSearchParams(search);

  // /for-practitioners links here with ?kind=location, so a practice arrives
  // on the right branch of the form rather than having to re-pick it.
  const [kind, setKind] = useState<RecommendationKind>(
    prefill.get("kind") === "location" ? "location" : "practitioner"
  );
  const [name, setName] = useState(prefill.get("name") ?? "");
  const [city, setCity] = useState(prefill.get("city") ?? "");
  const [link, setLink] = useState("");
  const [modality, setModality] = useState(prefill.get("modality") ?? "");
  const [reason, setReason] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [started, setStarted] = useState(false);

  const mutation = useRecommendMutation();

  /** Fires once, on first interaction. Carries no field content. */
  const noteStarted = () => {
    if (started) return;
    setStarted(true);
    track("recommend_started", { surface: "recommend" });
  };

  useSeo({
    title: "Recommend a Practitioner — Sakred Health Network",
    description:
      "Know a practitioner or practice that belongs in the Sakred Health Network? Tell us about them. Every recommendation is reviewed by a person.",
    canonical: "/recommend",
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mutation.isPending) return;
    mutation.mutate(
      {
        kind,
        name: name.trim(),
        city: city.trim() || undefined,
        link: link.trim() || undefined,
        modality: modality || undefined,
        reason: reason.trim() || undefined,
        submitterEmail: email.trim() || undefined,
        turnstileToken,
        website_url: honeypot,
      },
      {
        // Only the shape of the submission is recorded — never its content.
        onSuccess: () => track("recommend_submitted", { surface: "recommend", kind }),
      }
    );
  };

  if (mutation.isSuccess) {
    return (
      <SiteLayout solidHeader>
        <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
          <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-sakred-gold/45 bg-sakred-gold/10">
            <Check className="h-6 w-6 text-sakred-gold-deep" aria-hidden="true" />
          </span>
          <h1 className="font-display text-3xl text-sakred-espresso">Thank you.</h1>
          {/* Says what actually happens next — not "they've been added". */}
          <p className="mt-4 text-base leading-relaxed text-sakred-ink/65">
            Your recommendation has gone into the review queue. Someone from Sakred
            reads every one and checks the practice before anything is published, so
            this may take a little while — that delay is the point.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="/discover"
              className="rounded-full border border-sakred-stone bg-sakred-surface px-5 py-2.5 text-sm font-medium text-sakred-espresso lift-card"
            >
              Back to the map
            </a>
            <button
              type="button"
              onClick={() => {
                mutation.reset();
                setName("");
                setCity("");
                setLink("");
                setReason("");
              }}
              className="rounded-full border border-sakred-gold bg-gradient-to-r from-sakred-gold via-sakred-gold-light to-sakred-gold px-5 py-2.5 text-sm font-medium text-sakred-espresso"
            >
              Recommend someone else
            </button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout solidHeader>
      <div className="relative overflow-hidden border-b border-sakred-stone bg-sakred-surface-alt">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <AtlasCanvas className="h-full w-full" animated />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-sakred-gold-deep">
            Help build the network
          </p>
          <StampHeading
            as="h1"
            text="Who should"
            accent="be on the map?"
            className="font-display text-3xl leading-tight tracking-tight text-sakred-espresso sm:text-4xl"
          />
          <p className="mt-4 max-w-xl text-base leading-relaxed text-sakred-ink/65">
            The best practitioners are usually found by word of mouth, not by search.
            If someone changed how you feel, tell us — that&rsquo;s how the network
            grows.
          </p>
        </div>
      </div>

      <Reveal className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <form onSubmit={submit} className="space-y-6">
          <fieldset>
            <legend className={label}>Are you recommending</legend>
            <div className="flex gap-3">
              {(
                [
                  { value: "practitioner", label: "A practitioner" },
                  { value: "location", label: "A practice or location" },
                ] as const
              ).map((option) => (
                <label
                  key={option.value}
                  className={`flex flex-1 cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 text-sm transition-colors duration-micro ${
                    kind === option.value
                      ? "border-sakred-gold bg-sakred-gold/10 text-sakred-espresso"
                      : "border-sakred-stone bg-sakred-surface text-sakred-ink/70"
                  }`}
                >
                  <input
                    type="radio"
                    name="kind"
                    value={option.value}
                    checked={kind === option.value}
                    onChange={() => {
                      noteStarted();
                      setKind(option.value);
                    }}
                    className="accent-[#C5A059]"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label className={label} htmlFor="rec-name">
              Name <span className="text-sakred-gold-deep">*</span>
            </label>
            <input
              id="rec-name"
              required
              value={name}
              onChange={(event) => {
                noteStarted();
                setName(event.target.value);
              }}
              placeholder={kind === "practitioner" ? "Dr. Jane Chen" : "Golden River Chinese Medicine"}
              className={field}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="rec-city">
                City or area
              </label>
              <input
                id="rec-city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Miami, FL"
                className={field}
              />
            </div>
            <div>
              <label className={label} htmlFor="rec-modality">
                Modality
              </label>
              <select
                id="rec-modality"
                value={modality}
                onChange={(event) => setModality(event.target.value)}
                className={field}
              >
                <option value="">Select one</option>
                {SEED_MODALITIES.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.name}
                  </option>
                ))}
                <option value="other">Something else</option>
              </select>
            </div>
          </div>

          <div>
            <label className={label} htmlFor="rec-link">
              Website or social link
            </label>
            <input
              id="rec-link"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://"
              className={field}
            />
          </div>

          <div>
            <label className={label} htmlFor="rec-reason">
              Why do you recommend them?
            </label>
            <textarea
              id="rec-reason"
              rows={5}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="What they helped with, what they're like to work with, anything you'd want a stranger to know."
              className={`${field} resize-y`}
            />
          </div>

          <div>
            <label className={label} htmlFor="rec-email">
              Your email
            </label>
            <input
              id="rec-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className={field}
            />
            <p className="mt-1.5 text-xs text-sakred-ink/45">
              Only so we can follow up if we have a question. Optional.
            </p>
          </div>

          {/* Honeypot: off-screen, not display:none — some bots skip hidden
              fields but happily fill anything positioned away. */}
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <label htmlFor="website_url">Leave this blank</label>
            <input
              id="website_url"
              name="website_url"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
            />
          </div>

          <Turnstile onToken={setTurnstileToken} />

          {mutation.isError && (
            <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {(mutation.error as Error).message}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={mutation.isPending || name.trim().length < 2}
              className="inline-flex items-center gap-2 rounded-full border border-sakred-gold bg-gradient-to-r from-sakred-gold via-sakred-gold-light to-sakred-gold px-6 py-3 text-sm font-medium text-sakred-espresso transition-transform duration-micro hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Send recommendation
            </button>
            <p className="text-xs text-sakred-ink/50">
              Reviewed by a person. Nothing is published automatically.
            </p>
          </div>
        </form>
      </Reveal>
    </SiteLayout>
  );
}
