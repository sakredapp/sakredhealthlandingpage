/**
 * The modality vocabulary the site can talk about before the network is live.
 *
 * These are *filter suggestions and editorial context*, not directory data. A
 * chip that says "Acupuncture" makes no claim that Sakred has an acupuncturist
 * near you — it's a query you can run, and running it tells you the truth.
 *
 * Once `health_modalities` is publishing, `useModalities()` returns the real
 * vocabulary with live counts and these become the fallback only. The two are
 * matched by slug, so a modality defined in both places keeps one URL.
 *
 * The editorial descriptions stay here regardless: they're written copy, and
 * copy belongs in the repo where it can be reviewed, not in a database column
 * someone edits at 11pm.
 */
export interface SeedModality {
  slug: string;
  name: string;
  shortName?: string;
  /** Shown on `/discover/<slug>` above the results. */
  description: string;
}

export const SEED_MODALITIES: SeedModality[] = [
  {
    slug: "acupuncture",
    name: "Acupuncture",
    description:
      "Fine needles placed at specific points to influence pain, tension and nervous-system state. Most commonly sought for musculoskeletal pain, recovery and sleep. Practitioners are typically licensed acupuncturists (L.Ac.), and licensure requirements differ by state.",
  },
  {
    slug: "traditional-chinese-medicine",
    name: "Traditional Chinese Medicine",
    shortName: "TCM",
    description:
      "A complete traditional system that includes acupuncture alongside herbal prescribing, dietary guidance, cupping and gua sha. Practitioners work from a diagnostic framework of their own rather than a Western one, which is worth understanding before a first visit.",
  },
  {
    slug: "functional-medicine",
    name: "Functional Medicine",
    shortName: "Functional",
    description:
      "A model that treats symptoms as downstream of systems — digestion, metabolism, hormones, sleep — and leans heavily on testing and history-taking. Practitioners range from MDs and DOs to nutritionists, so credentials vary widely and are worth checking.",
  },
  {
    slug: "chiropractic",
    name: "Chiropractic",
    description:
      "Manual adjustment of the spine and joints, usually for back, neck and movement complaints. Doctors of Chiropractic (D.C.) are licensed in all fifty states. Technique varies more than most people expect, from forceful adjusting to very light work.",
  },
  {
    slug: "ayurveda",
    name: "Ayurveda",
    description:
      "The traditional medicine of the Indian subcontinent, organised around constitution, digestion and daily rhythm. Practice usually combines dietary and routine guidance with herbal preparations and bodywork such as abhyanga.",
  },
  {
    slug: "bodywork",
    name: "Bodywork",
    description:
      "Hands-on soft-tissue work — massage, myofascial release, lymphatic drainage, structural integration. The umbrella is wide, so the useful question is which tradition a practitioner trained in and what they treat most.",
  },
  {
    slug: "naturopathic-medicine",
    name: "Naturopathic Medicine",
    shortName: "Naturopathic",
    description:
      "Primary-care-style practice emphasising nutrition, botanical medicine and lifestyle alongside conventional diagnostics. Licensure exists in some states and not others, which materially changes scope of practice.",
  },
  {
    slug: "biological-dentistry",
    name: "Biological Dentistry",
    description:
      "Dentistry practised with particular attention to materials, extraction technique and the mouth's relationship to the rest of the body. Practitioners hold standard dental licences and have additional training on top.",
  },
];

export const SEED_MODALITY_SLUGS = SEED_MODALITIES.map((m) => m.slug);

export function getSeedModality(slug: string): SeedModality | undefined {
  return SEED_MODALITIES.find((m) => m.slug === slug);
}

/** The chips on the homepage hero — the shortest useful path into the map. */
export const QUICK_FILTERS: { label: string; param: string; value: string }[] = [
  { label: "Acupuncture", param: "modality", value: "acupuncture" },
  { label: "Traditional Chinese Medicine", param: "modality", value: "traditional-chinese-medicine" },
  { label: "Functional", param: "modality", value: "functional-medicine" },
  { label: "Chiropractic", param: "modality", value: "chiropractic" },
  { label: "Ayurveda", param: "modality", value: "ayurveda" },
  { label: "Bodywork", param: "modality", value: "bodywork" },
  { label: "Open Now", param: "openNow", value: "true" },
];
