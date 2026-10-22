/**
 * The homepage.
 *
 * The order is the story (brief §35), and it is the pivot made structural:
 *
 *   1. FIND CARE                   NetworkHero      the map owns the fold
 *   2. KNOW WHO YOU'RE CHOOSING    TrustLadder      what verification means
 *   3. HOW IT WORKS                HowSakredWorks   discover → choose → continue
 *   4. CONTINUE YOUR CARE          ProtocolsBand    present, not dominant
 *   5. LEARN FROM THE COMMUNITY    CommunityBand
 *   6. RESOURCES                   ResourcesBand
 *   7. PROTECT YOUR HOUSEHOLD      CoverageBand     the insurance pillar
 *   8. TAKE IT WITH YOU            DownloadBand
 *
 * Coverage sits seventh and is unmissable when it arrives, because it changes
 * material rather than shouting. An insurance visitor also gets a direct line
 * out of the hero in the first screenful — see the "Looking for insurance
 * coverage?" link in NetworkHero.
 */
import { SiteLayout } from "@/components/site/SiteLayout";
import { lazy, Suspense, useEffect, useState } from "react";
import { NetworkHero } from "@/components/health/NetworkHero";
import { useSeo, SITE_URL } from "@/lib/seo";
import { whenPageSettles } from "@/lib/when-page-settles";

/**
 * Sections 2-8 live in their own chunk and mount on the visitor's first
 * interaction (scroll, touch, pointer, key), when the URL points at one of
 * them (/#how-it-works), or a few seconds after load. The first screen then
 * renders only the hero, which is what makes the page paint fast on a phone.
 * The chunk is fetched as soon as the page has loaded, so it is ready by the
 * time anyone scrolls.
 */
const loadBelowFold = () => import("@/components/health/LandingBelowFold");
const LandingBelowFold = lazy(loadBelowFold);

/** Holds the space the sections will fill so the footer starts off-screen. */
function BelowFoldPlaceholder() {
  return <div className="min-h-screen" aria-hidden="true" />;
}

function useShowBelowFold(): boolean {
  // Starts false even for /#how-it-works so the first render matches the
  // prerendered homepage shell; the effect below opens it straight away.
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return;
    if (window.location.hash.length > 1) {
      setShow(true);
      return;
    }
    const gate = whenPageSettles(10000);
    gate.promise.then(() => setShow(true));
    const onHash = () => setShow(true);
    window.addEventListener("hashchange", onHash);
    const prefetch = () => void loadBelowFold();
    if (document.readyState === "complete") prefetch();
    else window.addEventListener("load", prefetch, { once: true });
    return () => {
      gate.cancel();
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("load", prefetch);
    };
  }, [show]);

  return show;
}

/** Once the sections exist, honour a #section in the URL. */
function ScrollToHash() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    document.getElementById(id)?.scrollIntoView();
  }, []);
  return null;
}

export default function Landing() {
  const showBelowFold = useShowBelowFold();

  useSeo({
    title: "Sakred Health — Find Trusted Practitioners & Care Near You",
    description:
      "Discover trusted practitioners, practices and health resources near you on the Sakred Health Network — plus care protocols and research.",
    canonical: "/",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Sakred Health",
        url: SITE_URL,
        description:
          "A trusted navigation layer for real-world health: find practitioners and practices near you, and follow care protocols.",
        areaServed: { "@type": "Country", name: "United States" },
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Sakred Health",
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/discover?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  });

  return (
    <SiteLayout>
      <NetworkHero />
      {showBelowFold ? (
        <Suspense fallback={<BelowFoldPlaceholder />}>
          <LandingBelowFold />
          <ScrollToHash />
        </Suspense>
      ) : (
        <BelowFoldPlaceholder />
      )}
    </SiteLayout>
  );
}
