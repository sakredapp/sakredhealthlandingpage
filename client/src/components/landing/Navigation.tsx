import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import sakredLogo from "@assets/full_png_image_sakred__1771270183106.png";
import { MapPin } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Home" },
    { href: "/app", label: "The App" },
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

            <div className="flex items-center gap-4 sm:gap-8">
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
                  className="hidden sm:flex rounded-full btn-gold-gradient shadow-lg shadow-[#C5A059]/20 hover:-translate-y-0.5 transition-transform"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Get Coverage
                </Button>
              </Link>
              <Link href="/get-coverage">
                <Button
                  size="sm"
                  className="sm:hidden rounded-full btn-gold-gradient shadow-lg shadow-[#C5A059]/20"
                >
                  Get Coverage
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
