import type { EmailCheckState } from "@/lib/use-email-validation";
import type { PhoneCheckState } from "@/lib/use-phone-validation";

/**
 * The one line under an email or phone field when the real-time lead check
 * (CRM: MillionVerifier / Telnyx) wants the visitor to look again. The copy is
 * the CRM's ("Double-check your email", "Please use your real email",
 * "Double-check your number"); a certain typo gets a one-tap fix. Never a
 * gate: pressing submit again goes through.
 */
export function EmailWarning({
  state,
  onFix,
}: {
  state: EmailCheckState;
  onFix: (fixed: string) => void;
}) {
  if (state.status !== "warn") return null;
  const { message, suggestion } = state;
  return (
    <p role="alert" className="mt-1.5 text-sm font-medium text-red-700 break-words">
      {message}
      {suggestion ? (
        <>
          {" — "}
          <button type="button" className="underline underline-offset-2" onClick={() => onFix(suggestion)}>
            {suggestion}?
          </button>
        </>
      ) : null}
    </p>
  );
}

export function PhoneWarning({ state }: { state: PhoneCheckState }) {
  if (state.status !== "invalid") return null;
  return (
    <p role="alert" className="mt-1.5 text-sm font-medium text-red-700">
      {state.message}
    </p>
  );
}

/** Red border on a field the check flagged. */
export const warnRing = "border-red-400 focus:ring-red-300/40 focus:border-red-400";
