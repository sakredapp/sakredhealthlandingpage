import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    product: [
      { label: "Home", href: "/" },
      { label: "The App", href: "/app" },
      { label: "Get Coverage", href: "/get-coverage" },
      { label: "Blog", href: "/blog" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "SMS Opt-In Policy", href: "/opt-in" },
      { label: "AI & Privacy", href: "/ai-privacy" },
    ],
  };

  return (
    <footer className="bg-[#F0ECE3] border-t border-[#D6D0C4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-1 mb-4">
              <span className="text-xl font-display font-normal tracking-tight text-[#2C2C2C]">Sakred</span>
              <span className="text-xl font-display font-normal tracking-tight bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">Health</span>
            </Link>
            <p className="text-[#2C2C2C]/60 text-sm leading-relaxed max-w-sm">
              Private health insurance for individuals, families, and small businesses. A dedicated agent, 15+ carriers, and a client portal to manage it all.
            </p>
          </div>

          <div>
            <h3 className="text-[#2C2C2C] font-normal mb-4">Product</h3>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#2C2C2C]/60 text-sm hover:text-[#C5A059] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[#2C2C2C] font-normal mb-4">Legal</h3>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#2C2C2C]/60 text-sm hover:text-[#C5A059] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#D6D0C4]">
          <p className="text-[#2C2C2C]/40 text-sm text-center">
            &copy; {currentYear} Sakred Health. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
