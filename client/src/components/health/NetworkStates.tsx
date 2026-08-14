/**
 * What the network surfaces show when they have nothing to show.
 *
 * There are three of these and they are genuinely different messages. The
 * whole reason the data layer tracks `available` separately from result count
 * is so this file can tell the truth:
 *
 *   NetworkBuilding    we can see the network; there is nothing here yet.
 *                      → "We're building the Sakred network here" (brief §22)
 *   NetworkUnavailable we could not reach the network at all.
 *                      → says nothing about coverage, because we don't know
 *   NetworkSkeleton    we're still asking.
 *
 * None of them ever renders a placeholder practice. An empty map with an
 * honest sentence and a way to help is worth more than a fake pin.
 */
import { Link } from "wouter";
import { Compass, MapPinPlus, WifiOff } from "lucide-react";
import { AtlasCanvas } from "@/components/map/AtlasCanvas";

/* ------------------------------------------------------------------ *
 * Nothing published here yet
 * ------------------------------------------------------------------ */

export function NetworkBuilding({
  /** "Miami" — makes the sentence specific when we know where they looked. */
  place,
  /** Offers a broader search when a city page came up empty. */
  broaderHref,
  broaderLabel,
  compact = false,
}: {
  place?: string;
  broaderHref?: string;
  broaderLabel?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-sakred-stone bg-sakred-surface ${
        compact ? "p-6" : "p-8 sm:p-12"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <AtlasCanvas className="h-full w-full" />
      </div>

      <div className="relative max-w-lg">
        <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-sakred-gold/40 bg-sakred-gold/10">
          <Compass className="h-5 w-5 text-sakred-gold-deep" aria-hidden="true" />
        </span>
        <h3
          className={`font-display text-sakred-espresso ${
            compact ? "text-xl" : "text-2xl sm:text-3xl"
          }`}
        >
          We&rsquo;re building the Sakred network{place ? ` in ${place}` : " here"}.
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-sakred-ink/65">
          Every practice in the network is reviewed by a person before it&rsquo;s
          published, so the map fills in city by city rather than all at once. If
          you know someone who belongs here, that&rsquo;s the fastest way to get
          them added.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/recommend"
            className="inline-flex items-center gap-2 rounded-full border border-sakred-gold bg-gradient-to-r from-sakred-gold via-sakred-gold-light to-sakred-gold px-5 py-2.5 text-sm font-medium text-sakred-espresso transition-transform duration-micro hover:-translate-y-0.5"
          >
            <MapPinPlus className="h-4 w-4" aria-hidden="true" />
            Recommend a practitioner
          </Link>
          {broaderHref && (
            <Link
              href={broaderHref}
              className="text-sm font-medium text-sakred-gold-deep hover:text-sakred-espresso"
            >
              {broaderLabel ?? "Search a wider area"} →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Couldn't reach the network
 * ------------------------------------------------------------------ */

export function NetworkUnavailable({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-sakred-stone bg-sakred-surface ${
        compact ? "p-6" : "p-8 sm:p-12"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <AtlasCanvas className="h-full w-full" />
      </div>

      <div className="relative max-w-lg">
        <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-sakred-stone bg-sakred-surface-alt">
          <WifiOff className="h-5 w-5 text-sakred-ink/50" aria-hidden="true" />
        </span>
        <h3
          className={`font-display text-sakred-espresso ${
            compact ? "text-xl" : "text-2xl sm:text-3xl"
          }`}
        >
          The network directory isn&rsquo;t loading right now.
        </h3>
        {/* Says nothing about coverage. We cannot see the directory, so we do
            not know whether there are practices here, and guessing either way
            would be a lie the visitor can't check. */}
        <p className="mt-3 text-sm leading-relaxed text-sakred-ink/65">
          This is on our side, not yours. Please try again in a moment — or
          carry on in the app, where your saved places are still available.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/app"
            className="inline-flex items-center rounded-full border border-sakred-stone bg-sakred-surface px-5 py-2.5 text-sm font-medium text-sakred-espresso lift-card"
          >
            Open the app
          </Link>
          <Link
            href="/recommend"
            className="text-sm font-medium text-sakred-gold-deep hover:text-sakred-espresso"
          >
            Recommend a practitioner →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Loading
 * ------------------------------------------------------------------ */

/**
 * Result-list skeletons.
 *
 * Sized to the real `ProviderCard` row so the list doesn't jump when results
 * land — layout shift on a list the user is already reaching for is worse than
 * a slightly longer blank.
 */
export function NetworkSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-3.5 rounded-2xl border border-sakred-stone/70 bg-sakred-surface p-3"
        >
          <div className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-xl skeleton-warm animate-pulse" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3.5 w-2/3 rounded-full skeleton-warm animate-pulse" />
            <div className="h-2.5 w-1/2 rounded-full skeleton-warm animate-pulse" />
            <div className="h-2.5 w-3/5 rounded-full skeleton-warm animate-pulse" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading practices…</span>
    </div>
  );
}
