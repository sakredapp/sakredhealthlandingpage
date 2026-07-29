import { useParams, Link } from "wouter";
import { ArrowLeft, Check } from "lucide-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { TextCta } from "@/components/TextCta";
import { ProductIntakeForm } from "@/components/ProductIntakeForm";
import { useSeo, SITE_URL } from "@/lib/seo";
import { getProduct } from "@/data/products";

export default function ProductDetail() {
  const { slug = "" } = useParams<{ slug: string }>();
  const product = getProduct(slug);

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
      <main className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/products" className="inline-flex items-center gap-2 text-[#C5A059] hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span>All products</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* copy */}
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

              <Reveal delay={0.2}>
                <TextCta keyword={product.smsKeyword} />
              </Reveal>
            </div>

            {/* form */}
            <Reveal delay={0.1} y={24}>
              <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
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
      </main>
      <Footer />
    </div>
  );
}
