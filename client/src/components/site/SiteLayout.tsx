/**
 * The page shell.
 *
 * Every public page renders through this so the header, the footer, the skip
 * link and the scroll-progress hairline can't drift apart. Before this existed
 * each page hand-assembled `<Navigation/> … <Footer/>`, which is why some pages
 * had a scroll bar and others didn't.
 */
import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { ScrollProgress } from "@/components/motion";

interface SiteLayoutProps {
  children: ReactNode;
  /**
   * Set on pages whose content starts under the fixed header (i.e. anything
   * without a full-bleed hero) — it both makes the header opaque from the
   * first frame and adds the top padding the content needs.
   */
  solidHeader?: boolean;
  /** The hairline under the nav. Off on tool pages like /discover. */
  progress?: boolean;
  className?: string;
}

export function SiteLayout({
  children,
  solidHeader = false,
  progress = true,
  className,
}: SiteLayoutProps) {
  return (
    <div className={`min-h-screen bg-sakred-canvas ${className ?? ""}`}>
      {/* Keyboard users shouldn't have to tab through eleven nav links to
          reach a map with fifty pins in it. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:border focus:border-sakred-gold focus:bg-sakred-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-sakred-espresso"
      >
        Skip to content
      </a>

      <SiteHeader solid={solidHeader} />
      {progress && <ScrollProgress />}

      <main id="main" className={solidHeader ? "pt-16" : undefined}>
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
