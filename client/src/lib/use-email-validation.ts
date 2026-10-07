"use client";

/**
 * Real-mailbox checking for a landing page's email field (owner GO 2026-10-07).
 *
 * SHARED SOURCE, like `use-phone-validation.ts`: copied verbatim into each
 * lander repo. It holds no policy and no copy. Whether an address is real, and
 * the one sentence to show when it is not ("Double-check your email" / "Please
 * use your real email"), come from the CRM's `/api/phone-validation?check=email`
 * through this site's `/api/email-validation` proxy. The provider key never
 * leaves the CRM.
 *
 * NEVER A GATE. A warning is shown once per address. Submitting the same
 * address again goes straight through, and so does every failure (timeout,
 * network, our own endpoint down): the lead is never stopped or lost.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type EmailCheckState =
  | { status: "idle" }
  | { status: "checking" }
  /** Nothing to say: a real mailbox, or we could not tell. */
  | { status: "ok" }
  /** Server copy, render as-is. `suggestion` = the corrected address, when certain. */
  | { status: "warn"; message: string; suggestion?: string };

/** The visitor is waiting on a button; past this we let them through. */
const CLIENT_TIMEOUT_MS = 3_500;

const looksComplete = (v: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim());
const keyOf = (v: string) => v.trim().toLowerCase();

export type UseEmailValidation = {
  state: EmailCheckState;
  /** Call on every keystroke: clears a warning the moment they start fixing it. */
  onChange: (value: string) => void;
  /** Call on blur. */
  onBlur: (value: string) => void;
  /**
   * Await on submit. Resolves false ONLY the first time a warning is shown for
   * this exact address, so they get one look at it. Any second press, and any
   * failure, resolves true.
   */
  confirm: (value: string) => Promise<boolean>;
};

export function useEmailValidation(endpoint = "/api/email-validation"): UseEmailValidation {
  const [state, setState] = useState<EmailCheckState>({ status: "idle" });
  const seen = useRef<Map<string, EmailCheckState>>(new Map());
  const warned = useRef<Set<string>>(new Set());
  const inflight = useRef<AbortController | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      inflight.current?.abort();
    };
  }, []);

  const check = useCallback(
    async (value: string): Promise<EmailCheckState> => {
      if (!looksComplete(value)) {
        // Incomplete or malformed: the form's own check owns that message.
        const idle: EmailCheckState = { status: "idle" };
        if (mounted.current) setState(idle);
        return idle;
      }
      const key = keyOf(value);
      const cached = seen.current.get(key);
      if (cached) {
        if (mounted.current) setState(cached);
        return cached;
      }

      inflight.current?.abort();
      const controller = new AbortController();
      inflight.current = controller;
      const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
      if (mounted.current) setState({ status: "checking" });

      let result: EmailCheckState = { status: "ok" };
      let real = false;
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: value.trim().slice(0, 254) }),
          signal: controller.signal,
        });
        const data = (await res.json().catch(() => ({}))) as {
          message?: unknown;
          suggestion?: unknown;
          result?: unknown;
        };
        if (res.ok && typeof data.message === "string" && data.message) {
          result = {
            status: "warn",
            message: data.message,
            ...(typeof data.suggestion === "string" && data.suggestion ? { suggestion: data.suggestion } : {}),
          };
        }
        real = res.ok && typeof data.result === "string" && data.result !== "accepted";
      } catch (err) {
        // A superseded request is not a result. A timeout or network failure
        // is "ok": never the visitor's problem.
        if ((err as Error)?.name === "AbortError" && inflight.current !== controller) {
          clearTimeout(timer);
          return { status: "checking" };
        }
      } finally {
        clearTimeout(timer);
      }

      // Only real verdicts are remembered; a fail-open is retried next time.
      if (real) seen.current.set(key, result);
      if (mounted.current) setState(result);
      return result;
    },
    [endpoint],
  );

  const onChange = useCallback((_value: string) => {
    setState((prev) => (prev.status === "warn" ? { status: "idle" } : prev));
  }, []);

  const onBlur = useCallback(
    (value: string) => {
      void check(value).then((r) => {
        if (r.status === "warn") warned.current.add(keyOf(value));
      });
    },
    [check],
  );

  const confirm = useCallback(
    async (value: string) => {
      const key = keyOf(value);
      if (warned.current.has(key)) return true; // they have seen it; their call
      const r = await check(value);
      if (r.status !== "warn") return true;
      warned.current.add(key);
      return false;
    },
    [check],
  );

  return { state, onChange, onBlur, confirm };
}
