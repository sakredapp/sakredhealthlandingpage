/**
 * Cloudflare Turnstile.
 *
 * Loads the script once per page, renders an invisible-by-default widget, and
 * hands the token up. Chosen over a visible CAPTCHA because the people filling
 * in the practitioner form are practitioners, and making them identify
 * crosswalks is a good way to lose applications.
 *
 * ── Unconfigured ─────────────────────────────────────────────────────
 *
 * With no `VITE_TURNSTILE_SITE_KEY` this renders nothing and reports an empty
 * token. That is the local-development path — the *server* is what decides
 * whether a missing challenge is acceptable, and in production it refuses.
 * A client that silently skips the check cannot weaken anything.
 */
import { useEffect, useId, useRef, useState } from "react";

const SITE_KEY: string | undefined = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          appearance?: "always" | "execute" | "interaction-only";
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      remove: (id: string) => void;
      reset: (id: string) => void;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

/** One script tag per document, however many widgets ask for it. */
function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    if (window.turnstile) return resolve();

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("turnstile failed to load")));
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("turnstile failed to load"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function useTurnstileConfigured(): boolean {
  return Boolean(SITE_KEY);
}

interface TurnstileProps {
  /** Called with the token, or "" when it expires or errors. */
  onToken: (token: string) => void;
  className?: string;
}

export function Turnstile({ onToken, className }: TurnstileProps) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const [failed, setFailed] = useState(false);
  const domId = useId();

  useEffect(() => {
    onTokenRef.current = onToken;
  });

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: SITE_KEY,
          // Only shows itself if Cloudflare wants a human in the loop.
          appearance: "interaction-only",
          theme: "light",
          callback: (token) => onTokenRef.current(token),
          "error-callback": () => {
            setFailed(true);
            onTokenRef.current("");
          },
          "expired-callback": () => onTokenRef.current(""),
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, []);

  if (!SITE_KEY) return null;

  return (
    <div className={className}>
      <div ref={ref} id={domId} />
      {failed && (
        <p className="mt-2 text-xs text-sakred-ink/55">
          The verification check couldn&rsquo;t load — this is usually an ad blocker or a
          network filter. Disable it for this page, or email us and we&rsquo;ll take your
          details directly.
        </p>
      )}
    </div>
  );
}
