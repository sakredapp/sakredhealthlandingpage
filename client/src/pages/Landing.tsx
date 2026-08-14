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
import { NetworkHero } from "@/components/health/NetworkHero";
import { TrustLadder } from "@/components/health/TrustLadder";
import { HowSakredWorks } from "@/components/health/HowSakredWorks";
import { ProtocolsBand } from "@/components/health/ProtocolsBand";
import { CommunityBand } from "@/components/health/CommunityBand";
import { ResourcesBand } from "@/components/health/ResourcesBand";
import { CoverageBand } from "@/components/health/CoverageBand";
import { DownloadBand } from "@/components/health/DownloadBand";
import { useSeo, SITE_URL } from "@/lib/seo";

export default function Landing() {
  useSeo({
    title: "Sakred Health — Find Trusted Practitioners & Care Near You",
    description:
      "Discover trusted practitioners, practices and health resources near you on the Sakred Health Network — plus care protocols, research, and licensed insurance guidance for your household.",
    canonical: "/",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Sakred Health",
        url: SITE_URL,
        description:
          "A trusted navigation layer for real-world health: find practitioners and practices near you, follow care protocols, and access licensed insurance guidance.",
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
      <TrustLadder />
      <HowSakredWorks />
      <ProtocolsBand />
      <CommunityBand />
      <ResourcesBand />
      <CoverageBand />
      <DownloadBand />
    </SiteLayout>
  );
}
