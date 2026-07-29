import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import sakredLogo from "@assets/full_png_image_sakred__1771270183106.png";
import { MapPin, Menu, X } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const links = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/app", label: "The App" },
    { href: "/food-chart", label: "Food Chart" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[60] bg-[#F9F9F7]/90 backdrop-blur-md border-b border-[#C5A059]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center" data-testid="link-logo">
              <img 
                src={sakredLogo} 
                alt="Sakred Health" 
                className="h-10 w-auto"
              />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    location === link.href
                      ? "text-[#C5A059]"
                      : "text-[#0F172A]/80 hover:text-[#C5A059]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/get-coverage">
                <Button
                  className="rounded-full btn-gold-gradient shadow-lg shadow-[#C5A059]/20 hover:-translate-y-0.5 transition-transform"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Get Coverage
                </Button>
              </Link>
            </div>

            {/* Mobile: Get Coverage + Hamburger */}
            <div className="flex md:hidden items-center gap-3">
              <Link href="/get-coverage">
                <Button
                  size="sm"
                  className="rounded-full btn-gold-gradient shadow-lg shadow-[#C5A059]/20"
                >
                  Get Coverage
                </Button>
              </Link>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-[#0F172A]/80 hover:text-[#C5A059] transition-colors"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div className="fixed inset-0 top-16 z-[55] bg-[#F9F9F7] md:hidden">
          <div className="flex flex-col px-6 py-8 gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-lg font-medium py-3 border-b border-[#C5A059]/10 transition-colors ${
                  location === link.href
                    ? "text-[#C5A059]"
                    : "text-[#0F172A]/80 hover:text-[#C5A059]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/get-coverage" className="mt-4">
              <Button
                className="w-full rounded-full btn-gold-gradient shadow-lg shadow-[#C5A059]/20 text-base py-6"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Get Coverage
              </Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
