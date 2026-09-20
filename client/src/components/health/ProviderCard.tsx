/**
 * A practice, as a card.
 *
 * The same component in three places — the hero's selected preview, the
 * /discover result list, and the "nearby" rails on a location page — because a
 * visitor should recognise the object they clicked on the map when it appears
 * in a list.
 *
 * The photo carries most of the visual life (brief §6). What it deliberately
 * does *not* carry is a big star rating: the trust device on this site is the
 * verification state, and putting a five-star row next to it would train
 * people to read the stars and ignore the thing that was actually checked.
 */
import { Link } from "wouter";
import { ArrowUpRight, MapPin } from "lucide-react";
import {
  formatDistance,
  locationPath,
  modalitySummary,
  resolveOpenState,
  type LocationSummary,
} from "@shared/health-network";
import { NetworkImage } from "./EditorialImage";
import { VerificationBadge } from "./VerificationBadge";

interface ProviderCardProps {
  location: LocationSummary;
  /** Compact row for the results list; full for rails and the hero preview. */
  variant?: "row" | "tile";
  /** Highlighted because its pin is selected on the map. */
  selected?: boolean;
  /** When given, the card is a button (map selection) instead of a link. */
  onSelect?: (id: string) => void;
  className?: string;
}

function Meta({ location }: { location: LocationSummary }) {
  const open = resolveOpenState(location.hours, location.timezone);
  const distance = formatDistance(location.distanceMeters);
  const modalities = modalitySummary(location.modalities);

  return (
    <>
      {modalities && (
        /* `truncate` stays as a last-resort safety net, but the summary above
           is what keeps it from firing: two names plus a count instead of a
           long string cut mid-word. */
        <p className="truncate text-xs text-sakred-ink/60">{modalities}</p>
      )}
      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-sakred-ink/55">
        {distance && <span>{distance}</span>}
        {distance && <span aria-hidden="true">·</span>}
        <span>
          {location.city}
          {location.region ? `, ${location.region}` : ""}
        </span>
        {/* An absent hours record renders nothing at all — see
            resolveOpenState: no published hours is not "closed". */}
        {open.label && (
          <>
            <span aria-hidden="true">·</span>
            <span className={open.open ? "text-sakred-gold-deep" : "text-sakred-ink/45"}>
              {open.label}
            </span>
          </>
        )}
      </p>
    </>
  );
}

export function ProviderCard({
  location,
  variant = "tile",
  selected = false,
  onSelect,
  className,
}: ProviderCardProps) {
  const inner =
    variant === "row" ? (
      <div className="flex gap-3.5 p-3">
        <NetworkImage
          photo={location.photo}
          subject={location.name}
          id={location.id}
          modalities={location.modalities}
          className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-xl"
          sizes="72px"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            {/* Wraps to two lines rather than truncating. Real network names
                run long — "Acupuncture & Natural Health Solutions", "Miami
                Beach Comprehensive Wellness Center" — and a practice's name is
                its identity, not metadata. Cutting it to "Acupuncture &
                Natural Health Solu…" in the one place someone scans for it is
                worse than giving the card another line. The modality line below
                still truncates; that one is secondary. */}
            <h3 className="line-clamp-2 font-display text-[15px] leading-snug text-sakred-espresso">
              {location.name}
            </h3>
            <VerificationBadge state={location.verification} />
          </div>
          <div className="mt-1">
            <Meta location={location} />
          </div>
        </div>
      </div>
    ) : (
      <>
        <NetworkImage
          photo={location.photo}
          subject={location.name}
          id={location.id}
          modalities={location.modalities}
          className="aspect-[4/3] w-full"
          sizes="(max-width: 768px) 100vw, 380px"
          interactive
        />
        <div className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="font-display text-lg leading-tight text-sakred-espresso">
              {location.name}
            </h3>
            <ArrowUpRight
              className="mt-0.5 h-4 w-4 shrink-0 text-sakred-gold"
              aria-hidden="true"
            />
          </div>
          <VerificationBadge state={location.verification} className="mb-2.5" />
          <Meta location={location} />
        </div>
      </>
    );

  /**
   * `min-w-0` is load-bearing, not tidiness.
   *
   * The meta line uses `truncate`, which sets `white-space: nowrap`, so its
   * min-content width is the ENTIRE unwrapped string — "Acupuncture ·
   * Traditional Chinese Medicine · Chinese Herbal Medicine" is about 400px. A
   * grid or flex item defaults to `min-width: auto` and refuses to shrink below
   * that, so on a 390px phone the card pushed its track to 423px and the whole
   * page scrolled sideways. Found with real network data; the placeholder copy
   * this was built against was short enough to hide it.
   */
  const shell = `block min-w-0 overflow-hidden rounded-2xl border bg-sakred-surface text-left lift-card ${
    selected
      ? "border-sakred-gold shadow-[0_18px_38px_-24px_rgba(28,26,23,0.4)]"
      : "border-sakred-stone/80"
  } ${className ?? ""}`;

  /**
   * On /discover the card selects a pin rather than navigating — clicking a
   * result should move the map, not leave the page. The card still carries a
   * real link to the profile inside it, so the URL is reachable by keyboard,
   * by middle-click, and by a crawler.
   */
  if (onSelect) {
    return (
      <div className={shell} aria-current={selected ? "true" : undefined}>
        <button
          type="button"
          onClick={() => onSelect(location.id)}
          className="w-full text-left"
        >
          {inner}
        </button>
        <Link
          href={locationPath(location.slug)}
          className="flex items-center gap-1 border-t border-sakred-stone/60 px-4 py-2 text-xs font-medium text-sakred-gold-deep transition-colors duration-micro hover:bg-sakred-surface-alt"
        >
          <MapPin className="h-3 w-3" aria-hidden="true" />
          View profile
        </Link>
      </div>
    );
  }

  return (
    <Link href={locationPath(location.slug)} className={shell}>
      {inner}
    </Link>
  );
}
