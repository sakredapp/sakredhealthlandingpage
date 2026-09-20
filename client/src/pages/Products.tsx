/**
 * /products — the Coverage hub.
 *
 * Kept at its existing URL with its existing product routes intact; what
 * changed is the material. This page sits on the grounded latte plane rather
 * than the discovery ivory, so a visitor arriving from the homepage's coverage
 * band lands somewhere that feels continuous with it, and a visitor arriving
 * from an insurance ad lands somewhere that is unmistakably an agency.
 *
 * The product copy is untouched. Those taglines are the strongest writing on
 * the old site.
 */
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { COVERAGE_GLYPHS } from "@/components/health/CoverageGlyphs";
import { EditorialImage } from "@/components/health/EditorialImage";
import { HEALTH_IMAGES } from "@/data/health-images";
import {
  StampHeading,
  Reveal,
  StaggerChildren,
  StaggerItem,
} from "@/components/motion";
import { PILLARS, PRODUCTS } from "@/data/products";
import { useSeo, SITE_URL } from "@/lib/seo";
import { track } from "@/lib/analytics";

export default function Products() {
  useSeo({
    title: "Coverage Options — Life, Health & Mortgage Protection",
    description:
      "Mortgage protection, life insurance, final expense, private health, ACA marketplace plans, and retirement annuities — one licensed agency, one dedicated agent, all 50 states.",
    canonical: "/products",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "InsuranceAgency",
      name: "Sakred Health",
      url: `${SITE_URL}/products`,
      areaServed: { "@type": "Country", name: "United States" },
      makesOffer: PRODUCTS.map((product) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: product.title,
          description: product.blurb,
        },
        url: `${SITE_URL}/products/${product.slug}`,
      })),
    },
  });

  return (
    <SiteLayout solidHeader>
      {/* ---- header ---- */}
      <header className="surface-latte border-b border-sakred-espresso/10">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.25fr_1fr] lg:gap-14 lg:px-8 lg:py-20">
          <div>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-sakred-gold-deep">
            Sakred Coverage
          </p>
          <StampHeading
            as="h1"
            text="Protection built around"
            accent="real life."
            className="font-display text-3xl leading-tight tracking-tight text-sakred-espresso sm:text-4xl lg:text-5xl"
          />
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-sakred-ink/70 sm:text-lg">
            Your health is part of your life, so we cover the whole picture — the health
            plan, the mortgage protection behind it, and the retirement income after it.
            One licensed agency, one dedicated agent, all fifty states.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/get-coverage"
              onClick={() => track("quote_started", { surface: "products" })}
              className="inline-flex items-center rounded-full border border-sakred-gold bg-gradient-to-r from-sakred-gold via-sakred-gold-light to-sakred-gold px-6 py-3 text-sm font-medium text-sakred-espresso transition-transform duration-micro hover:-translate-y-0.5"
            >
              Get a quote
            </Link>
            <span className="text-sm text-sakred-ink/60">
              Free consultation — no obligation, no pressure.
            </span>
          </div>
          </div>

          {/* Architecture and home, not a handshake or an umbrella. This is the
              one photograph on the coverage plane, and it does the work six
              stock images of smiling agents would not. */}
          <EditorialImage
            photo={HEALTH_IMAGES.coverage}
            className="aspect-[5/4] w-full rounded-3xl"
            sizes="(max-width: 1024px) 100vw, 480px"
          />
        </div>
      </header>

      {/* ---- the six, grouped by pillar ---- */}
      <div className="bg-sakred-canvas py-16 sm:py-20">
        <div className="mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
          {PILLARS.map((pillar) => {
            const items = PRODUCTS.filter((product) => product.pillar === pillar.name);
            return (
              <section key={pillar.name}>
                <Reveal>
                  <div className="mb-7 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h2 className="font-display text-2xl text-sakred-espresso">
                      {pillar.name}
                    </h2>
                    <span
                      className="rule-gold hidden min-w-[3rem] flex-1 sm:block"
                      aria-hidden="true"
                    />
                    <p className="text-sm text-sakred-ink/55">{pillar.blurb}</p>
                  </div>
                </Reveal>

                <StaggerChildren
                  as="ul"
                  className={`grid gap-5 ${
                    items.length === 1 ? "" : "sm:grid-cols-2 lg:grid-cols-3"
                  }`}
                >
                  {items.map((product) => {
                    const Glyph = COVERAGE_GLYPHS[product.slug];
                    return (
                      <StaggerItem as="li" key={product.slug}>
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={() =>
                            track("coverage_clicked", {
                              surface: "products",
                              product: product.slug,
                            })
                          }
                          className="group flex h-full flex-col overflow-hidden rounded-2xl border border-sakred-stone bg-sakred-surface lift-card"
                        >
                          {/* The glyph plate stands in for photography and
                              carries the gold line language from the homepage
                              coverage band, so the two read as one system. */}
                          <div className="surface-latte flex h-36 items-center justify-center border-b border-sakred-stone/70">
                            {Glyph && (
                              <div className="h-20 w-28 opacity-85 transition-opacity duration-card group-hover:opacity-100">
                                <Glyph />
                              </div>
                            )}
                          </div>

                          <div className="flex flex-1 flex-col p-6">
                            <h3 className="font-display text-xl leading-tight text-sakred-espresso">
                              {product.title}
                            </h3>
                            <p className="mt-1.5 text-sm font-medium text-sakred-gold-deep">
                              {product.tagline}
                            </p>
                            <p className="mt-3 flex-1 text-sm leading-relaxed text-sakred-ink/65">
                              {product.blurb}
                            </p>
                            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-sakred-espresso">
                              Inquire about {product.title}
                              <ArrowRight
                                className="h-4 w-4 text-sakred-gold transition-transform duration-micro group-hover:translate-x-0.5"
                                aria-hidden="true"
                              />
                            </span>
                          </div>
                        </Link>
                      </StaggerItem>
                    );
                  })}
                </StaggerChildren>
              </section>
            );
          })}
        </div>
      </div>

      {/* ---- back to the network ---- *
       * Coverage is a major pillar of Sakred, not a separate company. Someone
       * who lands here from an insurance search should be able to find the
       * rest of it without going back to the homepage. */}
      <section className="surface-atlas border-t border-sakred-stone py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-2xl leading-tight text-sakred-espresso">
            There&rsquo;s more to Sakred than coverage
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-sakred-ink/65">
            The same company runs a curated network of practitioners and practices —
            free to search, whether or not you ever buy a policy from us.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/discover"
              className="rounded-full border border-sakred-stone bg-sakred-surface px-5 py-2.5 text-sm font-medium text-sakred-espresso lift-card"
            >
              Find trusted care
            </Link>
            <Link
              href="/app"
              className="rounded-full border border-sakred-stone bg-sakred-surface px-5 py-2.5 text-sm font-medium text-sakred-espresso lift-card"
            >
              Get the app
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
