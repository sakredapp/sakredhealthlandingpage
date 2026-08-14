/**
 * THE INGESTION CONTRACT — everything the website can put into the Health
 * Network queue.
 *
 *   website /for-practitioners ──┐
 *   website /recommend ──────────┤
 *   app practitioner intake ─────┼──► health_network_submissions
 *   app member recommendation ───┤            ↓
 *   Sakred research / import ────┘    Health Network Queue
 *                                              ↓
 *                                     canonical network
 *                                              ↓
 *                                        verification
 *                                              ↓
 *                                        publication
 *
 * There is exactly one queue and the website does not own a second one. No
 * `provider_applications`, no `website_practitioners`, no `leads_practitioner`.
 * A submission made on the website and a submission made in the app are the
 * same kind of object and land in the same admin screen.
 *
 * ── What a submission is not ─────────────────────────────────────────
 *
 * A submission is a *request to be researched*. It is never a listing, never a
 * verification state, and never an endorsement. Nothing in this file may set
 * `published`, `verification`, or write to a canonical provider table — see
 * `api/_lib/network-intake.ts`, which forces provenance and status server-side
 * and drops every other field a client might try to send.
 *
 * ── Names in this file are DTO names, not column names ───────────────
 *
 * Everything here is camelCase website-side vocabulary. The mapping to the
 * app's actual columns happens once, in `api/_lib/network-intake.ts`, and the
 * column names live in `SUBMISSION_COLUMNS` there. If the app renames a column,
 * that map is the only thing that changes.
 */

/* ==================================================================== *
 * Provenance
 * ==================================================================== */

/**
 * Where a submission came from — the app's `health_submission_source` enum.
 *
 * These are the app's values, not the website's invention. The website must
 * never send a value that is not in the enum: Postgres rejects the insert and a
 * real practitioner's application is lost at the last step.
 *
 *   member       an authenticated Sakred member recommended someone (app)
 *   public       an anonymous website visitor recommended someone  ← ADDITIVE
 *   practitioner a practice or practitioner putting themselves forward
 *   admin        created by hand inside the admin queue
 *   research     Sakred's own research pipeline
 *   bulk_import  a batch load
 *
 * `public` is an ADDITIVE migration the app team must apply before the website
 * recommendation endpoint can write — see docs/health-network-app-contract.md.
 * It exists because calling an anonymous website visitor a `member` would be a
 * lie told to the one person whose job is to judge how much the tip is worth.
 * The intake module detects the missing enum value and fails loudly rather than
 * silently mislabelling the row.
 */
export type SubmissionSource =
  | "member"
  | "public"
  | "practitioner"
  | "admin"
  | "research"
  | "bulk_import";

/** Admin queue badges. Kept here so both surfaces can render one vocabulary. */
export const SUBMISSION_SOURCE_LABELS: Record<SubmissionSource, string> = {
  member: "Member recommended",
  public: "Web recommended",
  practitioner: "Practitioner submitted",
  admin: "Admin created",
  research: "Sakred research",
  bulk_import: "Bulk import",
};

/**
 * The only two sources the website is allowed to produce.
 *
 * Anything else arriving from this repo is a bug — see the assertion in
 * `api/_lib/network-intake.ts`.
 */
export const WEBSITE_SOURCES = ["practitioner", "public"] as const;
export type WebsiteSource = (typeof WEBSITE_SOURCES)[number];

/** The only status the website is ever allowed to create. */
export const INITIAL_STATUS = "new" as const;

/**
 * Who is filling the form in. Maps to the app's `submitter_role` column.
 *
 * A practice manager submitting on behalf of three practitioners is a
 * materially different research job from a practitioner submitting themselves,
 * and the reviewer should not have to infer it from the wording.
 */
export type SubmitterRole = "practitioner" | "practice_staff" | "owner" | "other";

export const SUBMITTER_ROLE_LABELS: Record<SubmitterRole, string> = {
  practitioner: "I'm the practitioner",
  practice_staff: "I work at the practice",
  owner: "I own the practice",
  other: "Something else",
};

/* ==================================================================== *
 * Practitioner application
 * ==================================================================== */

/** One credential record. Repeatable — practitioners often hold several. */
export interface CredentialInput {
  /** "L.Ac.", "D.C.", "ND", "RD", "DOM" … free text: the vocabulary is wide. */
  credentialType: string;
  number?: string;
  /** Issuing state/province, where licensure is jurisdictional. */
  region?: string;
  issuingBoard?: string;
  /** ISO date. Optional — plenty of credentials don't expire. */
  expiresOn?: string;
  /** A public registry page an admin can check. The most useful field here. */
  verificationUrl?: string;
}

/** What the applicant is uploading. Mirrors the app's media kinds. */
export type MediaKind = "headshot" | "logo" | "practice";

export const MEDIA_KIND_LABELS: Record<MediaKind, string> = {
  headshot: "Headshot",
  logo: "Practice logo",
  practice: "Practice or treatment space",
};

/**
 * Per-kind upload caps, enforced server-side.
 *
 * Five practice photos is enough to show a treatment room, a waiting area and a
 * frontage; more than that is a portfolio, and reviewers don't read portfolios.
 */
export const MEDIA_LIMITS: Record<MediaKind, number> = {
  headshot: 1,
  logo: 1,
  practice: 5,
};

/** Total across all kinds. */
export const MEDIA_TOTAL_LIMIT = 7;

/** What the browser is allowed to send up. Re-encoded server-side regardless. */
export const MEDIA_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

/** Bytes, per file, before server re-encoding. A modern phone photo fits. */
export const MEDIA_MAX_BYTES = 12 * 1024 * 1024;

/**
 * A practitioner (or practice) putting themselves forward.
 *
 * Mirrors the app's intake so one admin screen can render both. Everything
 * except name, email and consent is optional: a credentialing portal that
 * refuses a submission until 40 fields are perfect is a portal nobody finishes,
 * and we would rather research a half-filled lead than lose it.
 */
export interface PractitionerApplicationInput {
  /* 1 · about you */
  fullName: string;
  /** → `submitter_role` */
  submitterRole?: SubmitterRole;
  /** → `professional_title`: "Licensed Acupuncturist", "Naturopathic Doctor". */
  professionalTitle?: string;
  /** How they present their post-nominals: "L.Ac., DAOM". */
  designations?: string;
  /** → `contact_email` */
  email: string;
  /** → `contact_phone` */
  phone?: string;
  personalWebsite?: string;

  /* 2 · your practice */
  practiceName?: string;
  addressLine1?: string;
  city?: string;
  region?: string;
  /** → `postal_code` */
  postalCode?: string;
  country?: string;
  practicePhone?: string;
  practiceWebsite?: string;
  /** → `booking_url` */
  bookingUrl?: string;

  /* 3 · how you practise — canonical modality slugs only */
  modalities: string[];
  /** Free text, only for something genuinely outside the vocabulary. */
  otherModality?: string;

  /* 4 · credentials */
  credentials: CredentialInput[];

  /* 5 · about your work — RESEARCH INPUT ONLY.
     → `professional_bio`, `alignment_statement`, `approach_statement`.

     None of these may ever be copied into `why_sakred_recommends` or any other
     field rendered in Sakred's voice. Sakred saying "we recommend them
     because…" in words the applicant wrote about themselves would make every
     editorial note on the site worthless. */
  professionalBio?: string;
  /** "Why do you feel you belong in the Sakred network?" → `alignment_statement` */
  whyBelongs?: string;
  /** "How do you approach care?" → `approach_statement` */
  approachToCare?: string;

  /* 6 · links → `social_links` (jsonb object, not an array of loose strings) */
  socialLinks?: SocialLinks;

  /* 7 · consent → `consent_at` (a timestamp, stamped server-side) */
  consentAuthorised: boolean;
}

/**
 * Social/professional profiles.
 *
 * An object rather than an array because the reviewer wants to know *which*
 * network a link belongs to without parsing the URL, and because a Psychology
 * Today profile is worth more to a credential check than an Instagram.
 */
export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  /** Directory profile: Psychology Today, NCCAOM registry, state board … */
  directory?: string;
  other?: string;
}

export const SOCIAL_LINK_LABELS: Record<keyof SocialLinks, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  directory: "Professional directory or registry",
  other: "Anything else",
};

/* ==================================================================== *
 * Recommendations
 * ==================================================================== */

export type RecommendationKind = "practitioner" | "location";

/**
 * "I know someone Sakred should look at."
 *
 * Deliberately light. Someone recommending their acupuncturist should not be
 * asked for a licence number they have no way of knowing.
 */
export interface RecommendationInput {
  kind: RecommendationKind;
  name: string;
  city?: string;
  link?: string;
  /** Canonical modality slug where the recommender knows it. */
  modality?: string;
  reason?: string;
  submitterEmail?: string;
}

/* ==================================================================== *
 * Limits
 * ==================================================================== */

/**
 * Field caps, enforced server-side.
 *
 * Also enforced in the browser so the form can show a counter, but the server
 * copy is the one that matters — a client-side maxLength is a suggestion.
 */
export const LIMITS = {
  name: 160,
  shortText: 200,
  url: 500,
  email: 200,
  longText: 2500,
  credentials: 8,
  modalities: 12,
  /** Whole JSON body, bytes. Well above a full application, far below an attack. */
  requestBytes: 64_000,
  /** The media endpoint carries a base64 image, so it gets its own ceiling. */
  mediaRequestBytes: 18 * 1024 * 1024,
} as const;

/* ==================================================================== *
 * Results
 * ==================================================================== */

export interface SubmissionResult {
  ok: boolean;
  /**
   * The queue row's id. Present only when the canonical RPC returned it, which
   * is what the media upload step is keyed to — no id means no upload, and the
   * form says so rather than pretending photos went somewhere.
   */
  submissionId?: string;
  /**
   * Which write path was taken. Reported so a deploy can prove it reached the
   * app's own RPC rather than silently falling back to a raw insert.
   */
  via?: "rpc" | "insert";
  reason?:
    | "unavailable"
    | "rejected"
    | "failed"
    | "throttled"
    | "challenge"
    /** The `public` enum value hasn't been migrated into the app yet. */
    | "source_unmigrated";
  message?: string;
}

export interface MediaUploadResult {
  ok: boolean;
  kind?: MediaKind;
  /** Storage path, for the form's own list. Never a public URL — it isn't one. */
  path?: string;
  error?: string;
}
