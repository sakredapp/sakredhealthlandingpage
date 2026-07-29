import { Link } from "wouter";
import { Leaf, Droplets, Activity, Sprout, Moon, ArrowRight } from "lucide-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Reveal, StampHeading, GlowCard, stagger, AmbientBlob } from "@/components/motion";
import { useSeo, SITE_URL } from "@/lib/seo";
import { SITE_IMAGES, hasImage } from "@/data/site-images";
import { PRODUCTS } from "@/data/products";

/**
 * The story behind the name. Deliberately written as a statement of what we
 * care about — nutrition, movement, detox, gut health, rest — and NOT as
 * medical claims. No promises to treat, cure, or prevent anything; nothing
 * framed as a substitute for a physician. The disclaimer at the bottom is
 * load-bearing, not decoration: keep it if this copy is ever edited.
 */
const PILLARS = [
  {
    icon: <Leaf className="w-6 h-6" />,
    title: "Food as the foundation",
    body: "What you eat every day does more for how you feel than almost anything else. We're big believers in whole, real, unprocessed food — and in learning to read a label like it matters, because it does.",
  },
  {
    icon: <Sprout className="w-6 h-6" />,
    title: "Gut health & your microbiome",
    body: "So much of how people feel traces back to the gut. Fermented foods, fiber, cutting the junk that disrupts your microbiome — it's unglamorous, everyday stuff, and it's where we spend a lot of our attention.",
  },
  {
    icon: <Droplets className="w-6 h-6" />,
    title: "Detoxing & cleansing",
    body: "Your body already knows how to clear what it doesn't need. We're interested in supporting that — hydration, sweat, sleep, cleaner products, fewer inputs working against you.",
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: "Movement & fitness",
    body: "Not punishment workouts. Consistent, sustainable movement — walking, lifting, mobility — the kind you can still be doing in thirty years, because that's the whole point.",
  },
  {
    icon: <Moon className="w-6 h-6" />,
    title: "Rest & recovery",
    body: "Sleep is where the repair actually happens. Routines, light, wind-down, stress that isn't running the show. It's the piece almost everyone skips first and misses most.",
  },
];

export default function About() {
  useSeo({
    title: "Why We're Called Sakred Health — Our Story & Philosophy",
    description:
      "Sakred Health is a licensed insurance agency built by people who care about holistic wellness — nutrition, gut health, movement, and rest — alongside the coverage that protects your family.",
    canonical: "/about",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "About Sakred Health",
      url: `${SITE_URL}/about`,
      about: {
        "@type": "InsuranceAgency",
        name: "Sakred Health",
        url: SITE_URL,
      },
    },
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navigation />
      <main className="pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden pb-12 lg:pb-16">
          <AmbientBlob
            className="absolute top-0 right-0 w-96 h-96 bg-[#EBD598]/25 rounded-full blur-3xl"
            animate={{ x: [0, -25, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
            duration={11}
          />
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Reveal>
              <p className="text-sm font-medium uppercase tracking-wider text-[#C5A059] mb-3">Our Story</p>
            </Reveal>
            <StampHeading
              as="h1"
              text="Why we're called"
              accent="Sakred Health"
              className="text-4xl sm:text-5xl font-display font-normal tracking-tight text-[#2C2C2C] mb-6"
            />
            <Reveal delay={0.14}>
              <p className="text-lg text-[#2C2C2C]/70 leading-relaxed">
                Because we think the body is worth treating that way. Most of us were handed a system that
                waits until something breaks. We'd rather pay attention to what keeps people well in the
                first place — and make sure the people they love are protected either way.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Story + portrait */}
        <section className="py-12 lg:py-16 bg-[#F6F4EF]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={`grid grid-cols-1 ${
                hasImage(SITE_IMAGES.aboutStory) ? "lg:grid-cols-2" : ""
              } gap-10 lg:gap-16 items-center`}
            >
              <div>
                <StampHeading
                  text="Healing starts"
                  accent="from the inside"
                  className="text-2xl sm:text-3xl font-display font-normal text-[#2C2C2C] mb-5"
                />
                <Reveal delay={0.1}>
                  <div className="space-y-4 text-[#2C2C2C]/70 leading-relaxed">
                    <p>
                      Sakred Health started with a simple frustration: healthcare in this country is very
                      good at treating you after something goes wrong, and not especially interested in the
                      years before that.
                    </p>
                    <p>
                      We're the kind of people who read the ingredient list. Who care about what's in the
                      water, what's in the food, and what a decade of small daily habits actually adds up
                      to. We believe a lot of how people feel is built at home — in the kitchen, on a walk,
                      in a real night's sleep — long before it ever shows up in a doctor's office.
                    </p>
                    <p>
                      <strong className="text-[#2C2C2C]">To be clear about what that does and doesn't mean:</strong>{" "}
                      we're not doctors, and we'd never tell you to skip yours. We're enthusiastic about
                      nutrition, movement, and prevention — not opposed to medicine. The best outcomes we've
                      seen come from people who do both.
                    </p>
                    <p>
                      And because life is unpredictable no matter how well you live, we do the practical
                      part too: the coverage that keeps a family in their home and out of debt when
                      something happens. That's the other half of the name.
                    </p>
                  </div>
                </Reveal>
              </div>

              {hasImage(SITE_IMAGES.aboutStory) && (
                <Reveal delay={0.12} y={24}>
                  <img
                    src={SITE_IMAGES.aboutStory.src}
                    alt={SITE_IMAGES.aboutStory.alt}
                    className="w-full h-auto rounded-3xl border border-[#E8E4DC] shadow-[0_20px_50px_-20px_rgba(197,160,89,0.35)]"
                    loading="lazy"
                  />
                </Reveal>
              )}
            </div>
          </div>
        </section>

        {/* What we're passionate about */}
        <section className="py-12 lg:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <StampHeading
                text="What we actually"
                accent="care about"
                className="text-3xl sm:text-4xl font-display font-normal text-[#2C2C2C] mb-4"
              />
              <Reveal delay={0.12}>
                <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto">
                  Not a program to buy. Just the things we're genuinely passionate about, and the reason
                  the app has a habit tracker and a library in it at all.
                </p>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {PILLARS.map((p, i) => (
                <Reveal key={p.title} delay={stagger(i)}>
                  <GlowCard className="group h-full bg-white rounded-2xl border border-[#E8E4DC] p-6 hover:border-[#C5A059]/40 hover:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C5A059]/10 to-[#EBD598]/10 flex items-center justify-center text-[#C5A059] mb-4 group-hover:from-[#C5A059]/20 group-hover:to-[#EBD598]/20 transition-colors duration-300">
                      {p.icon}
                    </div>
                    <h3 className="font-display font-semibold text-[#2C2C2C] text-base mb-2">{p.title}</h3>
                    <p className="text-sm text-[#2C2C2C]/65 leading-relaxed">{p.body}</p>
                  </GlowCard>
                </Reveal>
              ))}

              {/* Bridge card into the insurance side */}
              <Reveal delay={stagger(PILLARS.length)}>
                <div className="h-full rounded-2xl border border-[#C5A059]/30 bg-gradient-to-br from-[#FBF7EE] to-[#F6F0E2] p-6 flex flex-col">
                  <h3 className="font-display font-semibold text-[#2C2C2C] text-base mb-2">
                    …and the coverage behind it
                  </h3>
                  <p className="text-sm text-[#2C2C2C]/65 leading-relaxed flex-1">
                    Living well is the goal. Coverage is the floor underneath it — mortgage protection,
                    life, health, and retirement, handled by a licensed agent who knows your whole picture.
                  </p>
                  <Link href="/products">
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#2C2C2C] hover:gap-2.5 transition-all cursor-pointer">
                      See what we offer
                      <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                    </span>
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Optional supporting photography */}
        {SITE_IMAGES.aboutGrid.some(hasImage) && (
          <section className="pb-12 lg:pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {SITE_IMAGES.aboutGrid.filter(hasImage).map((img, i) => (
                  <Reveal key={img.src} delay={i * 0.08}>
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-64 object-cover rounded-2xl border border-[#E8E4DC]"
                      loading="lazy"
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Products strip */}
        <section className="py-12 lg:py-16 bg-[#F9F9F7]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <StampHeading
              text="One agency,"
              accent="every layer"
              className="text-2xl sm:text-3xl font-display font-normal text-[#2C2C2C] mb-6"
            />
            <Reveal delay={0.1}>
              <div className="flex flex-wrap justify-center gap-2.5 mb-8">
                {PRODUCTS.map((p) => (
                  <Link key={p.slug} href={`/products/${p.slug}`}>
                    <span className="inline-block text-sm text-[#2C2C2C]/75 bg-white border border-[#E8E4DC] rounded-full px-4 py-2 hover:border-[#C5A059]/50 hover:text-[#2C2C2C] transition-colors cursor-pointer">
                      {p.title}
                    </span>
                  </Link>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.18}>
              <Link href="/products">
                <Button
                  size="lg"
                  className="rounded-full btn-gold-gradient text-[#2C2C2C] px-8 py-6 text-base font-normal shadow-lg shadow-[#C5A059]/20 hover:shadow-[#C5A059]/40 hover:-translate-y-0.5 transition-all border border-[#C5A059]"
                >
                  Find your coverage
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Reveal>
          </div>
        </section>

        {/* Load-bearing disclaimer — do not remove. */}
        <section className="py-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs text-[#2C2C2C]/45 leading-relaxed text-center">
              Sakred Health is a licensed insurance agency. The wellness content we publish reflects what
              we're personally interested in and is provided for general educational purposes only. It is
              not medical advice, and it is not intended to diagnose, treat, cure, or prevent any disease.
              Nothing here is a substitute for care from a qualified physician — please talk to your doctor
              before changing your diet, exercise, supplements, or any treatment plan.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
