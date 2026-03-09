import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import sakredLogo from "@assets/full_png_image_sakred__1771270183106.png";
import { useDownloadDialog } from "./DownloadDialog";

export function Navigation() {
  const [location] = useLocation();
  const { openDialog, DialogComponent } = useDownloadDialog();

  const links = [
    { href: "/", label: "Home" },
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
                  data-testid={`link-nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              ))}
              <Button
                onClick={openDialog}
                className="hidden sm:flex rounded-full btn-gold-gradient shadow-lg shadow-[#C5A059]/20 hover:-translate-y-0.5 transition-transform"
                data-testid="button-get-started-nav"
              >
                Download
              </Button>
              <Button
                onClick={openDialog}
                size="sm"
                className="sm:hidden rounded-full btn-gold-gradient shadow-lg shadow-[#C5A059]/20"
                data-testid="button-get-started-mobile"
              >
                Download
              </Button>
            </div>
          </div>
        </div>
        {DialogComponent}
      </nav>
      <div className="fixed top-[64px] left-0 right-0 z-50 bg-amber-50 border-b border-amber-200" data-testid="banner-maintenance">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2 text-sm text-amber-900">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0 text-amber-600">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <span><strong>Maintenance Notice:</strong> We're undergoing a major platform overhaul. Some features may be unavailable for 1-2 weeks. Thank you for your patience.</span>
        </div>
      </div>
    </>
  );
}
