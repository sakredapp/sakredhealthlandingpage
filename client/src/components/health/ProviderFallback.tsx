/**
 * The designed stand-in for a provider with no photograph.
 *
 * Every one of the 14 live practices currently ships without an image, so this
 * is not an edge case — it is what the directory looks like today. One
 * identical panel repeated fourteen times made a curated network read like a
 * placeholder grid, which undersells the thing the network is.
 *
 * ── What this is not ─────────────────────────────────────────────────
 *
 * It is not a photograph, and it must never be mistaken for one. No stock
 * clinic, no stock practitioner, nothing that implies "this is their space" or
 * "this is them". These are flat material planes with Sakred's own atlas
 * linework — obviously drawn, obviously ours.
 *
 * The moment a provider has real approved media, `NetworkImage` renders that
 * instead and none of this is reached.
 *
 * ── Deterministic, not random ────────────────────────────────────────
 *
 * The family is chosen from the provider's canonical modality
 * `category_group`, falling back to a hash of the record id. The same practice
 * therefore gets the same panel on every render, on every device, in the
 * prerendered HTML and after hydration. A directory whose tiles reshuffle on
 * refresh looks broken, and "never random-image roulette on every render" was a
 * rule from the original brief.
 *
 * ── The families ─────────────────────────────────────────────────────
 *
 * Keyed on the real `category_group` values in `health_modalities`:
 *
 *   eastern     tcm, acupuncture, chinese-herbal, ayurveda, herbalism
 *   clinical    functional-medicine, integrative-medicine, naturopathic,
 *               regenerative-medicine, midwifery
 *   manual      chiropractic, osteopathy, massage, bodywork, myofascial,
 *               physical-therapy
 *   recovery    sauna-recovery
 *   diagnostic  laboratory
 *   provisions  clean-grocery, regenerative-farm
 *   dental      holistic-dentistry, biological-dentistry
 */
import type { Modality } from "@shared/health-network";

type Family =
  | "eastern"
  | "clinical"
  | "manual"
  | "recovery"
  | "diagnostic"
  | "provisions"
  | "dental";

interface FamilySpec {
  /** Tailwind gradient stops — the material plane. */
  plane: string;
  /** Linework colour. */
  ink: string;
  /** The motif itself, drawn in a 400×300 viewBox. */
  motif: (ink: string) => JSX.Element;
}

/* ------------------------------------------------------------------ *
 * Motifs
 *
 * All abstract, all in the same hand as the map's contour language.
 * Nothing figurative, nothing that reads as a place or a person.
 * ------------------------------------------------------------------ */

const meridian = (ink: string) => (
  <g fill="none" stroke={ink} strokeOpacity="0.32" strokeWidth="1">
    {/* Meridian lines: long, calm, converging — the eastern family. */}
    <path d="M40 300C40 210 96 168 128 120s28-96 12-132" />
    <path d="M104 300c0-96 58-140 92-190s34-78 20-118" />
    <path d="M168 300c4-100 62-146 96-196s30-74 16-112" />
    <path d="M232 300c8-104 66-152 100-202s26-70 12-108" />
    <circle cx="128" cy="120" r="4" fill={ink} fillOpacity="0.4" stroke="none" />
    <circle cx="196" cy="110" r="4" fill={ink} fillOpacity="0.4" stroke="none" />
    <circle cx="264" cy="98" r="4" fill={ink} fillOpacity="0.4" stroke="none" />
    <circle cx="332" cy="86" r="4" fill={ink} fillOpacity="0.4" stroke="none" />
  </g>
);

const orbit = (ink: string) => (
  <g fill="none" stroke={ink} strokeOpacity="0.3" strokeWidth="1">
    {/* Systems-orbit: interlocking rings — the clinical family. */}
    <ellipse cx="200" cy="150" rx="130" ry="52" />
    <ellipse cx="200" cy="150" rx="130" ry="52" transform="rotate(58 200 150)" />
    <ellipse cx="200" cy="150" rx="130" ry="52" transform="rotate(-58 200 150)" />
    <circle cx="200" cy="150" r="21" strokeOpacity="0.45" />
    <circle cx="200" cy="150" r="3.5" fill={ink} fillOpacity="0.5" stroke="none" />
  </g>
);

const structure = (ink: string) => (
  <g fill="none" stroke={ink} strokeOpacity="0.3" strokeWidth="1">
    {/* Structural column: stacked segments on an axis — the manual family. */}
    <path d="M200 18v264" strokeOpacity="0.22" />
    {[46, 82, 118, 154, 190, 226, 262].map((y, i) => (
      <g key={y}>
        <path d={`M${200 - (46 - i * 3)} ${y}h${(46 - i * 3) * 2}`} />
        <circle cx="200" cy={y} r="5" />
      </g>
    ))}
  </g>
);

const wave = (ink: string) => (
  <g fill="none" stroke={ink} strokeOpacity="0.3" strokeWidth="1">
    {/* Recovery: damping oscillation settling to a line. */}
    <path d="M-10 150c40-92 80 92 120 0s80 60 120 0 80 24 180 0" />
    <path d="M-10 178c40-64 80 64 120 0s80 42 120 0 80 17 180 0" strokeOpacity="0.22" />
    <path d="M-10 122c40-64 80 64 120 0s80 42 120 0 80 17 180 0" strokeOpacity="0.22" />
    <path d="M-10 150h420" strokeOpacity="0.14" strokeDasharray="3 5" />
  </g>
);

const grid = (ink: string) => (
  <g fill="none" stroke={ink} strokeOpacity="0.24" strokeWidth="1">
    {/* Diagnostic: a measured technical field. */}
    {[60, 110, 160, 210, 260].map((y) => (
      <path key={y} d={`M-10 ${y}h420`} />
    ))}
    {[40, 110, 180, 250, 320, 390].map((x) => (
      <path key={x} d={`M${x} -10v320`} strokeOpacity="0.16" />
    ))}
    <circle cx="250" cy="110" r="30" strokeOpacity="0.4" />
    <path d="M250 80v60M220 110h60" strokeOpacity="0.4" />
  </g>
);

const botanical = (ink: string) => (
  <g fill="none" stroke={ink} strokeOpacity="0.3" strokeWidth="1">
    {/* Provisions: a growing stem, abstracted. */}
    <path d="M200 300V96" />
    {[
      [200, 132, 84],
      [200, 176, -84],
      [200, 220, 84],
    ].map(([x, y, dx], i) => (
      <path key={i} d={`M${x} ${y}c${dx / 2} -8 ${dx} -20 ${dx} -44`} />
    ))}
    <circle cx="200" cy="88" r="15" strokeOpacity="0.42" />
  </g>
);

const arc = (ink: string) => (
  <g fill="none" stroke={ink} strokeOpacity="0.3" strokeWidth="1">
    {/* Dental: a calm repeating arc set. */}
    {[0, 26, 52, 78].map((o) => (
      <path key={o} d={`M50 ${250 - o}c40-${70 + o} 260-${70 + o} 300 0`} />
    ))}
  </g>
);

const FAMILIES: Record<Family, FamilySpec> = {
  eastern: {
    plane: "from-sakred-parchment via-[#EFE4CE] to-sakred-stone",
    ink: "#8A6B24",
    motif: meridian,
  },
  clinical: {
    plane: "from-sakred-limestone via-sakred-surface-alt to-sakred-stone",
    ink: "#7C6A52",
    motif: orbit,
  },
  manual: {
    plane: "from-[#EDE3D2] via-sakred-latte to-sakred-stone",
    ink: "#8A6B24",
    motif: structure,
  },
  recovery: {
    plane: "from-sakred-surface-alt via-sakred-limestone to-sakred-latte",
    ink: "#6F7A76",
    motif: wave,
  },
  diagnostic: {
    plane: "from-sakred-surface via-sakred-limestone to-sakred-stone",
    ink: "#77726A",
    motif: grid,
  },
  provisions: {
    plane: "from-[#E8E7D6] via-sakred-parchment to-sakred-stone",
    ink: "#6E7A44",
    motif: botanical,
  },
  dental: {
    plane: "from-sakred-surface via-sakred-surface-alt to-sakred-limestone",
    ink: "#7C6A52",
    motif: arc,
  },
};

const ORDER: Family[] = [
  "eastern",
  "clinical",
  "manual",
  "recovery",
  "diagnostic",
  "provisions",
  "dental",
];

/** Stable small hash — same id, same panel, forever. */
function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Picks the family from the provider's canonical modalities.
 *
 * The first modality carrying a recognised `category_group` wins, so a practice
 * listing Acupuncture and Massage gets the eastern panel rather than an average
 * of the two. With no usable category — a practitioner whose modalities haven't
 * been linked yet — it falls back to a hash of the id, which is arbitrary but
 * stable, and never leaves a provider with no panel at all.
 */
export function providerFamily(
  id: string,
  modalities: Pick<Modality, "slug" | "category">[] | undefined
): Family {
  for (const modality of modalities ?? []) {
    const group = modality.category?.toLowerCase();
    if (group && group in FAMILIES) return group as Family;
  }
  return ORDER[hash(id) % ORDER.length];
}

/**
 * The panel itself.
 *
 * `aria-hidden` throughout: it carries no information a screen reader needs,
 * and the surrounding card already names the practice. Announcing "decorative
 * meridian pattern" to someone looking for an acupuncturist would be noise.
 */
export function ProviderFallback({
  id,
  modalities,
  className = "",
}: {
  id: string;
  modalities?: Pick<Modality, "slug" | "category">[];
  className?: string;
}) {
  const family = providerFamily(id, modalities);
  const spec = FAMILIES[family];

  return (
    <div
      className={`absolute inset-0 bg-gradient-to-br ${spec.plane} ${className}`}
      aria-hidden="true"
      data-provider-family={family}
    >
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        role="presentation"
      >
        {spec.motif(spec.ink)}
      </svg>
    </div>
  );
}
