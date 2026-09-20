/**
 * 404.
 *
 * Also the page a `/locations/:slug` or `/practitioners/:slug` renders when the
 * record isn't published — so the onward links point at the network rather than
 * only at the homepage. Someone who followed a dead practice link is still
 * looking for a practice.
 */
import { Link } from "wouter";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSeo } from "@/lib/seo";

const ELSEWHERE = [
  { href: "/discover", label: "Find trusted care" },
  { href: "/resources", label: "Resources" },
  { href: "/products", label: "Coverage" },
  { href: "/blog", label: "Research" },
];

export default function NotFound() {
  useSeo({
    title: "Page not found | Sakred Health",
    description: "That page doesn't exist or has moved.",
    noindex: true,
  });

  return (
    <SiteLayout solidHeader>
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md text-center"
        >
          <span className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-sakred-gold/35 bg-sakred-gold/10">
            <span className="font-display text-3xl text-sakred-gold-deep">404</span>
          </span>

          <h1 className="font-display text-3xl leading-tight text-sakred-espresso sm:text-4xl">
            We can&rsquo;t find that page
          </h1>
          <p className="mt-4 leading-relaxed text-sakred-ink/65">
            It doesn&rsquo;t exist, or it moved. Here&rsquo;s where most people are
            heading.
          </p>

          <ul className="mt-8 flex flex-wrap justify-center gap-2.5">
            {ELSEWHERE.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-block rounded-full border border-sakred-stone bg-sakred-surface px-4 py-2 text-sm font-medium text-sakred-espresso lift-card"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/"
            className="mt-6 inline-block text-sm font-medium text-sakred-gold-deep hover:text-sakred-espresso"
          >
            ← Back to the homepage
          </Link>
        </motion.div>
      </div>
    </SiteLayout>
  );
}
