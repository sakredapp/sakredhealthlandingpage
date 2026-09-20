/**
 * The public practitioner application.
 *
 * Seven sections, progressively disclosed. Only *two* things are genuinely
 * required — a name and the consent box — because a form that refuses to
 * accept a submission until forty fields are perfect is a form practitioners
 * abandon, and a half-filled lead from a real acupuncturist is worth far more
 * than a pristine one that never arrives.
 *
 * ── What this form is careful about ──────────────────────────────────
 *
 *   · modalities come from the canonical vocabulary. No website-only strings.
 *   · credentials are repeatable and every field inside them is optional,
 *     because "licence number" means completely different things across
 *     acupuncture, chiropractic and health coaching — and some of the network
 *     is not licensed at all.
 *   · the two long-form answers are labelled, to the applicant, as things a
 *     person at Sakred will read. They are never published as Sakred's own
 *     words about them.
 *   · nothing here can set verification, status or publication. The server
 *     wouldn't accept it if it tried.
 *   · photographs go into the same private application-media store the app
 *     uses, through the server, and arrive unapproved. No website-only bucket,
 *     no stock photograph standing in for a real practice.
 */
import { useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, ChevronDown, ImagePlus, Loader2, Plus, X } from "lucide-react";
import { Turnstile } from "./Turnstile";
import { useModalities, uploadApplicationMedia } from "@/lib/network";
import { SEED_MODALITIES } from "@/data/modalities";
import { track } from "@/lib/analytics";
import {
  LIMITS,
  MEDIA_ACCEPTED_TYPES,
  MEDIA_KIND_LABELS,
  MEDIA_LIMITS,
  MEDIA_MAX_BYTES,
  SOCIAL_LINK_LABELS,
  SUBMITTER_ROLE_LABELS,
  type CredentialInput,
  type MediaKind,
  type SocialLinks,
  type SubmitterRole,
} from "@shared/network-submissions";

/* ------------------------------------------------------------------ *
 * Field primitives
 * ------------------------------------------------------------------ */

const fieldClass =
  "w-full rounded-xl border border-sakred-stone bg-sakred-surface px-4 py-2.5 text-sm text-sakred-espresso outline-none transition-colors duration-micro placeholder:text-sakred-ink/35 focus:border-sakred-gold";
const labelClass = "mb-1.5 block text-sm font-medium text-sakred-espresso";

function Field({
  label,
  id,
  hint,
  required,
  children,
}: {
  label: string;
  id: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass} htmlFor={id}>
        {label}
        {required && <span className="text-sakred-gold-deep"> *</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-sakred-ink/45">{hint}</p>}
    </div>
  );
}

/**
 * A collapsible section.
 *
 * "About you" opens by default; the rest start closed so the form reads as
 * seven short steps rather than one intimidating wall. Closed sections are
 * still in the DOM, so a browser autofill or a mistyped field is never hidden
 * from the person trying to find it.
 */
function Section({
  index,
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  index: number;
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-sakred-stone bg-sakred-surface">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors duration-micro hover:bg-sakred-surface-alt"
      >
        <span className="flex gap-4">
          <span className="font-display text-lg text-sakred-gold">
            {String(index).padStart(2, "0")}
          </span>
          <span>
            <span className="block font-display text-lg leading-snug text-sakred-espresso">
              {title}
            </span>
            <span className="mt-0.5 block text-sm text-sakred-ink/55">{summary}</span>
          </span>
        </span>
        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-sakred-ink/45 transition-transform duration-card ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>
      <div className={open ? "border-t border-sakred-stone/60 p-5" : "hidden"}>{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Form state
 * ------------------------------------------------------------------ */

const emptyCredential = (): CredentialInput => ({
  credentialType: "",
  number: "",
  region: "",
  issuingBoard: "",
  expiresOn: "",
  verificationUrl: "",
});

/**
 * Photos chosen but not yet sent.
 *
 * Held as `File` objects until the application itself has been accepted,
 * because the upload token that authorises them only exists once the queue has
 * handed back a row id. Choosing photos before submitting is the natural order
 * for the person filling the form; uploading them after is the only order the
 * server can authorise.
 */
interface MediaSelection {
  headshot: File[];
  logo: File[];
  practice: File[];
}

const NO_MEDIA: MediaSelection = { headshot: [], logo: [], practice: [] };

const MEDIA_SECTIONS: { kind: MediaKind; hint: string }[] = [
  { kind: "headshot", hint: "A photo of you. One is plenty." },
  { kind: "practice", hint: "Treatment room, waiting area, frontage — up to five." },
  { kind: "logo", hint: "If your practice has one." },
];

/** Flattens the selection into upload order: the headshot first. */
function selectedFiles(media: MediaSelection): { kind: MediaKind; file: File }[] {
  return MEDIA_SECTIONS.flatMap(({ kind }) =>
    media[kind].map((file) => ({ kind, file }))
  );
}

const countFiles = (media: MediaSelection): number =>
  media.headshot.length + media.logo.length + media.practice.length;

interface FormState {
  fullName: string;
  submitterRole: SubmitterRole;
  professionalTitle: string;
  designations: string;
  email: string;
  phone: string;
  personalWebsite: string;
  practiceName: string;
  addressLine1: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  practicePhone: string;
  practiceWebsite: string;
  bookingUrl: string;
  modalities: string[];
  otherModality: string;
  credentials: CredentialInput[];
  professionalBio: string;
  whyBelongs: string;
  approachToCare: string;
  socialLinks: SocialLinks;
  consentAuthorised: boolean;
}

const INITIAL: FormState = {
  fullName: "",
  submitterRole: "practitioner",
  professionalTitle: "",
  designations: "",
  email: "",
  phone: "",
  personalWebsite: "",
  practiceName: "",
  addressLine1: "",
  city: "",
  region: "",
  postalCode: "",
  country: "United States",
  practicePhone: "",
  practiceWebsite: "",
  bookingUrl: "",
  modalities: [],
  otherModality: "",
  credentials: [emptyCredential()],
  professionalBio: "",
  whyBelongs: "",
  approachToCare: "",
  socialLinks: {},
  consentAuthorised: false,
};

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

export function PractitionerApplication() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [open, setOpen] = useState<number>(1);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [started, setStarted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [media, setMedia] = useState<MediaSelection>(NO_MEDIA);
  const [mediaError, setMediaError] = useState<string | null>(null);
  /** Set once the upload pass has run, so the success screen can be honest. */
  const mediaOutcome = useRef<{ uploaded: number; failed: number } | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    // The first keystroke is the funnel entry — fired once, with no content.
    if (!started) {
      setStarted(true);
      track("practitioner_apply_started", { surface: "for_practitioners" });
    }
    setForm((current) => ({ ...current, [key]: value }));
  };

  /* Canonical vocabulary when the network is reachable; the seed list as a
     fallback so the form works before the tables ship. Both are slugs — the
     server stores what we send, and inventing website-only modality strings
     would poison the vocabulary. */
  const { data: liveModalities, available } = useModalities();
  const modalityOptions = useMemo(() => {
    if (available && liveModalities.length) {
      return liveModalities.map((m) => ({ slug: m.slug, name: m.name }));
    }
    return SEED_MODALITIES.map((m) => ({ slug: m.slug, name: m.name }));
  }, [liveModalities, available]);

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/network/practitioner-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          // Blank credential rows are UI scaffolding, not data.
          credentials: form.credentials.filter((c) => c.credentialType.trim()),
          // Empty strings would be stored as empty strings; drop them.
          socialLinks: Object.fromEntries(
            Object.entries(form.socialLinks).filter(([, v]) => v?.trim())
          ),
          turnstileToken,
          website_url: honeypot,
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (Array.isArray(body?.details)) {
          setFieldErrors(
            Object.fromEntries(body.details.map((d: any) => [d.path, d.message]))
          );
        }
        throw new Error(body?.error || "Something went wrong. Please try again.");
      }

      /**
       * The photo pass. Runs only if the server minted a token, which it only
       * does when the queue returned a real row to attach to.
       *
       * Sequential rather than parallel: each image is re-encoded server-side,
       * and firing six of those at once from a phone on clinic wifi is how you
       * get three timeouts. A failed photo never fails the application — the
       * application is the thing that matters, and the success screen says
       * plainly which photos didn't make it.
       */
      const files = selectedFiles(media);
      if (body?.uploadToken && files.length) {
        let uploaded = 0;
        let failed = 0;
        for (const { kind, file } of files) {
          const result = await uploadApplicationMedia({
            token: body.uploadToken,
            kind,
            file,
          }).catch(() => ({ ok: false }) as const);
          result.ok ? uploaded++ : failed++;
        }
        mediaOutcome.current = { uploaded, failed };
      } else if (files.length) {
        // No token: uploads are not available on this deployment.
        mediaOutcome.current = { uploaded: 0, failed: files.length };
      }

      return body;
    },
    onSuccess: () => {
      track("practitioner_apply_submitted", {
        surface: "for_practitioners",
        modality_count: form.modalities.length,
        credential_count: form.credentials.filter((c) => c.credentialType.trim()).length,
        media_count: mediaOutcome.current?.uploaded ?? 0,
      });
    },
  });

  /* ---- photo selection ---- */

  const addFiles = (kind: MediaKind, incoming: FileList | null) => {
    if (!incoming?.length) return;
    setMediaError(null);

    const accepted: File[] = [];
    for (const file of Array.from(incoming)) {
      if (file.size > MEDIA_MAX_BYTES) {
        setMediaError(`“${file.name}” is over 12MB.`);
        continue;
      }
      if (!file.type.startsWith("image/")) {
        setMediaError(`“${file.name}” isn't an image.`);
        continue;
      }
      accepted.push(file);
    }
    if (!accepted.length) return;

    setMedia((current) => {
      // Newest wins for the single-slot kinds, so re-picking a headshot
      // replaces it rather than silently doing nothing.
      const merged = [...current[kind], ...accepted].slice(-MEDIA_LIMITS[kind]);
      return { ...current, [kind]: merged };
    });
  };

  const removeFile = (kind: MediaKind, index: number) =>
    setMedia((current) => ({
      ...current,
      [kind]: current[kind].filter((_, i) => i !== index),
    }));

  const toggleModality = (slug: string) =>
    set(
      "modalities",
      form.modalities.includes(slug)
        ? form.modalities.filter((s) => s !== slug)
        : [...form.modalities, slug]
    );

  const updateCredential = (index: number, patch: Partial<CredentialInput>) =>
    set(
      "credentials",
      form.credentials.map((c, i) => (i === index ? { ...c, ...patch } : c))
    );

  const canSubmit =
    form.fullName.trim().length >= 2 &&
    form.email.trim().includes("@") &&
    form.consentAuthorised &&
    !mutation.isPending;

  /* ---- success ---- */
  if (mutation.isSuccess) {
    const photos = mediaOutcome.current;
    return (
      <div className="rounded-3xl border border-sakred-gold/35 bg-sakred-gold/[0.07] p-8 text-center sm:p-12">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-sakred-gold/45 bg-sakred-surface">
          <Check className="h-6 w-6 text-sakred-gold-deep" aria-hidden="true" />
        </span>
        <h2 className="font-display text-2xl text-sakred-espresso">
          Thank you — that&rsquo;s with us.
        </h2>
        {/* Says exactly what happens next, and nothing more. Not "you're
            listed", not "you're under review by our clinical board". */}
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-sakred-ink/70">
          Your submission is in the Health Network queue. Someone at Sakred reads every
          one. If it looks like a fit we&rsquo;ll be in touch to talk properly before
          anything is published.
        </p>
        {/* Photos get their own line, and it says what actually happened.
            "Thanks, we got everything" when three uploads failed is the kind of
            small lie that turns into a confused email a fortnight later. */}
        {photos && photos.uploaded > 0 && photos.failed === 0 && (
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-sakred-ink/60">
            {photos.uploaded === 1
              ? "Your photo is attached to it."
              : `All ${photos.uploaded} photos are attached to it.`}
          </p>
        )}
        {photos && photos.failed > 0 && (
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-sakred-ink/60">
            {photos.uploaded > 0
              ? `${photos.uploaded} of your photos were attached; ${photos.failed} didn't upload. `
              : "Your photos didn't upload. "}
            Send {photos.uploaded > 0 ? "the rest" : "them"} to{" "}
            <a
              href="mailto:network@sakredhealth.com?subject=Practice%20photos"
              className="font-medium text-sakred-gold-deep underline decoration-sakred-gold/40 underline-offset-4"
            >
              network@sakredhealth.com
            </a>{" "}
            and we&rsquo;ll attach them by hand.
          </p>
        )}

        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-sakred-ink/55">
          Submission doesn&rsquo;t guarantee listing, review, recommendation or
          verification.
        </p>
      </div>
    );
  }

  /* ---- form ---- */
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setFieldErrors({});
        if (canSubmit) mutation.mutate();
      }}
      className="space-y-4"
    >
      {/* 1 ------------------------------------------------------------ */}
      <Section
        index={1}
        title="About you"
        summary="Who you are and how we reach you."
        open={open === 1}
        onToggle={() => setOpen(open === 1 ? 0 : 1)}
      >
        <div className="space-y-5">
          {/* Asked first because it changes what the rest of the form means: a
              practice manager submitting on behalf of three practitioners is a
              different research job from a practitioner submitting themselves,
              and the reviewer shouldn't have to infer it from the wording. */}
          <fieldset>
            <legend className={labelClass}>Who&rsquo;s submitting?</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SUBMITTER_ROLE_LABELS) as SubmitterRole[]).map((role) => {
                const active = form.submitterRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => set("submitterRole", role)}
                    aria-pressed={active}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors duration-micro ${
                      active
                        ? "border-sakred-gold bg-sakred-gold/12 text-sakred-espresso"
                        : "border-sakred-stone text-sakred-ink/65 hover:border-sakred-gold/50"
                    }`}
                  >
                    {SUBMITTER_ROLE_LABELS[role]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Field label="Full name" id="pa-name" required>
            <input
              id="pa-name"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              maxLength={LIMITS.name}
              className={fieldClass}
              autoComplete="name"
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Professional title" id="pa-title" hint="e.g. Licensed Acupuncturist">
              <input
                id="pa-title"
                value={form.professionalTitle}
                onChange={(e) => set("professionalTitle", e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Designations" id="pa-designations" hint="How you write them: L.Ac., DAOM">
              <input
                id="pa-designations"
                value={form.designations}
                onChange={(e) => set("designations", e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Professional email" id="pa-email" required>
              <input
                id="pa-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className={fieldClass}
                autoComplete="email"
              />
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-destructive">{fieldErrors.email}</p>
              )}
            </Field>
            <Field label="Phone" id="pa-phone">
              <input
                id="pa-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={fieldClass}
                autoComplete="tel"
              />
            </Field>
          </div>
          <Field label="Professional website" id="pa-web" hint="Starting with https://">
            <input
              id="pa-web"
              value={form.personalWebsite}
              onChange={(e) => set("personalWebsite", e.target.value)}
              placeholder="https://"
              className={fieldClass}
            />
          </Field>
        </div>
      </Section>

      {/* 2 ------------------------------------------------------------ */}
      <Section
        index={2}
        title="Your practice"
        summary="Where people would come to see you."
        open={open === 2}
        onToggle={() => setOpen(open === 2 ? 0 : 2)}
      >
        <div className="space-y-5">
          <Field label="Practice name" id="pa-practice">
            <input
              id="pa-practice"
              value={form.practiceName}
              onChange={(e) => set("practiceName", e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Address" id="pa-address">
            <input
              id="pa-address"
              value={form.addressLine1}
              onChange={(e) => set("addressLine1", e.target.value)}
              className={fieldClass}
              autoComplete="street-address"
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="City" id="pa-city">
              <input
                id="pa-city"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="State / region" id="pa-region">
              <input
                id="pa-region"
                value={form.region}
                onChange={(e) => set("region", e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Postal code" id="pa-postal">
              <input
                id="pa-postal"
                value={form.postalCode}
                onChange={(e) => set("postalCode", e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Practice phone" id="pa-pphone">
              <input
                id="pa-pphone"
                type="tel"
                value={form.practicePhone}
                onChange={(e) => set("practicePhone", e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Practice website" id="pa-pweb">
              <input
                id="pa-pweb"
                value={form.practiceWebsite}
                onChange={(e) => set("practiceWebsite", e.target.value)}
                placeholder="https://"
                className={fieldClass}
              />
            </Field>
          </div>
          <Field label="Booking link" id="pa-booking" hint="If people can book you online.">
            <input
              id="pa-booking"
              value={form.bookingUrl}
              onChange={(e) => set("bookingUrl", e.target.value)}
              placeholder="https://"
              className={fieldClass}
            />
          </Field>

          {/* Kept as named fields rather than a free list: a reviewer checking
              a credential wants to know a link is a state board registry
              without opening it, and a professional directory profile is worth
              considerably more to that check than a social account. */}
          <fieldset className="border-t border-sakred-stone/70 pt-5">
            <legend className="mb-1 text-sm font-medium text-sakred-espresso">
              Where else can we find you?
            </legend>
            <p className="mb-4 text-xs text-sakred-ink/50">
              Optional. A directory or registry profile is the most useful one.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {(Object.keys(SOCIAL_LINK_LABELS) as (keyof SocialLinks)[]).map((key) => (
                <Field key={key} label={SOCIAL_LINK_LABELS[key]} id={`pa-social-${key}`}>
                  <input
                    id={`pa-social-${key}`}
                    value={form.socialLinks[key] ?? ""}
                    onChange={(e) =>
                      set("socialLinks", { ...form.socialLinks, [key]: e.target.value })
                    }
                    placeholder="https://"
                    className={fieldClass}
                  />
                </Field>
              ))}
            </div>
          </fieldset>
        </div>
      </Section>

      {/* 3 ------------------------------------------------------------ */}
      <Section
        index={3}
        title="How you practise"
        summary="The modalities you actually work in."
        open={open === 3}
        onToggle={() => setOpen(open === 3 ? 0 : 3)}
      >
        <fieldset>
          <legend className="sr-only">Modalities</legend>
          <ul className="flex flex-wrap gap-2">
            {modalityOptions.map((modality) => {
              const active = form.modalities.includes(modality.slug);
              return (
                <li key={modality.slug}>
                  <button
                    type="button"
                    onClick={() => toggleModality(modality.slug)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-micro ${
                      active
                        ? "border-sakred-gold bg-sakred-gold/15 text-sakred-gold-deep"
                        : "border-sakred-stone bg-sakred-surface text-sakred-ink/70 hover:text-sakred-espresso"
                    }`}
                  >
                    {active && <Check className="h-3 w-3" aria-hidden="true" />}
                    {modality.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>
        <div className="mt-5">
          <Field
            label="Something else"
            id="pa-other"
            hint="Only if what you do genuinely isn't in the list above."
          >
            <input
              id="pa-other"
              value={form.otherModality}
              onChange={(e) => set("otherModality", e.target.value)}
              className={fieldClass}
            />
          </Field>
        </div>
      </Section>

      {/* 4 ------------------------------------------------------------ */}
      <Section
        index={4}
        title="Credentials"
        summary="Licences and certifications, where they apply."
        open={open === 4}
        onToggle={() => setOpen(open === 4 ? 0 : 4)}
      >
        {/* Conditional by design: not every valid modality is licensed, and a
            form that demands a licence number from a bodyworker excludes half
            the network. */}
        <p className="mb-5 text-sm leading-relaxed text-sakred-ink/60">
          Add whichever apply. Not every modality in the network is licensed the same
          way — leave this empty if it doesn&rsquo;t apply to you. A public verification
          link is the single most useful thing you can give us.
        </p>

        <div className="space-y-4">
          {form.credentials.map((credential, index) => (
            <div key={index} className="rounded-xl border border-sakred-stone/70 bg-sakred-surface-alt p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-sakred-ink/45">
                  Credential {index + 1}
                </span>
                {form.credentials.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      set("credentials", form.credentials.filter((_, i) => i !== index))
                    }
                    className="text-sakred-ink/40 hover:text-sakred-espresso"
                    aria-label={`Remove credential ${index + 1}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Type" id={`cred-type-${index}`}>
                  <input
                    id={`cred-type-${index}`}
                    value={credential.credentialType}
                    onChange={(e) => updateCredential(index, { credentialType: e.target.value })}
                    placeholder="L.Ac."
                    className={fieldClass}
                  />
                </Field>
                <Field label="Number" id={`cred-num-${index}`}>
                  <input
                    id={`cred-num-${index}`}
                    value={credential.number}
                    onChange={(e) => updateCredential(index, { number: e.target.value })}
                    className={fieldClass}
                  />
                </Field>
                <Field label="State / region" id={`cred-region-${index}`}>
                  <input
                    id={`cred-region-${index}`}
                    value={credential.region}
                    onChange={(e) => updateCredential(index, { region: e.target.value })}
                    className={fieldClass}
                  />
                </Field>
                <Field label="Issuing board" id={`cred-board-${index}`}>
                  <input
                    id={`cred-board-${index}`}
                    value={credential.issuingBoard}
                    onChange={(e) => updateCredential(index, { issuingBoard: e.target.value })}
                    className={fieldClass}
                  />
                </Field>
                <Field label="Expires" id={`cred-exp-${index}`} hint="If applicable.">
                  <input
                    id={`cred-exp-${index}`}
                    type="date"
                    value={credential.expiresOn}
                    onChange={(e) => updateCredential(index, { expiresOn: e.target.value })}
                    className={fieldClass}
                  />
                </Field>
                <Field label="Public verification link" id={`cred-url-${index}`}>
                  <input
                    id={`cred-url-${index}`}
                    value={credential.verificationUrl}
                    onChange={(e) => updateCredential(index, { verificationUrl: e.target.value })}
                    placeholder="https://"
                    className={fieldClass}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>

        {form.credentials.length < LIMITS.credentials && (
          <button
            type="button"
            onClick={() => set("credentials", [...form.credentials, emptyCredential()])}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-sakred-gold-deep hover:text-sakred-espresso"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add another credential
          </button>
        )}
      </Section>

      {/* 5 ------------------------------------------------------------ */}
      <Section
        index={5}
        title="About your work"
        summary="In your own words."
        open={open === 5}
        onToggle={() => setOpen(open === 5 ? 0 : 5)}
      >
        <div className="space-y-5">
          <Field
            label="A short professional bio"
            id="pa-bio"
            hint="The one you'd give a referring practitioner."
          >
            <textarea
              id="pa-bio"
              rows={4}
              value={form.professionalBio}
              onChange={(e) => set("professionalBio", e.target.value)}
              maxLength={LIMITS.longText}
              className={`${fieldClass} resize-y`}
            />
          </Field>
          <Field
            label="Why do you believe your work belongs in the Sakred Health Network?"
            id="pa-why"
          >
            <textarea
              id="pa-why"
              rows={5}
              value={form.whyBelongs}
              onChange={(e) => set("whyBelongs", e.target.value)}
              maxLength={LIMITS.longText}
              className={`${fieldClass} resize-y`}
            />
          </Field>
          <Field
            label="What should someone understand about your approach to care?"
            id="pa-approach"
          >
            <textarea
              id="pa-approach"
              rows={5}
              value={form.approachToCare}
              onChange={(e) => set("approachToCare", e.target.value)}
              maxLength={LIMITS.longText}
              className={`${fieldClass} resize-y`}
            />
          </Field>
          {/* Set expectations honestly: these are read by a person, they are
              not marketing copy, and Sakred will not publish them as its own
              assessment of the practice. */}
          <p className="text-xs leading-relaxed text-sakred-ink/50">
            These answers go to whoever researches your submission. They&rsquo;re not
            published as Sakred&rsquo;s own description of your practice — anything
            written in Sakred&rsquo;s voice is written by us, after we&rsquo;ve looked.
          </p>
        </div>
      </Section>

      {/* 6 ------------------------------------------------------------ */}
      <Section
        index={6}
        title="Photos"
        summary={
          countFiles(media) > 0
            ? `${countFiles(media)} selected — sent after you submit.`
            : "Optional — your space, your team."
        }
        open={open === 6}
        onToggle={() => setOpen(open === 6 ? 0 : 6)}
      >
        {/* Files are chosen here and sent after the application is accepted —
            the upload token that authorises them doesn't exist until then.
            They go through our server into the same private application-media
            store the app uses, are re-encoded on the way (which strips the GPS
            coordinates phone cameras write into practice photos), and arrive
            unapproved. */}
        <p className="text-sm leading-relaxed text-sakred-ink/65">
          A headshot, a few photos of your treatment space, and your logo help enormously
          — they&rsquo;re what makes a profile feel like a real place rather than a
          directory row. We only ever publish photographs of your actual practice; we
          never put stock imagery where a real space should be.
        </p>

        <div className="mt-6 space-y-6">
          {MEDIA_SECTIONS.map(({ kind, hint }) => {
            const files = media[kind];
            const full = files.length >= MEDIA_LIMITS[kind];
            return (
              <div key={kind}>
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-sakred-espresso">
                    {MEDIA_KIND_LABELS[kind]}
                  </span>
                  <span className="text-xs text-sakred-ink/45">{hint}</span>
                </div>

                {files.length > 0 && (
                  <ul className="mb-3 space-y-2">
                    {files.map((file, index) => (
                      <li
                        key={`${file.name}-${index}`}
                        className="flex items-center gap-3 rounded-xl border border-sakred-stone bg-sakred-surface px-3 py-2"
                      >
                        <span className="min-w-0 flex-1 truncate text-sm text-sakred-espresso">
                          {file.name}
                        </span>
                        <span className="shrink-0 text-xs text-sakred-ink/45">
                          {Math.max(1, Math.round(file.size / 1024))} KB
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(kind, index)}
                          className="shrink-0 rounded-full p-1 text-sakred-ink/45 transition-colors duration-micro hover:text-destructive"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <label
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-sakred-stone px-4 py-2 text-sm text-sakred-ink/70 transition-colors duration-micro hover:border-sakred-gold/50 hover:text-sakred-espresso ${
                    full ? "pointer-events-none opacity-45" : ""
                  }`}
                >
                  <ImagePlus className="h-4 w-4 text-sakred-gold-deep" aria-hidden="true" />
                  {files.length ? "Choose another" : "Choose a file"}
                  <input
                    type="file"
                    className="sr-only"
                    accept={MEDIA_ACCEPTED_TYPES.join(",")}
                    multiple={MEDIA_LIMITS[kind] > 1}
                    disabled={full}
                    onChange={(e) => {
                      addFiles(kind, e.target.files);
                      // Lets the same file be re-picked after being removed.
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            );
          })}
        </div>

        {mediaError && (
          <p role="alert" className="mt-4 text-xs text-destructive">
            {mediaError}
          </p>
        )}

        <p className="mt-6 text-xs leading-relaxed text-sakred-ink/50">
          Photos are sent after you submit, stay private, and are never published
          automatically — someone at Sakred chooses what appears on a profile. Location
          data is removed from every image before it&rsquo;s stored.
        </p>
      </Section>

      {/* 7 ------------------------------------------------------------ */}
      <Section
        index={7}
        title="Consent"
        summary="Required."
        open={open === 7}
        onToggle={() => setOpen(open === 7 ? 0 : 7)}
      >
        <label className="flex cursor-pointer gap-3">
          <input
            type="checkbox"
            checked={form.consentAuthorised}
            onChange={(e) => set("consentAuthorised", e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#C5A059]"
          />
          <span className="text-sm leading-relaxed text-sakred-ink/75">
            I&rsquo;m authorised to submit this professional information, and I understand
            that submitting it does not guarantee listing, review, recommendation or
            verification by Sakred Health.
          </span>
        </label>
      </Section>

      {/* honeypot — positioned away rather than display:none, which some bots skip */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="pa-website-url">Leave this blank</label>
        <input
          id="pa-website-url"
          name="website_url"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <Turnstile onToken={setTurnstileToken} className="pt-2" />

      {mutation.isError && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {(mutation.error as Error).message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 rounded-full border border-sakred-gold bg-gradient-to-r from-sakred-gold via-sakred-gold-light to-sakred-gold px-7 py-3 text-sm font-medium text-sakred-espresso transition-transform duration-micro hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
        >
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {mutation.isPending && countFiles(media) > 0
            ? "Sending your photos…"
            : "Request consideration"}
        </button>
        <p className="text-xs text-sakred-ink/50">
          Name, email and consent are all that&rsquo;s required — the rest helps.
        </p>
      </div>
    </form>
  );
}
