/**
 * End-to-end proof of the three write paths, through the real website UI.
 *
 *   browser form → Turnstile → Vercel route → service-role RPC → queue row
 *
 * Nothing here posts JSON at an endpoint. The point of the exercise is that the
 * form a practitioner actually fills in produces a correct queue row, so every
 * submission is driven by Playwright typing into the real inputs and clicking
 * the real submit button. A test that skips the form proves the API works and
 * proves nothing about the website.
 *
 * Each proof then reads the row back with the service-role key and asserts the
 * values the backend forces — status, source, external_source, ownership. Those
 * are the fields a spoofing attempt would target, so checking "a row appeared"
 * is not enough; the row has to be the right shape.
 *
 * ── Cleanup ──────────────────────────────────────────────────────────
 *
 * Everything created here is tagged with a run marker in its name, and removed
 * at the end — submissions, credential and media children, storage objects.
 * Deletion is scoped to ids this run created and nothing else: it never matches
 * on "test-looking" data, because a real applicant named their practice
 * something unfortunate is not a reason to delete their application.
 *
 * Usage:
 *   npm run test:intake        # requires HEALTH_NETWORK_SUPABASE_SERVICE_ROLE_KEY
 */
/* FIRST — `upload-token.ts` reads SUBMISSION_TOKEN_SECRET at module scope, and
   ES imports are evaluated before any statement in this file's body. Loading
   .env from the body would be too late and every token check would fail with
   "unconfigured". */
import "../scripts/load-env.js";

import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { verifyUploadToken } from "../api/_lib/upload-token.js";
import { readFileSync, existsSync } from "fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const URL_ = process.env.HEALTH_NETWORK_SUPABASE_URL;
const SERVICE = process.env.HEALTH_NETWORK_SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.HEALTH_NETWORK_MEDIA_BUCKET || "network-application-media";

if (!URL_ || !SERVICE) {
  console.error(
    "\nintake-e2e needs HEALTH_NETWORK_SUPABASE_SERVICE_ROLE_KEY to read back what it wrote.\n" +
      "Without it this script could submit but not verify, which is not a proof.\n"
  );
  process.exit(2);
}

const db = createClient(URL_, SERVICE, { auth: { persistSession: false } });

/** Stamped into every record this run creates, so cleanup is exact. */
const RUN = `E2E-${Date.now().toString(36).toUpperCase()}`;

let passed = 0;
const failures = [];
const created = { submissions: [], objects: [] };

function check(name, ok, detail = "") {
  if (ok) { passed++; console.log(`  PASS  ${name}${detail ? `  — ${detail}` : ""}`); }
  else { failures.push(`${name}${detail ? `: ${detail}` : ""}`); console.log(`  FAIL  ${name}  — ${detail}`); }
}

/** The forced fields, asserted together — they are one claim, not four. */
function checkProvenance(label, row, expectedSource) {
  check(`${label} · status = new`, row?.status === "new", `status ${row?.status}`);
  check(`${label} · submission_source = ${expectedSource}`, row?.submission_source === expectedSource, `source ${row?.submission_source}`);
  check(`${label} · external_source = sakred_web`, row?.external_source === "sakred_web", `external ${row?.external_source}`);
  check(`${label} · submitted_by_user_id is null`, row?.submitted_by_user_id === null, `owner ${row?.submitted_by_user_id}`);
  check(`${label} · not published`, row?.published !== true, `published ${row?.published}`);
}

/** Size of the image that goes in, so the test can prove it was re-encoded. */
const FIXTURE_BYTES = existsSync("tests/fixtures/exif-sample.jpg")
  ? readFileSync("tests/fixtures/exif-sample.jpg").byteLength
  : -1;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });

/* ================================================================== *
 * B · Practitioner application
 * ================================================================== */
console.log("\nB · practitioner application → queue");
let applicationId = null;
let uploadToken = null;
let mediaResponse = null;
let applicationPage = null;
{
  const page = await ctx.newPage();
  const posted = page.waitForResponse(
    (r) => r.url().includes("/api/network/practitioner-application") && r.request().method() === "POST",
    { timeout: 60000 }
  );

  /**
   * The media POST is captured here, not in a later block, because that is
   * where it happens: photos are CHOSEN in section 6 before submitting, and the
   * app uploads them immediately afterwards using the token the response
   * carried. An earlier version of this test opened a fresh page for the media
   * proof and looked for a file input that only exists inside this form.
   */
  const mediaPosted = page.waitForResponse(
    (r) => r.url().includes("/api/network/application-media") && r.request().method() === "POST",
    { timeout: 90000 }
  ).catch(() => null);

  await page.goto(`${BASE}/for-practitioners`, { waitUntil: "networkidle" });
  await submitPractitionerForm(page);

  const response = await posted;
  const payload = await response.json().catch(() => ({}));
  check("form POST accepted", response.status() === 200 && payload.ok === true, `HTTP ${response.status()} ${JSON.stringify(payload).slice(0, 160)}`);

  /**
   * The route does NOT return the submission id to the browser, deliberately —
   * a queue row id in a public response is something to probe with. What comes
   * back is an upload token HMAC-scoped to that id.
   *
   * So the id is recovered two independent ways, and they must agree:
   *   · by querying the queue for this run's marker (service role)
   *   · by verifying the upload token with the same secret the server used
   *
   * Getting the same uuid from both proves the token is scoped to the row the
   * form actually created — which is the property the media step depends on.
   * An earlier draft of this test read `payload.submissionId` and would have
   * failed here; exposing the id to satisfy it would have weakened the design.
   */
  const found = await rowsCarryingMarker("practitioner");
  check("exactly one practitioner row carries this run's marker", found.length === 1, `${found.length} row(s)`);
  applicationId = found[0]?.id ?? null;
  check("queue row has a uuid", isUuid(applicationId), String(applicationId));

  uploadToken = payload.uploadToken ?? null;
  const scoped = uploadToken ? verifyUploadToken(uploadToken) : { ok: false };
  check("upload token is valid", scoped.ok === true, scoped.reason ?? "");
  check(
    "upload token is scoped to that exact row",
    scoped.submissionId === applicationId,
    `token → ${scoped.submissionId}`
  );

  if (isUuid(applicationId)) {
    created.submissions.push(applicationId);
    const { data: row } = await db.from("health_network_submissions").select("*").eq("id", applicationId).maybeSingle();
    check("queue row exists", Boolean(row), row ? "" : "no row for that id");
    checkProvenance("application", row, "practitioner");

    check("practitioner name stored", row?.practitioner_name?.includes(RUN), row?.practitioner_name ?? "(null)");
    check("consent recorded", Boolean(row?.consent_at) || row?.consent === true, `consent_at ${row?.consent_at}`);

    /* The rule stated at both ends: applicant copy is research input and never
       becomes Sakred's editorial voice. */
    check(
      "alignment_statement did NOT become why_sakred_recommends",
      !row?.why_sakred_recommends,
      `why_sakred_recommends ${row?.why_sakred_recommends ?? "null"}`
    );
    check("alignment_statement stored", Boolean(row?.alignment_statement), row?.alignment_statement?.slice(0, 40) ?? "(null)");

    const { data: creds } = await db.from("health_submission_credentials").select("*").eq("submission_id", applicationId);
    check("credential child rows created", (creds?.length ?? 0) > 0, `${creds?.length ?? 0} credential row(s)`);
  }
  mediaResponse = await mediaPosted;
  applicationPage = page;
}

/* ================================================================== *
 * C · Public recommendation
 * ================================================================== */
console.log("\nC · public recommendation → queue");
{
  const page = await ctx.newPage();
  const posted = page.waitForResponse(
    (r) => r.url().includes("/api/network/recommend") && r.request().method() === "POST",
    { timeout: 60000 }
  );

  await page.goto(`${BASE}/recommend`, { waitUntil: "networkidle" });
  await submitRecommendForm(page);

  const response = await posted;
  const payload = await response.json().catch(() => ({}));
  check("form POST accepted", response.status() === 200 && payload.ok === true, `HTTP ${response.status()} ${JSON.stringify(payload).slice(0, 160)}`);

  /* Same as the application: the route returns no id. Find it by marker. */
  const recFound = await rowsCarryingMarker("public");
  check("exactly one public row carries this run's marker", recFound.length === 1, `${recFound.length} row(s)`);
  const id = recFound[0]?.id ?? null;

  if (isUuid(id)) {
    created.submissions.push(id);
    const { data: row } = await db.from("health_network_submissions").select("*").eq("id", id).maybeSingle();
    check("queue row exists", Boolean(row), row ? "" : "no row");
    checkProvenance("recommendation", row, "public");

    /* A tip is a tip. It must not have produced a provider anybody can find. */
    const { count: locs } = await db
      .from("health_locations")
      .select("id", { count: "exact", head: true })
      .ilike("name", `%${RUN}%`);
    check("no canonical location created", (locs ?? 0) === 0, `${locs ?? 0} matching location(s)`);

    const { count: pracs } = await db
      .from("health_practitioners")
      .select("id", { count: "exact", head: true })
      .ilike("display_name", `%${RUN}%`);
    check("no canonical practitioner created", (pracs ?? 0) === 0, `${pracs ?? 0} matching practitioner(s)`);
  } else {
    check("RPC returned a submission uuid", false, String(id));
  }
  await page.close();
}

/* ================================================================== *
 * D · Application media → private storage
 * ================================================================== */
console.log("\nD · application media → private bucket");
if (isUuid(applicationId)) {
  check("the form uploaded a photo", Boolean(mediaResponse), mediaResponse ? "" : "no POST to /api/network/application-media");

  if (mediaResponse) {
    const payload = await mediaResponse.json().catch(() => ({}));
    check("media POST accepted", mediaResponse.status() === 200 && payload.ok === true, `HTTP ${mediaResponse.status()} ${JSON.stringify(payload).slice(0, 120)}`);

    const path = payload.path;
    check(
      "storage path is web/<submission_id>/…",
      typeof path === "string" && path.startsWith(`web/${applicationId}/`),
      String(path)
    );

    if (typeof path === "string") {
      created.objects.push(path);

      const { data: media } = await db
        .from("health_submission_media")
        .select("*")
        .eq("submission_id", applicationId);
      const row = media?.find((m) => m.storage_path === path);
      check("media row created", Boolean(row), row ? "" : "no row for that path");
      check("media approved = false", row?.approved === false, `approved ${row?.approved}`);
      check("media uploaded_by is null", row?.uploaded_by === null, `uploaded_by ${row?.uploaded_by}`);

      /* The bucket is private. A public URL must not resolve — if it does, an
         applicant's headshot is on the open internet. */
      const { data: pub } = db.storage.from(BUCKET).getPublicUrl(path);
      const anonymous = await fetch(pub.publicUrl);
      check("public URL is denied", !anonymous.ok, `HTTP ${anonymous.status}`);

      /**
       * Read with sharp rather than grepped for: EXIF tags are binary numeric
       * ids, so searching the bytes for the string "GPSLatitude" passes on a
       * file that is full of GPS data. The fixture is 1200x900 with orientation
       * 6 and a GPS IFD; a correct pipeline stores it 900x1200 with no EXIF at
       * all. Wrong dimensions mean `.rotate()` did not run before the metadata
       * was discarded, and every phone upload would arrive sideways.
       */
      const { data: blob } = await db.storage.from(BUCKET).download(path);
      if (blob) {
        const bytes = Buffer.from(await blob.arrayBuffer());
        const meta = await sharp(bytes).metadata();
        check("stored format is JPEG", meta.format === "jpeg", String(meta.format));
        check("EXIF stripped", !meta.exif, meta.exif ? `${meta.exif.byteLength} bytes survived` : "");
        check("ICC / IPTC / XMP stripped", !meta.icc && !meta.iptc && !meta.xmp, "");
        check(
          "EXIF orientation applied before it was stripped",
          meta.width === 900 && meta.height === 1200,
          `${meta.width}x${meta.height} (expected 900x1200 from a rotated 1200x900)`
        );
        check(
          "longest edge within the 1600px ceiling",
          Math.max(meta.width, meta.height) <= 1600,
          `longest edge ${Math.max(meta.width, meta.height)}px`
        );
        check(
          "re-encoded, not stored as uploaded",
          bytes.byteLength !== FIXTURE_BYTES,
          `${bytes.byteLength} out vs ${FIXTURE_BYTES} in`
        );
      } else {
        check("stored object is downloadable with the service role", false, "download returned nothing");
      }
    }
  }
} else {
  check("media proof ran", false, "skipped — no application id from proof B");
}

if (applicationPage) await applicationPage.close();

await browser.close();

/* ================================================================== *
 * Cleanup — only what this run created
 * ================================================================== */
console.log("\ncleanup");
{
  for (const path of created.objects) {
    const { error } = await db.storage.from(BUCKET).remove([path]);
    console.log(`  ${error ? "FAILED" : "removed"} object  ${path}${error ? ` (${error.message})` : ""}`);
  }

  for (const id of created.submissions) {
    // Children first where they are not cascaded; a failure here is reported,
    // never swallowed, because a half-deleted test row is worse than none.
    for (const table of ["health_submission_media", "health_submission_credentials"]) {
      const { error } = await db.from(table).delete().eq("submission_id", id);
      if (error) console.log(`  FAILED ${table} for ${id}: ${error.message}`);
    }
    const { error } = await db.from("health_network_submissions").delete().eq("id", id);
    console.log(`  ${error ? "FAILED" : "removed"} submission ${id}${error ? ` (${error.message})` : ""}`);
  }

  // Prove the cleanup: nothing carrying this run's marker may survive.
  const residue = [
    ...(await rowsCarryingMarker("practitioner")),
    ...(await rowsCarryingMarker("public")),
  ];
  check("no submission rows left behind", residue.length === 0, `${residue.length} row(s) still matching ${RUN}`);

  for (const id of created.submissions) {
    for (const table of ["health_submission_media", "health_submission_credentials"]) {
      const { count } = await db
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq("submission_id", id);
      check(`no ${table} left for ${id.slice(0, 8)}`, (count ?? 0) === 0, `${count ?? 0} row(s)`);
    }
  }

  /**
   * Deletion is checked against the object LISTING, not a download.
   *
   * `download()` immediately after a remove can still return bytes from
   * Supabase's CDN — verified: the listing was empty at every prefix while the
   * download returned the full 3533-byte file, and a raw request a minute later
   * returned 400 for the same path. The listing is the metadata store and is
   * immediately consistent; the cached copy is a read artefact, sits behind a
   * private bucket, and is unreachable without credentials (the public URL
   * check above returns 400 either way).
   *
   * Asserting on the download was a race, not a stricter test.
   */
  for (const path of created.objects) {
    const prefix = path.slice(0, path.lastIndexOf("/"));
    const file = path.slice(path.lastIndexOf("/") + 1);
    const { data: listed } = await db.storage.from(BUCKET).list(prefix, { limit: 100 });
    const present = (listed ?? []).some((o) => o.name === file);
    check(`storage object removed · ${file.slice(0, 20)}…`, !present, present ? "still listed in the bucket" : "");
  }

  const { data: strays } = await db.storage.from(BUCKET).list("web", { limit: 100 });
  check("no web/ prefixes left in the bucket", (strays ?? []).length === 0, `${(strays ?? []).length} remaining`);
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log("\nfailures:");
  failures.forEach((f) => console.log("  · " + f));
  process.exit(1);
}

/* ================================================================== *
 * Form drivers
 * ================================================================== */

/**
 * Rows of a given provenance carrying this run's marker.
 *
 * Scans the whole row rather than filtering on a named column: the marker is
 * written into whichever free-text field the form offers, and hard-coding
 * `practitioner_name` or `name` here would make the test fail for a schema
 * reason that has nothing to do with what it is proving. A handful of recent
 * rows is cheap to fetch and unambiguous to search.
 */
async function rowsCarryingMarker(source) {
  const { data, error } = await db
    .from("health_network_submissions")
    .select("*")
    .eq("submission_source", source)
    /* `submitted_at`, not `created_at` — the latter does not exist on this
       table, and assuming it made the first real run report zero rows for
       submissions that had in fact been written. */
    .order("submitted_at", { ascending: false })
    .limit(25);

  if (error) {
    console.log(`  (queue read failed: ${error.message})`);
    return [];
  }
  return (data ?? []).filter((row) => JSON.stringify(row).includes(RUN));
}

function isUuid(v) {
  return typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

/**
 * Fills whichever of these fields is currently on screen.
 *
 * The application form is an ACCORDION, not a wizard — one section open at a
 * time, the rest rendered but hidden. So fields are filled section by section
 * as each is opened. An earlier version of this driver filled everything
 * upfront and hung on the first field of section 2; a later one looked for a
 * "Continue" button that does not exist. Both were the same mistake: guessing
 * at the form instead of reading it.
 */
async function fillVisible(page, values) {
  for (const [id, value] of Object.entries(values)) {
    const el = page.locator(`#${id}`);
    if (!(await el.count())) continue;
    if (!(await el.isVisible().catch(() => false))) continue;
    if (await el.inputValue().catch(() => "")) continue;
    await el.fill(value).catch(() => {});
  }
}

/** Opens an accordion section by its numbered header. */
async function openSection(page, n) {
  const header = page.getByRole("button", { name: new RegExp(`^0${n}`) }).first();
  if (!(await header.count())) return false;
  if ((await header.getAttribute("aria-expanded")) !== "true") {
    await header.click();
    await page.waitForTimeout(250);
  }
  return true;
}

/**
 * Drives the practitioner application.
 *
 * `canSubmit` needs only a name, an email and consent — but this fills every
 * section, because a proof that the minimum viable payload reaches the queue
 * says nothing about whether the practice address, the bio or the credentials
 * do. The credential rows in particular are a transactional child insert the
 * contract promises, and the only way to test that is to submit one.
 */
async function submitPractitionerForm(page) {
  const fields = {
    "pa-name": `${RUN} Testcase`,
    "pa-title": "Licensed Acupuncturist",
    "pa-designations": "L.Ac., DAOM",
    "pa-email": `${RUN.toLowerCase()}@example.invalid`,
    "pa-phone": "555-0100",
    "pa-web": "https://example.invalid/me",
    "pa-practice": `${RUN} Practice`,
    "pa-address": "1 Test Street",
    "pa-city": "Miami",
    "pa-region": "FL",
    "pa-postal": "33101",
    "pa-pphone": "555-0101",
    "pa-pweb": "https://example.invalid",
    "pa-booking": "https://example.invalid/book",
    "pa-other": "Panchakarma",
    "pa-bio": `Automated contract check ${RUN}.`,
    "pa-why": `Alignment statement for ${RUN}. Must never appear as why_sakred_recommends.`,
    "pa-approach": `Approach statement for ${RUN}.`,
  };

  // 1 · about you — plus the submitter role
  await openSection(page, 1);
  await fillVisible(page, fields);
  const role = page.getByRole("button", { name: /^I'm the practitioner$/i }).first();
  if (await role.count()) await role.click().catch(() => {});

  // 2 · the practice
  await openSection(page, 2);
  await fillVisible(page, fields);

  // 3 · modalities — canonical slugs only, chosen from the live vocabulary
  await openSection(page, 3);
  await fillVisible(page, fields);
  for (const name of [/^Acupuncture$/i, /Chinese Herbal/i]) {
    const chip = page.getByRole("button", { name }).first();
    if ((await chip.count()) && (await chip.getAttribute("aria-pressed")) !== "true") {
      await chip.click().catch(() => {});
    }
  }

  // 4 · credentials — one real row, so the child insert is exercised
  await openSection(page, 4);
  const addCredential = page.getByRole("button", { name: /add another credential/i }).first();
  if ((await addCredential.count()) && !(await page.locator("#cred-type-0").count())) {
    await addCredential.click();
    await page.waitForTimeout(200);
  }
  await fillVisible(page, {
    "cred-type-0": "L.Ac.",
    "cred-num-0": `${RUN}-LIC`,
    "cred-region-0": "FL",
    "cred-board-0": "Florida Board of Acupuncture",
    "cred-url-0": "https://example.invalid/verify",
  });

  // 5 · about your work
  await openSection(page, 5);
  await fillVisible(page, fields);

  /* 6 · photos — chosen here, uploaded by the app after the queue returns a
     token. The fixture carries a real GPS IFD and orientation 6, because that
     is the case the server-side re-encode exists for. */
  await openSection(page, 6);
  const file = page.locator('input[type="file"]').first();
  if (await file.count()) {
    await file.setInputFiles({
      name: "treatment-room.jpg",
      mimeType: "image/jpeg",
      buffer: exifJpeg(),
    });
    await page.waitForTimeout(300);
  }

  // 7 · consent — required, and deliberately the applicant's real answer
  await openSection(page, 7);
  const consent = page.locator('input[type="checkbox"]').filter({ visible: true }).first();
  if (await consent.count()) await consent.check().catch(() => {});

  const submit = page.getByRole("button", { name: /request consideration/i }).first();
  await submit.waitFor({ state: "visible", timeout: 10000 });
  if (!(await submit.isEnabled())) {
    throw new Error("submit is disabled — name, email or consent did not take");
  }
  await submit.click();
}

/** Drives /recommend. One page, one submit, name is the only requirement. */
async function submitRecommendForm(page) {
  await fillVisible(page, {
    "rec-name": `${RUN} Recommended Practice`,
    "rec-city": "Naples",
    "rec-link": "https://example.invalid",
    "rec-reason": `Automated integration check ${RUN}.`,
    "rec-email": `${RUN.toLowerCase()}@example.invalid`,
  });

  const submit = page.getByRole("button", { name: /send recommendation/i }).first();
  await submit.waitFor({ state: "visible", timeout: 10000 });
  await submit.click();
}

/** A JPEG with a real EXIF APP1 segment carrying a GPS IFD and orientation 6. */
function exifJpeg() {
  const path = "tests/fixtures/exif-sample.jpg";
  if (existsSync(path)) return readFileSync(path);
  throw new Error(`missing fixture ${path} — run scripts/make-exif-fixture.mjs`);
}
