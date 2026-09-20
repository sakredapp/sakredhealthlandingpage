/**
 * Email capture, restored.
 *
 * The V1 site had a newsletter block on the homepage. The V2 rebuild dropped it
 * and nothing replaced it, which left `POST /api/newsletter/subscribe` live and
 * unreachable — an endpoint with no caller, and a mailing list that quietly
 * stopped growing. That was a regression, not a decision.
 *
 * ── Where it goes, and where it doesn't ──────────────────────────────
 *
 * Late on a page, never in a hero. The homepage's job is Discover and the
 * practitioner funnel; an email field competing with those would cost more than
 * the list is worth. Here — at the bottom of Resources and the blog index, once
 * someone has read something — it asks a reasonable question of someone who has
 * already shown they want the writing.
 *
 * The copy promises what we actually send and nothing else. "Join 10,000
 * members" on a list we haven't counted is the kind of number that ends up in a
 * screenshot.
 */
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { Reveal } from "@/components/motion";

interface NewsletterBandProps {
  /** Where it sits, for the copy — the ask reads differently after an article. */
  context?: "library" | "resources";
  className?: string;
}

export function NewsletterBand({ context = "resources", className = "" }: NewsletterBandProps) {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      // The honeypot is checked here rather than server-side because this
      // endpoint predates the network intake guards and writes to a list, not
      // to a queue a human reads. Silently succeeding is the right answer.
      if (honeypot.trim()) return { success: true };

      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json().catch(() => ({}));

      // Already subscribed is a success from the reader's point of view: they
      // asked to be on the list and they are on the list.
      if (res.status === 409) return { success: true };
      if (!res.ok) throw new Error(body?.error || "That didn't go through. Please try again.");
      return body;
    },
  });

  return (
    <section className={`surface-atlas border-t border-sakred-stone ${className}`}>
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-sakred-gold-deep">
            The Sakred letter
          </p>
          <h2 className="font-display text-2xl leading-tight text-sakred-espresso sm:text-3xl">
            {context === "library"
              ? "New writing, when there is some"
              : "Get the next one in your inbox"}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-sakred-ink/65">
            Long-form pieces with the studies attached, new practitioners as the network
            opens in a city, and nothing else. No daily tips, no sequences.
          </p>

          {mutation.isSuccess ? (
            <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-sakred-gold/40 bg-sakred-gold/[0.08] px-5 py-3 text-sm text-sakred-espresso">
              <Check className="h-4 w-4 text-sakred-gold-deep" aria-hidden="true" />
              You&rsquo;re on the list.
            </p>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (email.includes("@") && !mutation.isPending) mutation.mutate();
              }}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full flex-1 rounded-full border border-sakred-stone bg-sakred-surface px-5 py-3 text-sm text-sakred-espresso outline-none transition-colors duration-micro placeholder:text-sakred-ink/35 focus:border-sakred-gold"
              />

              {/* Positioned away rather than display:none, which some bots skip. */}
              <div className="absolute left-[-9999px]" aria-hidden="true">
                <label htmlFor="newsletter-company">Leave this blank</label>
                <input
                  id="newsletter-company"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-sakred-gold bg-gradient-to-r from-sakred-gold via-sakred-gold-light to-sakred-gold px-6 py-3 text-sm font-medium text-sakred-espresso transition-transform duration-micro hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {mutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                Subscribe
              </button>
            </form>
          )}

          {mutation.isError && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {(mutation.error as Error).message}
            </p>
          )}

          <p className="mt-4 text-xs text-sakred-ink/45">
            One click to unsubscribe. We don&rsquo;t sell or share your address.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
