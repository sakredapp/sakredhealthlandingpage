/**
 * Homepage sections 2-8 (everything under the hero), in story order.
 *
 * Split into its own chunk so the first screen ships and renders only the
 * hero. Landing.tsx mounts this on the visitor's first interaction, when the
 * URL targets one of these sections (/#how-it-works), or shortly after load.
 */
import { TrustLadder } from "./TrustLadder";
import { HowSakredWorks } from "./HowSakredWorks";
import { ProtocolsBand } from "./ProtocolsBand";
import { CommunityBand } from "./CommunityBand";
import { ResourcesBand } from "./ResourcesBand";
import { CoverageBand } from "./CoverageBand";
import { DownloadBand } from "./DownloadBand";

export default function LandingBelowFold() {
  return (
    <>
      <TrustLadder />
      <HowSakredWorks />
      <ProtocolsBand />
      <CommunityBand />
      <ResourcesBand />
      <CoverageBand />
      <DownloadBand />
    </>
  );
}
