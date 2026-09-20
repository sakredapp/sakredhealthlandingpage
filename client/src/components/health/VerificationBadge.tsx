/**
 * The public trust state, as a badge.
 *
 * Deliberately quiet. The badge is not a rating and must not look like one —
 * no stars, no score, no five-point scale to skim. Its whole job is to say
 * which of four checks Sakred has actually done, so its visual weight tracks
 * the claim: "Listed" is a hairline outline, "Sakred Verified" is filled gold.
 */
import { BadgeCheck, Check, ShieldCheck, Sparkles } from "lucide-react";
import {
  VERIFICATION_COPY,
  type VerificationState,
} from "@shared/health-network";

const ICONS = {
  listed: Check,
  credential_verified: BadgeCheck,
  sakred_reviewed: ShieldCheck,
  sakred_verified: Sparkles,
} as const;

/** Weight rises with the strength of the claim, never faster than it. */
const STYLES: Record<VerificationState, string> = {
  listed: "border-sakred-stone bg-transparent text-sakred-ink/60",
  credential_verified: "border-sakred-stone bg-sakred-surface text-sakred-ink/75",
  sakred_reviewed:
    "border-sakred-gold/45 bg-sakred-gold/10 text-sakred-gold-deep",
  sakred_verified:
    "border-sakred-gold bg-gradient-to-r from-sakred-gold/25 to-sakred-gold-light/30 text-sakred-gold-deep",
};

export function VerificationBadge({
  state,
  size = "sm",
  showTooltip = true,
  className,
}: {
  state: VerificationState;
  size?: "sm" | "md";
  /** Adds the plain-language explanation as a native tooltip. */
  showTooltip?: boolean;
  className?: string;
}) {
  const copy = VERIFICATION_COPY[state];
  const Icon = ICONS[state];

  return (
    <span
      title={showTooltip ? copy.description : undefined}
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${
        size === "md" ? "px-3 py-1 text-xs" : "px-2.5 py-0.5 text-[11px]"
      } ${STYLES[state]} ${className ?? ""}`}
    >
      <Icon className={size === "md" ? "h-3.5 w-3.5" : "h-3 w-3"} aria-hidden="true" />
      {copy.label}
    </span>
  );
}
