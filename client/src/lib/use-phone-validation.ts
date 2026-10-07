"use client";

/**
 * Mobile-number checking for a landing page's phone field.
 *
 * SHARED SOURCE. This file is maintained here and copied verbatim into each
 * landing-page repo at `lib/use-phone-validation.ts`. The landers are separate
 * repos on separate Vercel projects, so there is no package to import — but
 * there is also no decision in this file to drift: it holds no policy, no
 * accept list and no error copy. Whether a number is acceptable, and what to
 * say when it isn't, are answered by `/api/phone-validation` in the CRM.
 * Changing the rules never touches a lander.
 *
 * NOT verification. Nothing is sent to the number; the visitor gets no code
 * and no text. It's a carrier lookup, invisible to them.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type PhoneCheckState =
  /** Nothing typed yet, or not a complete number. */
  | { status: "idle" }
  /** A lookup is in flight. */
  | { status: "checking" }
  /** Good to submit. `pending` = we couldn't reach the checker and let it by. */
  | { status: "valid"; pending: boolean }
  /**
   * Refused. `message` is server-supplied consumer copy — render it as-is.
   * `soft` = the CRM's soft policy (`blocking: false`): the message is a
   * one-time nudge, never a gate. Submitting the same number again goes through.
   */
  | { status: "invalid"; message: string; soft?: boolean };

/** ~500ms after typing stops. Long enough that nobody is charged for a lookup
 *  mid-area-code, short enough to feel instant on blur. */
const DEBOUNCE_MS = 500;

/** Digits only, leading US country code dropped, capped at 10. */
function digitsOf(input: string): string {
  return input.replace(/\D/g, "").replace(/^1(?=\d)/, "").slice(0, 10);
}

/**
 * Structural check, mirroring `toE164US` in the CRM's shared/phone-validation.
 * Its only job is to stop us spending a paid lookup on something that isn't a
 * dialable number yet. It is NOT the gate — the server is.
 */
function isCompleteUsNumber(input: string): boolean {
  const d = digitsOf(input);
  return d.length === 10 && /^[2-9]\d{2}[2-9]\d{6}$/.test(d);
}

export type UsePhoneValidation = {
  state: PhoneCheckState;
  /** Call on every keystroke. Debounces; only fires once the number is complete. */
  onChange: (value: string) => void;
  /** Call on blur. Checks immediately rather than waiting out the debounce. */
  onBlur: (value: string) => void;
  /**
   * Await before submitting. Resolves false only when the number is genuinely
   * refused — an unreachable checker resolves true, so a validation outage
   * can't stop the form. Re-checks rather than trusting stale state.
   */
  confirm: (value: string) => Promise<boolean>;
};

export function usePhoneValidation(
  endpoint = "/api/phone-validation",
): UsePhoneValidation {
  const [state, setState] = useState<PhoneCheckState>({ status: "idle" });

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Aborts the previous lookup when the visitor keeps typing, so a slow
  // response for an old number can't overwrite the verdict for the new one.
  const inflight = useRef<AbortController | null>(null);
  // Every completed lookup, so editing back to a number we already judged is
  // instant and free.
  const seen = useRef<Map<string, PhoneCheckState>>(new Map());
  // Numbers whose soft nudge the visitor has already been shown on submit.
  const nudged = useRef<Set<string>>(new Set());
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (timer.current) clearTimeout(timer.current);
      inflight.current?.abort();
    };
  }, []);

  const check = useCallback(
    async (value: string): Promise<PhoneCheckState> => {
      const digits = digitsOf(value);

      if (!isCompleteUsNumber(value)) {
        // An incomplete number is not a WRONG number. Showing an error while
        // someone is still mid-way through typing their own phone number is
        // the fastest way to make a working form feel broken.
        const idle: PhoneCheckState = { status: "idle" };
        if (mounted.current) setState(idle);
        return idle;
      }

      const cached = seen.current.get(digits);
      if (cached) {
        if (mounted.current) setState(cached);
        return cached;
      }

      inflight.current?.abort();
      const controller = new AbortController();
      inflight.current = controller;

      if (mounted.current) setState({ status: "checking" });

      let result: PhoneCheckState;
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ phone: digits }),
          signal: controller.signal,
        });
        const data = (await res.json().catch(() => ({}))) as {
          valid?: boolean;
          message?: string;
          pending?: boolean;
          blocking?: boolean;
        };

        if (!res.ok) {
          // Our own endpoint is unhappy (misconfigured, rate limited, down).
          // That is our problem, not the visitor's — let them through and let
          // the CRM catch it on submit and in the background.
          result = { status: "valid", pending: true };
        } else if (data.valid) {
          result = { status: "valid", pending: Boolean(data.pending) };
        } else {
          result = {
            status: "invalid",
            // Server copy, always. The lander deliberately holds no fallback
            // wording, so there is exactly one sentence a visitor can ever see
            // and it can be changed without redeploying two landers.
            message: data.message || "Please enter a valid mobile phone number.",
            ...(data.blocking === false ? { soft: true } : {}),
          };
        }
      } catch (err) {
        // A superseded request is not a result — leave the state alone.
        if ((err as Error)?.name === "AbortError") return { status: "checking" };
        // Network failure. Fail open for the same reason as above.
        result = { status: "valid", pending: true };
      }

      // Only cache real verdicts. Caching a fail-open would pin a number as OK
      // for the rest of the session on the strength of one dropped request.
      if (result.status === "invalid" || (result.status === "valid" && !result.pending)) {
        seen.current.set(digits, result);
      }
      if (mounted.current) setState(result);
      return result;
    },
    [endpoint],
  );

  const onChange = useCallback(
    (value: string) => {
      if (timer.current) clearTimeout(timer.current);

      // Clear a stale error the moment the number changes. Leaving a red
      // border under a number they've already started fixing reads as the
      // field being stuck.
      setState((prev) => (prev.status === "invalid" ? { status: "idle" } : prev));

      if (!isCompleteUsNumber(value)) return;
      timer.current = setTimeout(() => void check(value), DEBOUNCE_MS);
    },
    [check],
  );

  const onBlur = useCallback(
    (value: string) => {
      if (timer.current) clearTimeout(timer.current);
      void check(value);
    },
    [check],
  );

  const confirm = useCallback(
    async (value: string) => {
      if (timer.current) clearTimeout(timer.current);
      const result = await check(value);
      if (result.status !== "invalid") return true;
      if (!result.soft) return false;
      // Soft policy: one look at the message, then their call. Never a gate.
      const digits = digitsOf(value);
      if (nudged.current.has(digits)) return true;
      nudged.current.add(digits);
      return false;
    },
    [check],
  );

  return { state, onChange, onBlur, confirm };
}
