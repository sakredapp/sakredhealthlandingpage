import { useParams, Link } from "wouter";
import { ArrowLeft, Check } from "lucide-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Reveal, StampHeading } from "@/components/motion";
import { TextCta } from "@/components/TextCta";
import { ProductIntakeForm } from "@/components/ProductIntakeForm";
import { ProductDemo } from "@/components/ProductDemos";
import { CoverageCalculator } from "@/components/landing/CoverageCalculator";
import { MortgageCalculator } from "@/components/landing/MortgageCalculator";
import { useSeo, SITE_URL } from "@/lib/seo";
import { getProduct } from "@/data/products";
import { PRODUCT_PAGE_IMAGES, hasImage } from "@/data/site-images";

export default function ProductDetail() {
  const { slug = "" } = useParams<{ slug: string }>();
  const product = getProduct(slug);
  const photo = PRODUCT_PAGE_IMAGES[slug];

  useSeo({
    title: product
      ? `${product.title} — ${product.tagline} | Sakred Health`
      : "Product not found | Sakred Health",
    description: product?.blurb ?? "Explore coverage options with Sakred Health.",
    canonical: product ? `/products/${product.slug}` : "/products",
    noindex: !product,
    jsonLd: product
      ? {
          "@context": "https://schema.org",
          "@type": "Service",
          name: product.title,
          description: product.blurb,
          serviceType: product.title,
          provider: { "@type": "InsuranceAgency", name: "Sakred Health", url: SITE_URL },
          areaServed: { "@type": "Country", name: "United States" },
          url: `${SITE_URL}/products/${product.slug}`,
        }
      : undefined,
  });

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navigation />
        <main className="pt-24 pb-20 px-4 text-center">
          <div className="max-w-lg mx-auto py-20">
            <h1 className="text-3xl font-display font-normal text-[#2C2C2C] mb-4">Product not found</h1>
            <p className="text-[#2C2C2C]/60 mb-8">That page doesn't exist or has moved.</p>
            <Button asChild className="rounded-full btn-gold-gradient text-[#2C2C2C] border border-[#C5A059]">
              <Link href="/products">See all products</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navigation />
      <main className="pt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/products" className="inline-flex items-center gap-2 text-[#C5A059] hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span>All products</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* copy + animated demo */}
            <div>
              <Reveal>
                <p className="text-sm font-medium uppercase tracking-wider text-[#C5A059] mb-3">{product.pillar}</p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-normal text-[#2C2C2C] mb-3 leading-tight">
                  {product.title}
                </h1>
                <p className="text-xl text-[#2C2C2C]/80 mb-5">{product.tagline}</p>
                <p className="text-lg text-[#2C2C2C]/65 leading-relaxed mb-8">{product.blurb}</p>
              </Reveal>

              <Reveal delay={0.12}>
                <ul className="space-y-3 mb-8">
                  {product.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#C5A059] to-[#EBD598] flex items-center justify-center mt-0.5">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </span>
                      <span className="text-[#2C2C2C]/75 leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>

              {/* Animated "what this coverage does" vignette */}
              <Reveal delay={0.18}>
                <div className="mb-8">
                  <ProductDemo slug={product.slug} />
                </div>
              </Reveal>

              <Reveal delay={0.24}>
                <TextCta keyword={product.smsKeyword} />
              </Reveal>
            </div>

            {/* form */}
            <Reveal delay={0.1} y={24}>
              <div
                id="inquire"
                className="scroll-mt-28 bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] lg:sticky lg:top-24"
              >
                <h2 className="font-display font-semibold text-xl text-[#2C2C2C] mb-1">
                  Inquire about {product.title}
                </h2>
                <p className="text-sm text-[#2C2C2C]/55 mb-6">
                  A licensed agent will reach out — no obligation, no pressure.
                </p>
                <ProductIntakeForm
                  product={product.slug}
                  productTitle={product.title}
                  amountLabel={product.amountLabel}
                />
              </div>
            </Reveal>
          </div>
        </div>

        {/* Deep-dive sections */}
        {product.detailSections?.map((section) => (
          <section key={section.heading} className="py-12 lg:py-16 mt-12 bg-[#F6F4EF]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div
                className={`grid grid-cols-1 ${
                  photo && hasImage(photo) ? "lg:grid-cols-[1fr_360px]" : ""
                } gap-10 items-start`}
              >
                <div>
                  <StampHeading
                    text={section.heading}
                    className="text-2xl sm:text-3xl font-display font-normal text-[#2C2C2C] mb-5"
                  />
                  {section.intro?.map((p) => (
                    <Reveal key={p.slice(0, 24)} delay={0.08}>
                      <p className="text-[#2C2C2C]/70 leading-relaxed mb-4">{p}</p>
                    </Reveal>
                  ))}
                  <Reveal delay={0.12}>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 my-6">
                      {section.items.map((item) => (
                        <li key={item.name} className="flex items-start gap-2.5">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#C5A059] shrink-0" />
                          <span className="text-sm sm:text-base leading-snug">
                            <span className="font-display font-semibold text-[#2C2C2C]">{item.name}</span>
                            <span className="text-[#2C2C2C]/55"> — {item.description}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                  {section.outro && (
                    <Reveal delay={0.16}>
                      <p className="text-[#2C2C2C]/70 leading-relaxed">{section.outro}</p>
                    </Reveal>
                  )}
                </div>
                {photo && hasImage(photo) && (
                  <Reveal delay={0.14} y={24}>
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className="w-full h-64 lg:h-80 object-cover rounded-3xl border border-[#E8E4DC] shadow-[0_20px_50px_-25px_rgba(197,160,89,0.45)]"
                      loading="lazy"
                    />
                  </Reveal>
                )}
              </div>
            </div>
          </section>
        ))}

        {/* Interactive estimators */}
        {product.slug === "mortgage-protection" && <MortgageCalculator ctaHref="#inquire" />}
        {product.slug === "life-insurance" && (
          <CoverageCalculator ctaHref="#inquire" ctaLabel="Get a real quote" />
        )}
      </main>
      <Footer />
    </div>
  );
}
