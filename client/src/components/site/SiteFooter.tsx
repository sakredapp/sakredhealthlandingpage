/**
 * The site footer.
 *
 * Five columns, ordered the way the site is: discovery, the company, what you
 * can learn, what you can be covered for, and the legal floor. Coverage keeps
 * a full column of its own — an agency that quietly moved its products into a
 * "more" link would read as an agency winding down.
 */
import { Link } from "wouter";
import { FOOTER_COLUMNS } from "./nav-data";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-sakred-stone bg-sakred-surface-alt">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(5,minmax(0,1fr))]">
          <div className="lg:pr-8">
            <Link href="/" className="mb-4 flex items-center gap-1">
              <span className="font-display text-xl tracking-tight text-sakred-espresso">
                Sakred
              </span>
              <span className="bg-gradient-to-r from-sakred-gold to-sakred-gold-light bg-clip-text font-display text-xl tracking-tight text-transparent">
                Health
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-sakred-ink/60">
              A trusted navigation layer for real-world health — find practitioners and
              practices near you, follow care protocols between visits, and protect your
              household with licensed insurance guidance.
            </p>
            <Link
              href="/recommend"
              className="mt-5 inline-block text-sm font-medium text-sakred-gold-deep transition-colors duration-micro hover:text-sakred-espresso"
            >
              Recommend a practitioner →
            </Link>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-sakred-gold-deep">
                {column.title}
              </h2>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-sakred-ink/65 transition-colors duration-micro hover:text-sakred-espresso"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-sakred-stone/70 pt-7">
          <p className="text-xs leading-relaxed text-sakred-ink/45">
            © {year} Sakred Health. All rights reserved. Insurance products are offered
            through licensed agents; availability and terms vary by state. Practitioner
            listings are directory information — Sakred Health does not provide medical
            advice, diagnosis, or treatment, and inclusion in the network is not a
            clinical endorsement.
          </p>
        </div>
      </div>
    </footer>
  );
}
