import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquareText } from "lucide-react";

/**
 * "Text us" CTA. Resolves the local number from /api/local-number (by ?state for
 * state pages, else geo) and deep-links to SMS with the product keyword as the
 * body — e.g. sms:+13252991182?&body=MP. The `?&` form is required: iOS needs
 * the &, Android needs the ?. Renders nothing until a number resolves, so it
 * quietly stays hidden until the CRM numbers endpoint is live.
 */
export function TextCta({
  keyword,
  state,
  className,
}: {
  keyword: string;
  state?: string;
  className?: string;
}) {
  const [number, setNumber] = useState<string | null>(null);
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = state ? `/api/local-number?state=${encodeURIComponent(state)}` : "/api/local-number";
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.number) return;
        setNumber(data.number);
        setDisplay(data.display ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [state]);

  if (!number) return null;

  const href = `sms:${number}?&body=${encodeURIComponent(keyword)}`;

  // The keyword MUST be in the visible label, not just the link: people who read
  // the number off the page and type it into Messages themselves never hit the
  // link, and a text with no keyword lands unassigned in the CRM.
  return (
    <a href={href} className={className}>
      <Button
        size="lg"
        variant="outline"
        className="rounded-full border-[#C5A059] text-[#2C2C2C] hover:bg-[#C5A059]/5 px-8 py-6 text-base font-normal"
      >
        <MessageSquareText className="w-4 h-4 mr-2" />
        {display ? `Text ${keyword} to ${display}` : `Text ${keyword}`}
      </Button>
    </a>
  );
}
