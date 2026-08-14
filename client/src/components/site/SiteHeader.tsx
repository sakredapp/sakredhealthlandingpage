/**
 * The site header.
 *
 * Two states: transparent while the visitor is still inside a full-bleed hero,
 * and an ivory blurred bar with a warm hairline once they've scrolled past it.
 * Pages without a full-bleed hero pass `solid` and start in the second state —
 * a transparent header over a white page is an invisible header.
 */
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, Menu, X } from "lucide-react";
import { COVERAGE_LINKS, PRIMARY_NAV } from "./nav-data";
import { track } from "@/lib/analytics";
import sakredLogo from "@assets/full_png_image_sakred__1771270183106.png";

interface SiteHeaderProps {
  /** Start opaque. Set on every page whose content begins under the header. */
  solid?: boolean;
}

export function SiteHeader({ solid = false }: SiteHeaderProps) {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [coverageOpen, setCoverageOpen] = useState(false);
  const coverageRef = useRef<HTMLDivElement>(null);

  const opaque = solid || scrolled;

  /* The bar changes at 24px rather than 0 so a one-pixel scroll jitter at the
     top of the page doesn't strobe the background. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Any navigation closes everything.
  useEffect(() => {
    setDrawerOpen(false);
    setCoverageOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  /* Dismiss the Coverage menu on outside click and on Escape. Without the
     Escape handler a keyboard user who opens the menu has no way to close it
     without tabbing through all six links. */
  useEffect(() => {
    if (!coverageOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!coverageRef.current?.contains(event.target as Node)) setCoverageOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCoverageOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [coverageOpen]);

  const isActive = (href: string) =>
    href.startsWith("/#") ? false : location === href || location.startsWith(`${href}/`);

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors duration-micro ${
      isActive(href)
        ? "text-sakred-gold-deep"
        : opaque
          ? "text-sakred-ink/75 hover:text-sakred-espresso"
          : "text-sakred-espresso/80 hover:text-sakred-espresso"
    }`;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[60] transition-all duration-500 ease-settle ${
          opaque
            ? "border-b border-sakred-stone/70 bg-sakred-surface/85 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center" aria-label="Sakred Health — home">
            <img src={sakredLogo} alt="Sakred Health" className="h-9 w-auto" />
          </Link>

          {/* ---- desktop ---- */}
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            {PRIMARY_NAV.slice(0, 3).map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                {link.label}
              </Link>
            ))}

            <div ref={coverageRef} className="relative">
              <button
                type="button"
                onClick={() => setCoverageOpen((open) => !open)}
                aria-expanded={coverageOpen}
                aria-controls="coverage-menu"
                className={`flex items-center gap-1 ${linkClass("/products")}`}
              >
                Coverage
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-micro ${
                    coverageOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {coverageOpen && (
                <div
                  id="coverage-menu"
                  className="absolute left-1/2 top-full z-10 mt-3 w-[22rem] -translate-x-1/2 overflow-hidden rounded-2xl border border-sakred-stone bg-sakred-surface p-2 shadow-[0_28px_60px_-30px_rgba(28,26,23,0.45)]"
                >
                  {COVERAGE_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() =>
                        track("coverage_clicked", {
                          surface: "header",
                          product: link.href.split("/").pop(),
                        })
                      }
                      className="block rounded-xl px-3 py-2.5 transition-colors duration-micro hover:bg-sakred-surface-alt"
                    >
                      <span className="block text-sm font-medium text-sakred-espresso">
                        {link.label}
                      </span>
                      {link.description && (
                        <span className="mt-0.5 block text-xs leading-snug text-sakred-ink/55">
                          {link.description}
                        </span>
                      )}
                    </Link>
                  ))}
                  <Link
                    href="/products"
                    className="mt-1 block border-t border-sakred-stone/70 px-3 pb-1 pt-3 text-xs font-medium text-sakred-gold-deep hover:text-sakred-espresso"
                  >
                    See all coverage →
                  </Link>
                </div>
              )}
            </div>

            {PRIMARY_NAV.slice(3).map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 lg:block">
            <Link
              href="/app"
              onClick={() => track("download_app_clicked", { surface: "header" })}
              className="inline-flex items-center rounded-full border border-sakred-gold bg-gradient-to-r from-sakred-gold via-sakred-gold-light to-sakred-gold px-5 py-2 text-sm font-medium text-sakred-espresso shadow-sm shadow-sakred-gold/25 transition-all duration-micro hover:-translate-y-0.5 hover:shadow-md hover:shadow-sakred-gold/35"
            >
              Download App
            </Link>
          </div>

          {/* ---- mobile ---- */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/discover"
              className="rounded-full border border-sakred-gold/50 bg-sakred-surface/80 px-3.5 py-1.5 text-xs font-medium text-sakred-gold-deep"
            >
              Find care
            </Link>
            <button
              type="button"
              onClick={() => setDrawerOpen((open) => !open)}
              aria-expanded={drawerOpen}
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              className="p-2 text-sakred-espresso/75 transition-colors duration-micro hover:text-sakred-espresso"
            >
              {drawerOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* ---- mobile drawer ---- *
       * A full sheet rather than a dropdown: the Coverage list alone is six
       * items, and a nested accordion on a phone is a worse experience than one
       * long, scrollable, thumb-reachable list. */}
      {drawerOpen && (
        <div className="fixed inset-0 top-16 z-[55] overflow-y-auto bg-sakred-canvas lg:hidden">
          <nav className="px-6 pb-16 pt-6" aria-label="Mobile">
            {PRIMARY_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block border-b border-sakred-stone/60 py-3.5 text-lg font-medium text-sakred-espresso"
              >
                {link.label}
              </Link>
            ))}

            <p className="pb-2 pt-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-sakred-gold-deep">
              Coverage
            </p>
            {COVERAGE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block border-b border-sakred-stone/40 py-3 text-base text-sakred-ink/80"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/recommend"
              className="mt-7 block text-base font-medium text-sakred-gold-deep"
            >
              Recommend a practitioner →
            </Link>

            <Link
              href="/app"
              className="mt-6 block rounded-full border border-sakred-gold bg-gradient-to-r from-sakred-gold via-sakred-gold-light to-sakred-gold px-6 py-3.5 text-center text-base font-medium text-sakred-espresso"
            >
              Download App
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
