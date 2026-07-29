import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { Reveal, StampHeading, stagger } from "@/components/motion";
import { useSeo, SITE_URL } from "@/lib/seo";
import { PILLARS, PRODUCTS } from "@/data/products";

export default function Products() {
  useSeo({
    title: "Our Products — Life, Health & Retirement | Sakred Health",
    description:
      "Explore Sakred Health's coverage: mortgage protection, final expense, life insurance, health insurance, Medicare, and retirement annuities — one agency, one dedicated agent.",
    canonical: "/products",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "InsuranceAgency",
      name: "Sakred Health",
      url: `${SITE_URL}/products`,
      makesOffer: PRODUCTS.map((p) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: p.title, description: p.blurb },
        url: `${SITE_URL}/products/${p.slug}`,
      })),
    },
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Reveal>
              <p className="text-sm font-medium uppercase tracking-wider text-[#C5A059] mb-3">What We Offer</p>
            </Reveal>
            <StampHeading
              as="h1"
              text="Everything, under"
              accent="one agent"
              className="text-4xl sm:text-5xl font-display font-normal text-[#2C2C2C] mb-4"
            />
            <Reveal delay={0.12}>
              <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
                Your health is part of your life — so we cover the whole picture. Three pillars, one dedicated
                agent who knows all of it.
              </p>
            </Reveal>
          </div>

          <div className="space-y-14">
            {PILLARS.map((pillar, pi) => {
              const items = PRODUCTS.filter((p) => p.pillar === pillar.name);
              return (
                <div key={pillar.name}>
                  <Reveal>
                    <div className="flex items-baseline gap-4 mb-6">
                      <span className="font-display font-bold text-2xl text-[#C5A059]">
                        {String(pi + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h2 className="font-display font-semibold text-2xl text-[#2C2C2C]">{pillar.name}</h2>
                        <p className="text-sm text-[#2C2C2C]/55">{pillar.blurb}</p>
                      </div>
                    </div>
                  </Reveal>

                  {/* A single-product pillar in a 3-up grid leaves two empty columns,
                      so lay a lone product out as a full-width horizontal card instead. */}
                  {items.length === 1 ? (
                    items.map((p) => (
                      <Reveal key={p.slug}>
                        <Link href={`/products/${p.slug}`}>
                          <div className="group bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-8 hover:border-[#C5A059]/40 hover:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
                            <div className="sm:flex-1">
                              <h3 className="font-display font-semibold text-[#2C2C2C] text-xl mb-1">{p.title}</h3>
                              <p className="text-sm text-[#C5A059] mb-3">{p.eyebrow}</p>
                              <p className="text-sm text-[#2C2C2C]/65 leading-relaxed max-w-2xl">{p.blurb}</p>
                            </div>
                            <span className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-[#2C2C2C] group-hover:gap-2.5 transition-all">
                              Inquire about {p.title}
                              <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                            </span>
                          </div>
                        </Link>
                      </Reveal>
                    ))
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {items.map((p, i) => (
                        <Reveal key={p.slug} delay={stagger(i)}>
                          <Link href={`/products/${p.slug}`}>
                            <div className="group h-full bg-white rounded-2xl border border-[#E8E4DC] p-6 hover:border-[#C5A059]/40 hover:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300 cursor-pointer flex flex-col">
                              <h3 className="font-display font-semibold text-[#2C2C2C] text-lg mb-1">{p.title}</h3>
                              <p className="text-sm text-[#C5A059] mb-3">{p.eyebrow}</p>
                              <p className="text-sm text-[#2C2C2C]/65 leading-relaxed flex-1">{p.blurb}</p>
                              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#2C2C2C] group-hover:gap-2.5 transition-all">
                                Inquire about {p.title}
                                <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                              </span>
                            </div>
                          </Link>
                        </Reveal>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
