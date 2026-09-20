/**
 * The /discover filter bar.
 *
 * Everything here is a *toggle over the current query*, and every change is
 * reflected in the URL by the page above — so a filtered view is a shareable
 * link, the back button undoes one filter rather than leaving the page, and a
 * support conversation can say "send me the URL you're looking at".
 */
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import {
  VERIFICATION_COPY,
  VERIFICATION_ORDER,
  type Modality,
  type VerificationState,
} from "@shared/health-network";

/**
 * Availability filters the network cannot answer yet.
 *
 * `accepts_walk_ins` and `same_day_available` are NULL on every published
 * record, so `p_walk_ins: true` and `p_same_day: true` both return zero rows —
 * for everyone, every time. A chip that always empties the map is worse than a
 * missing chip: it reads as "no practice near you takes walk-ins" when the truth
 * is "nobody has been asked yet".
 *
 * Hidden, not deleted. The state, the URL parameters and the RPC arguments all
 * still work; only the controls are withheld. When curation starts collecting
 * those facts, flip this to `true` and the filters come back.
 */
const AVAILABILITY_FILTERS_ENABLED = false;

export interface FilterState {
  modalities: string[];
  openNow: boolean;
  sameDay: boolean;
  walkIns: boolean;
  minVerification: VerificationState | null;
}

export const EMPTY_FILTERS: FilterState = {
  modalities: [],
  openNow: false,
  sameDay: false,
  walkIns: false,
  minVerification: null,
};

export function countActiveFilters(filters: FilterState): number {
  /* A hidden filter is not counted. Showing "1 filter" with no visible chip
     to switch off leaves someone staring at an empty map with nothing to
     click. */
  const availability = AVAILABILITY_FILTERS_ENABLED
    ? (filters.sameDay ? 1 : 0) + (filters.walkIns ? 1 : 0)
    : 0;

  return (
    filters.modalities.length +
    (filters.openNow ? 1 : 0) +
    availability +
    (filters.minVerification ? 1 : 0)
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-micro ${
        active
          ? "border-sakred-gold bg-sakred-gold/15 text-sakred-gold-deep"
          : "border-sakred-stone bg-sakred-surface text-sakred-ink/70 hover:border-sakred-gold/50 hover:text-sakred-espresso"
      }`}
    >
      {active && <Check className="h-3 w-3" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function DiscoverFilters({
  filters,
  onChange,
  modalities,
  resultCount,
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  modalities: Modality[];
  resultCount: number | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const active = countActiveFilters(filters);

  const toggleModality = (slug: string) =>
    onChange({
      ...filters,
      modalities: filters.modalities.includes(slug)
        ? filters.modalities.filter((s) => s !== slug)
        : [...filters.modalities, slug],
    });

  /**
   * Modality chips are capped until the panel is expanded. Twenty modalities
   * wrapping to four rows pushes the map and the results below the fold, which
   * is the opposite of what a filter bar is for.
   */
  const visible = expanded ? modalities : modalities.slice(0, 6);
  const hidden = modalities.length - visible.length;

  return (
    <div className="border-b border-sakred-stone bg-sakred-surface">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5">
        {visible.map((modality) => (
          <Chip
            key={modality.slug}
            active={filters.modalities.includes(modality.slug)}
            onClick={() => toggleModality(modality.slug)}
          >
            {modality.shortName || modality.name}
            {modality.locationCount != null && modality.locationCount > 0 && (
              <span className="text-sakred-ink/40">{modality.locationCount}</span>
            )}
          </Chip>
        ))}

        {hidden > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="shrink-0 text-xs font-medium text-sakred-gold-deep hover:text-sakred-espresso"
          >
            +{hidden} more
          </button>
        )}

        <span className="mx-1 hidden h-5 w-px bg-sakred-stone sm:block" aria-hidden="true" />

        <Chip active={filters.openNow} onClick={() => onChange({ ...filters, openNow: !filters.openNow })}>
          Open now
        </Chip>
        {AVAILABILITY_FILTERS_ENABLED && (
          <>
            <Chip active={filters.sameDay} onClick={() => onChange({ ...filters, sameDay: !filters.sameDay })}>
              Same day
            </Chip>
            <Chip active={filters.walkIns} onClick={() => onChange({ ...filters, walkIns: !filters.walkIns })}>
              Walk-ins
            </Chip>
          </>
        )}

        {/* Verification is a *minimum*, not a set — "at least Sakred Reviewed"
            is the question people are actually asking. */}
        <div className="relative shrink-0">
          <label className="sr-only" htmlFor="verification-filter">
            Minimum verification
          </label>
          <select
            id="verification-filter"
            value={filters.minVerification ?? ""}
            onChange={(event) =>
              onChange({
                ...filters,
                minVerification: (event.target.value || null) as VerificationState | null,
              })
            }
            className={`appearance-none rounded-full border py-1.5 pl-3 pr-7 text-xs font-medium outline-none transition-colors duration-micro ${
              filters.minVerification
                ? "border-sakred-gold bg-sakred-gold/15 text-sakred-gold-deep"
                : "border-sakred-stone bg-sakred-surface text-sakred-ink/70"
            }`}
          >
            <option value="">Any verification</option>
            {VERIFICATION_ORDER.map((state) => (
              <option key={state} value={state}>
                {VERIFICATION_COPY[state].label} or higher
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-sakred-ink/50"
            aria-hidden="true"
          />
        </div>

        {active > 0 && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="ml-auto inline-flex shrink-0 items-center gap-1 text-xs font-medium text-sakred-ink/55 hover:text-sakred-espresso"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Clear {active}
          </button>
        )}
      </div>

      {resultCount !== null && (
        <p className="flex items-center gap-2 border-t border-sakred-stone/60 px-4 py-2 text-xs text-sakred-ink/55 sm:px-5">
          <SlidersHorizontal className="h-3 w-3" aria-hidden="true" />
          <span aria-live="polite">
            {resultCount} {resultCount === 1 ? "practice" : "practices"} in this view
          </span>
        </p>
      )}
    </div>
  );
}
