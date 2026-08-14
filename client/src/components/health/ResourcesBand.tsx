/**
 * The three resource destinations, as three distinct materials.
 *
 * Library is parchment, Market is deep café, Food Chart is the clean atlas —
 * the same polarity the app uses, so the same three things feel like the same
 * three things in both places (brief §17).
 */
import { Link } from "wouter";
import { BookOpen, Leaf, Table2 } from "lucide-react";
import { StampHeading, StaggerChildren, StaggerItem } from "@/components/motion";
import { EditorialImage } from "./EditorialImage";
import { HEALTH_IMAGES } from "@/data/health-images";

const DESTINATIONS = [
  {
    href: "/resources#library",
    eyebrow: "Library",
    title: "Guides, ebooks and cited research",
    body: "Long-form writing on the things that actually move health, with the sources attached so you can check them.",
    icon: BookOpen,
    photo: HEALTH_IMAGES.library,
    tone: "parchment" as const,
    surface: "bg-sakred-parchment",
    text: "text-sakred-espresso",
    muted: "text-sakred-ink/65",
  },
  {
    href: "/resources#market",
    eyebrow: "Real Foods Market",
    title: "Foods, products and trusted resources",
    body: "What we'd actually buy, and why — ingredients, sourcing and the specific reason a thing made the list.",
    icon: Leaf,
    photo: HEALTH_IMAGES.market,
    tone: "cafe" as const,
    surface: "surface-cafe",
    text: "text-[#F5EFE3]",
    muted: "text-[#F5EFE3]/70",
  },
  {
    href: "/food-chart",
    eyebrow: "Food Chart",
    title: "197 everyday foods, rated",
    body: "A seven-point inflammation scale across fruit, grains, proteins, fats and seasonings. Awareness, not restriction.",
    icon: Table2,
    photo: HEALTH_IMAGES.foodChart,
    tone: "stone" as const,
    surface: "surface-atlas",
    text: "text-sakred-espresso",
    muted: "text-sakred-ink/65",
  },
];

export function ResourcesBand() {
  return (
    <section className="bg-sakred-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-sakred-gold-deep">
            Resources
          </p>
          <StampHeading
            as="h2"
            text="Know enough to ask"
            accent="better questions."
            className="font-display text-3xl leading-tight tracking-tight text-sakred-espresso sm:text-4xl"
          />
        </div>

        <StaggerChildren as="ul" className="mt-12 grid gap-5 lg:grid-cols-3">
          {DESTINATIONS.map((destination) => {
            const Icon = destination.icon;
            return (
              <StaggerItem as="li" key={destination.href}>
                <Link
                  href={destination.href}
                  className={`group flex h-full flex-col overflow-hidden rounded-3xl border border-sakred-stone/70 lift-card ${destination.surface}`}
                >
                  <EditorialImage
                    photo={destination.photo}
                    className="aspect-[16/10] w-full"
                    sizes="(max-width: 1024px) 100vw, 400px"
                    fallbackTone={destination.tone}
                    interactive
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <Icon
                        className={`h-4 w-4 ${
                          destination.tone === "cafe"
                            ? "text-sakred-gold"
                            : "text-sakred-gold-deep"
                        }`}
                        aria-hidden="true"
                      />
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
                          destination.tone === "cafe"
                            ? "text-sakred-gold"
                            : "text-sakred-gold-deep"
                        }`}
                      >
                        {destination.eyebrow}
                      </span>
                    </div>
                    <h3 className={`font-display text-xl leading-tight ${destination.text}`}>
                      {destination.title}
                    </h3>
                    <p className={`mt-2.5 flex-1 text-sm leading-relaxed ${destination.muted}`}>
                      {destination.body}
                    </p>
                    <span className={`mt-5 text-sm font-medium ${destination.text}`}>
                      Open{" "}
                      <span
                        aria-hidden="true"
                        className="inline-block text-sakred-gold transition-transform duration-micro group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
}
