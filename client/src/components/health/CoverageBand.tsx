/**
 * "Your health deserves protection too." — the insurance pillar on the
 * homepage.
 *
 * This band is doing something specific: it has to be unmissable without
 * taking the page back. So it changes *material* rather than volume — the
 * latte plane, deeper and warmer than everything above it, so a visitor
 * scrolling past registers "different system, same company" before they read a
 * word (brief §14, §15).
 *
 * The copy is the existing product copy, unchanged. Those lines — "Keep the
 * home, not the payment", "So the hardest week never comes with a bill" — are
 * the best writing on the old site and rewriting them into generic corporate
 * insurance voice would be a downgrade dressed up as a redesign.
 */
import { Link } from "wouter";
import { StampHeading, StaggerChildren, StaggerItem } from "@/components/motion";
import { PRODUCTS } from "@/data/products";
import { COVERAGE_GLYPHS } from "./CoverageGlyphs";
import { track } from "@/lib/analytics";

export function CoverageBand() {
  return (
    <section id="coverage" className="surface-latte py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-sakred-gold-deep">
            Sakred Coverage
          </p>
          <StampHeading
            as="h2"
            text="Your health deserves"
            accent="protection too."
            className="font-display text-3xl leading-tight tracking-tight text-sakred-espresso sm:text-4xl"
          />
          <p className="mt-4 max-w-xl text-base leading-relaxed text-sakred-ink/70">
            Sakred also helps families protect their health, income, home and
            retirement with licensed insurance guidance — one dedicated agent,
            all fifty states.
          </p>
        </div>

        <StaggerChildren
          as="ul"
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          step={0.06}
        >
          {PRODUCTS.map((product) => {
            const Glyph = COVERAGE_GLYPHS[product.slug];
            return (
              <StaggerItem as="li" key={product.slug}>
                <Link
                  href={`/products/${product.slug}`}
                  onClick={() =>
                    track("coverage_clicked", { surface: "homepage", product: product.slug })
                  }
                  className="group flex h-full flex-col rounded-2xl border border-sakred-espresso/10 bg-sakred-surface/75 p-6 backdrop-blur-sm lift-card"
                >
                  {Glyph && (
                    <div className="mb-5 h-14 w-20 opacity-80 transition-opacity duration-card group-hover:opacity-100">
                      <Glyph />
                    </div>
                  )}
                  <h3 className="font-display text-xl leading-tight text-sakred-espresso">
                    {product.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium leading-snug text-sakred-gold-deep">
                    {product.tagline}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-sakred-ink/60">
                    {product.blurb}
                  </p>
                  <span className="mt-5 text-sm font-medium text-sakred-espresso">
                    Learn more{" "}
                    <span
                      aria-hidden="true"
                      className="inline-block text-sakred-gold transition-transform duration-micro group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerChildren>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/products"
            className="inline-flex items-center rounded-full border border-sakred-espresso/20 bg-sakred-surface px-6 py-3 text-sm font-medium text-sakred-espresso lift-card"
          >
            Explore coverage
          </Link>
          <Link
            href="/get-coverage"
            onClick={() => track("quote_started", { surface: "homepage" })}
            className="inline-flex items-center rounded-full border border-sakred-gold bg-gradient-to-r from-sakred-gold via-sakred-gold-light to-sakred-gold px-6 py-3 text-sm font-medium text-sakred-espresso transition-transform duration-micro hover:-translate-y-0.5"
          >
            Get a quote
          </Link>
          <p className="text-xs text-sakred-ink/50">
            Free consultation — no obligation, no pressure.
          </p>
        </div>
      </div>
    </section>
  );
}
