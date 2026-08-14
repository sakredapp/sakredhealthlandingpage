/**
 * Writes into the canonical Health Network queue.
 *
 * The only file in this repo that writes anything to the network database, and
 * it does so through exactly three service-only functions. It cannot publish,
 * cannot verify, cannot create a canonical practitioner or location, cannot
 * change a submission's status after creation, and cannot read admin notes.
 * Those capabilities are not "guarded" here — they are simply absent, which is
 * a stronger property than a guard.
 *
 * ── There is no second write path ────────────────────────────────────
 *
 * An earlier version of this file could fall back to inserting into
 * `health_network_submissions` directly when an RPC was missing, narrowing the
 * column set until Postgres accepted it. That is gone. All three functions are
 * deployed, and a raw insert would bypass the rules that live inside them —
 * forced status, forced provenance, forced null ownership, consent enforcement,
 * transactional credential rows. If a function stops existing, this module
 * fails and says so. A silent fallback would hide a backend regression behind
 * rows that look fine and are not.
 *
 * ── Service role, server side, nowhere else ──────────────────────────
 *
 * This module uses `writeClient()` — the service-role key. That key never
 * reaches the browser, and the browser has no path to these functions except
 * through the Vercel routes in `api/network/`, behind Turnstile, rate limiting,
 * a payload cap and a honeypot.
 *
 * ── Why NOT the app's authenticated intake RPC ───────────────────────
 *
 * The mobile app's `submit_practitioner_application` binds the row to
 * `auth.uid()`. A website applicant is very often not a Sakred account holder,
 * so calling that function under the service role would either fail or write a
 * row whose ownership is a fiction. The website targets a separate,
 * service-only entry point that forces `submitted_by_user_id = null` and is
 * REVOKEd from `anon` and `authenticated`. Same table, same queue, honest
 * provenance.
 *
 * ── Nothing is passed through ────────────────────────────────────────
 *
 * Every argument is named explicitly from a server-validated DTO. There is no
 * spread of a request body anywhere in this file. A client can send
 * `{"status":"approved","published":true,"verification":"sakred_verified"}` all
 * it likes; none of those keys is ever read. The functions themselves force
 * status, source, external_source and ownership regardless.
 */
import { randomUUID } from "crypto";
import { type SupabaseClient } from "@supabase/supabase-js";
import { writeClient } from "./network-clients.js";
import { getModalities } from "./health-network.js";
import {
  WEBSITE_SOURCES,
  type MediaKind,
  type PractitionerApplicationInput,
  type RecommendationInput,
  type SubmissionResult,
  type WebsiteSource,
} from "../../shared/network-submissions.js";

/**
 * Service-only entry points, verified against production.
 *
 *   submit_public_practitioner_application(21 args) → uuid
 *   submit_public_health_recommendation(11 args)    → uuid
 *   attach_public_application_media(3 args)         → uuid
 *
 * All three: anon NO, authenticated NO, service_role YES. Each forces
 * `status = new`, `submitted_by_user_id = null` and `external_source =
 * sakred_web`, and sets `submission_source` from which function was called —
 * `practitioner` for an applicant vouching for themselves, `public` for a
 * visitor vouching for someone else.
 */
const RPC_PRACTITIONER = "submit_public_practitioner_application";
const RPC_RECOMMENDATION = "submit_public_health_recommendation";
const RPC_ATTACH_MEDIA = "attach_public_application_media";

export function isIntakeConfigured(): boolean {
  return writeClient() !== null;
}

/* ==================================================================== *
 * Error classification
 * ==================================================================== */

function isMissingFunction(error: any): boolean {
  if (!error) return false;
  const code = error.code ?? "";
  if (["42883", "PGRST202"].includes(code)) return true;
  return /function .* does not exist|could not find the function/i.test(error.message ?? "");
}

/**
 * "That's not a value of the enum."
 *
 * Worth its own branch so the log line names the fix instead of printing a
 * Postgres error and leaving an operator to work out what `22P02` means at
 * 11pm. `public` is in `health_submission_source` as of the backend cutover;
 * this fires only if that migration is ever rolled back.
 */
function isUnknownEnumValue(error: any): boolean {
  if (!error) return false;
  const code = error.code ?? "";
  if (["22P02", "22023"].includes(code)) return true;
  return /invalid input value for enum/i.test(error.message ?? "");
}

/** A submission id out of whatever shape the RPC chose to return it in. */
function extractId(data: any): string | undefined {
  if (!data) return undefined;
  if (typeof data === "string") return data;
  const row = Array.isArray(data) ? data[0] : data;
  if (typeof row === "string") return row;
  const id = row?.id ?? row?.submission_id ?? row?.application_id;
  return typeof id === "string" ? id : undefined;
}

/**
 * Calls a service-only RPC.
 *
 * Three outcomes, and the distinction between the last two is the whole point:
 *
 *   ok         the queue accepted it
 *   rejected   the function ran and refused — a business or security rule
 *              fired. The submission does NOT get retried another way.
 *   missing    the function is not deployed. Also a refusal here: the funnel
 *              stops rather than writing rows the app never agreed to.
 */
async function callRpc(
  db: SupabaseClient,
  name: string,
  args: Record<string, unknown>
): Promise<{ ok: boolean; id?: string; error?: any; missing?: boolean }> {
  const { data, error } = await db.rpc(name, args);

  if (!error) return { ok: true, id: extractId(data) };

  if (isMissingFunction(error)) {
    console.error(
      `[intake] ${name} is NOT DEPLOYED. Refusing to write. There is deliberately no ` +
        "raw-insert fallback: it would bypass the forced status, provenance and consent " +
        "rules that live inside the function."
    );
    return { ok: false, missing: true, error };
  }

  console.error(`[intake] ${name} rejected the submission:`, error.message);
  return { ok: false, error };
}

/**
 * The website may only ever produce two provenances.
 *
 * Cheap, but it is the assertion that stops a future edit quietly filing
 * website traffic as `member` or `research` — the two values that would make
 * the admin queue lie about how much a tip is worth.
 */
function assertWebsiteSource(source: WebsiteSource): void {
  if (!WEBSITE_SOURCES.includes(source)) {
    throw new Error(`[intake] refusing to write submission_source "${source}" from the website`);
  }
}

/**
 * Canonical modality slugs → the uuids both intake functions take.
 *
 * The forms speak slugs, because a slug is what a URL and a filter chip carry.
 * The queue speaks uuids. Anything that doesn't resolve is dropped rather than
 * passed through: an unknown slug in a `uuid[]` is a type error that would fail
 * the whole submission, and losing one chip is better than losing the
 * application. Unresolved slugs are logged by name.
 */
async function modalityIds(slugs: string[] | undefined): Promise<string[] | null> {
  if (!slugs?.length) return null;

  const vocabulary = await getModalities();
  const bySlug = new Map(vocabulary.map((m) => [m.slug, m.id]));

  const ids: string[] = [];
  const unknown: string[] = [];
  for (const slug of slugs) {
    const id = bySlug.get(slug);
    if (id) ids.push(id);
    else unknown.push(slug);
  }

  if (unknown.length) {
    console.warn(`[intake] modality slug(s) not in the canonical vocabulary: ${unknown.join(", ")}`);
  }
  return ids.length ? ids : null;
}

/** Joins the parts of an address the queue takes as one free-text field. */
function addressText(input: PractitionerApplicationInput): string | null {
  const parts = [input.addressLine1, input.country].filter(
    (p): p is string => Boolean(p && p.trim())
  );
  return parts.length ? parts.join(", ") : null;
}

/* ==================================================================== *
 * Practitioner applications
 * ==================================================================== */

/**
 * Files a practitioner's own application. `submission_source = practitioner`.
 *
 * `alignment_statement` and `approach_statement` are RESEARCH INPUT — the
 * applicant's own words about themselves. Nothing here may ever be promoted
 * into `why_sakred_recommends` or any other field rendered in Sakred's voice.
 * The backend enforces that too; this is the same rule stated at both ends.
 *
 * ── Three form fields the contract has no parameter for ──────────────
 *
 * These are real inputs a visitor fills in, so they are folded into the nearest
 * field that honestly holds them rather than dropped:
 *
 *   designations    → appended to `professional_title`, which is how
 *                     practitioners write it anyway: "Licensed Acupuncturist,
 *                     L.Ac., DAOM"
 *   country         → part of `address_text`, where a country belongs
 *   otherModality   → appended to `professional_bio`, labelled. It cannot go in
 *                     `modality_ids` (a uuid[] by definition holds no free
 *                     text) and a reviewer needs to see that the applicant
 *                     practises something the vocabulary is missing — that is
 *                     how the vocabulary grows.
 *
 * If the app team adds `p_designations` / `p_country` / `p_other_modality`,
 * unpick these three and pass them straight through.
 */
export async function submitPractitionerApplication(
  input: PractitionerApplicationInput,
  meta: { ip: string; userAgent?: string }
): Promise<SubmissionResult> {
  const db = writeClient();
  if (!db) return { ok: false, reason: "unavailable" };

  const source: WebsiteSource = "practitioner";
  assertWebsiteSource(source);

  const title = [input.professionalTitle, input.designations]
    .filter((p) => p && p.trim())
    .join(", ");

  const bio = [
    input.professionalBio,
    input.otherModality ? `Also practises: ${input.otherModality}` : null,
  ]
    .filter((p) => p && p.trim())
    .join("\n\n");

  const rpc = await callRpc(db, RPC_PRACTITIONER, {
    p_submitter_role: input.submitterRole ?? null,
    p_practitioner_name: input.fullName,
    p_professional_title: title || null,
    p_contact_email: input.email,
    p_contact_phone: input.phone ?? null,
    p_professional_bio: bio || null,
    p_practice_name: input.practiceName ?? null,
    p_practice_website: input.practiceWebsite ?? input.personalWebsite ?? null,
    p_booking_url: input.bookingUrl ?? null,
    p_practice_phone: input.practicePhone ?? null,
    p_address_text: addressText(input),
    p_city: input.city ?? null,
    p_region: input.region ?? null,
    p_postal_code: input.postalCode ?? null,
    p_modality_ids: await modalityIds(input.modalities),
    p_alignment_statement: input.whyBelongs ?? null,
    p_approach_statement: input.approachToCare ?? null,
    p_social_links: input.socialLinks && Object.keys(input.socialLinks).length
      ? input.socialLinks
      : [],
    p_credentials: input.credentials ?? [],
    /**
     * The queue rejects a false consent outright. Sending the applicant's
     * actual answer rather than a hardcoded `true` is the point — a consent
     * flag the server always sets is not a consent record.
     */
    p_consent: input.consentAuthorised === true,
    p_external_ref: null,
  });

  if (!rpc.ok) {
    if (isUnknownEnumValue(rpc.error)) {
      logSourceUnmigrated(source);
      return { ok: false, reason: "source_unmigrated" };
    }
    return { ok: false, reason: rpc.missing ? "unavailable" : "rejected" };
  }

  return { ok: true, via: "rpc", submissionId: rpc.id };
}

/* ==================================================================== *
 * Public recommendations
 * ==================================================================== */

/**
 * Files someone else's recommendation, from an anonymous website visitor.
 * `submission_source = public`.
 *
 * Provenance is `public`, not `member`. The distinction is the whole point: a
 * reviewer weighing "a Sakred member recommended their acupuncturist" against
 * "a stranger on the internet typed a name into a form" needs those to be
 * different rows, and calling the second one `member` to avoid a one-line enum
 * migration would corrupt the only signal the queue has about trust.
 *
 * This creates a queue submission and nothing else. No canonical provider is
 * created, published or verified by anything on this path.
 *
 * ── The recommender's email ──────────────────────────────────────────
 *
 * The form offers an optional "your email, if we may follow up". The function
 * has no parameter for it, so it goes into `submitter_note` under a label
 * rather than being quietly discarded — a reviewer who wants to check a tip
 * needs the one person who can confirm it. If `p_contact_email` is ever added,
 * move it and drop the prefix.
 */
export async function submitRecommendation(
  input: RecommendationInput,
  meta: { ip: string; userAgent?: string }
): Promise<SubmissionResult> {
  const db = writeClient();
  if (!db) return { ok: false, reason: "unavailable" };

  const source: WebsiteSource = "public";
  assertWebsiteSource(source);

  const note = [
    input.reason,
    input.submitterEmail ? `Recommender contact: ${input.submitterEmail}` : null,
  ]
    .filter((p) => p && p.trim())
    .join("\n\n");

  const rpc = await callRpc(db, RPC_RECOMMENDATION, {
    p_subject_type: input.kind,
    p_name: input.name,
    p_city: input.city ?? null,
    p_region: null,
    p_address_text: null,
    p_website_url: input.link ?? null,
    p_phone: null,
    /* The subject's name when the tip is about a person; the practice name is
       already in p_name and must not be repeated as a practitioner. */
    p_practitioner_name: input.kind === "practitioner" ? input.name : null,
    p_modality_ids: await modalityIds(input.modality ? [input.modality] : undefined),
    p_submitter_note: note || null,
    p_external_ref: null,
  });

  if (!rpc.ok) {
    if (isUnknownEnumValue(rpc.error)) {
      logSourceUnmigrated(source);
      return { ok: false, reason: "source_unmigrated" };
    }
    return { ok: false, reason: rpc.missing ? "unavailable" : "rejected" };
  }

  return { ok: true, via: "rpc", submissionId: rpc.id };
}

function logSourceUnmigrated(source: WebsiteSource) {
  console.error(
    `[intake] submission_source "${source}" is not in the app's health_submission_source enum. ` +
      "Website submissions CANNOT be filed until that value exists. Refusing rather than " +
      "mislabelling the row."
  );
}

/* ==================================================================== *
 * Application media
 * ==================================================================== */

/**
 * Attaches an already-uploaded, already-sanitised image to a submission.
 *
 * Called only by `api/network/application-media.ts`, after that route has
 * verified an upload token, re-encoded the image and put it in the app's
 * private bucket. Media lands unapproved: conversion never auto-publishes it,
 * and an admin chooses what appears on a provider page.
 *
 * Three arguments, no bucket among them — the function knows its own bucket,
 * and it validates that the path is `web/<submission_id>/…` and belongs to the
 * submission being named. Passing dimensions or a content type is not possible
 * and should not be: the file is already in storage where those are readable,
 * and a caller-asserted byte size is a claim, not a fact.
 */
export async function attachApplicationMedia(args: {
  submissionId: string;
  kind: MediaKind;
  path: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const db = writeClient();
  if (!db) return { ok: false, reason: "unavailable" };

  const rpc = await callRpc(db, RPC_ATTACH_MEDIA, {
    p_submission_id: args.submissionId,
    p_kind: args.kind,
    p_storage_path: args.path,
  });

  if (rpc.ok) return { ok: true };
  return { ok: false, reason: rpc.missing ? "unavailable" : "rejected" };
}

/**
 * A storage path inside the app's private bucket.
 *
 * The `web/<submission_id>/` prefix is not a convention this file chose — the
 * attach function requires it and rejects anything else, including a path under
 * another submission's id. Changing this shape breaks the upload.
 */
export function mediaStoragePath(submissionId: string): string {
  return `web/${submissionId}/${randomUUID()}.jpg`;
}
