# Health Network — what the website needs from the app backend

**Owner: the Sakred Health app team. Nothing in this document is applied from
this repo, and this repo has no migration path into the app's database.**

The website is the second consumer of the Health Network schema. This is what it
depends on and how it uses it.

**As of 2026-08-14 there are no outstanding blockers.** Every read and write the
website makes goes through a canonical function that exists in production. What
remains below marked as a request is an improvement, not a dependency —
`timezone` on the search result, token-aware `p_query`, and
`health_modalities.short_name`. Each has a working website-side answer today,
noted in place.

Sections describing how things worked before a cutover are folded into
`<details>` blocks marked *Historical*. If a statement is not in one of those,
it describes production now.

Everything requested here is **additive**. Nothing asks for an existing table to
be restructured, an existing function to change signature, or RLS to be relaxed.

---

## 0 · Environment the website is configured with

```
HEALTH_NETWORK_SUPABASE_URL               the app's project
HEALTH_NETWORK_SUPABASE_ANON_KEY          public directory reads — RLS applies
HEALTH_NETWORK_SUPABASE_SERVICE_ROLE_KEY  intake + media only, server-side
```

The service-role key is present locally only for the duration of the write-path
proof (`npm run test:intake`) and is removed afterwards. It is never needed to
run, build or prerender the site — those are anon reads.

The split matters. Previously one ambiguous `HEALTH_NETWORK_SUPABASE_KEY` was
used for everything, which meant that whatever privilege it held, the public
directory inherited it — one forgotten `.eq("published", true)` away from
serving the whole table. Reads now run as `anon` so RLS is a real second layer,
and the service role is reachable only from the two intake routes.

Neither key is exposed to the browser. `api/_lib/network-clients.ts` is the only
file that constructs a client, and it refuses to build a read client out of a
key whose JWT payload says `service_role`.

---

## 1 · Read contract — live, and the only implementation

| Object | Used by | Notes |
|---|---|---|
| `search_health_locations(...)` | `/discover`, homepage map, "search this area" | Used for proximity **and** viewport search, so both surfaces rank identically |
| `get_health_location_detail(uuid)` | `/locations/[slug]` | Preferred over assembling the page from tables |
| `health_organizations` / `health_locations` / `health_practitioners` | slug resolution, sitemap, prerender | Direct reads, gated |
| `health_modalities`, `health_*_modalities` | filters, `/discover/[modality]` | |
| `health_location_hours` | opening hours | **Normalised.** Not a jsonb schedule on the location |
| `health_links` | website / booking links | **Normalised.** Not columns on the location |

### PINNED against production, 2026-08-13

Read off `lzoyzrsgjjhffuzgnglu` with the anon key. All guessed aliases have been
deleted from the reader. Confirmed shapes:

```
health_location_hours   location_id, day_of_week (0-6), open_time, close_time,
                        is_closed          ← closed days are rows, not gaps
health_links            organization_id, location_id, practitioner_id,
                        link_type, label, url, sort_order, published
health_modalities       slug, name, description, icon_key, category_group,
                        sort_order, active            (22 rows, all active)
health_location_modalities   location_id, modality_id, is_primary
health_practitioner_locations  practitioner_id, location_id, is_primary,
                               booking_url_override

get_health_location_detail(p_location_id uuid)
  → { hours, links, is_saved, location, modalities, organization,
      practitioners, verifications }
    location carries latitude/longitude/is_open_now/is_seed — the flat table
    does NOT (coordinates are PostGIS `location` only)

health_location_is_open_now(p_location_id uuid) → boolean
```

### Corrections the website had to make

The reader had assumed a different schema throughout. For the record:

| assumed | actual |
|---|---|
| `verification` | `verification_level` |
| `lat` / `lng` columns | PostGIS `location`; lat/lng only via RPC |
| `address_line1` | `address_line_1` |
| `country` | `country_code` |
| `offers_same_day` | `same_day_available` |
| `photos` jsonb array | `primary_image_url`, one nullable string |
| `about` | `short_description` / `good_for` / `cautions` |
| `sakred_note` | `why_sakred_recommends` |
| practitioner `name` | `display_name` |
| modality `category` | `category_group` |

### `search_health_locations` — ✅ SIGNATURE RECEIVED, website cut over 2026-08-14

15 arguments, one overload, SECURITY INVOKER, STABLE, anon-executable, 21
columns out. Verified against production before the cutover, not taken on trust:

```
p_min_lat p_min_lng p_max_lat p_max_lng      viewport
p_center_lat p_center_lng p_radius_meters    origin + radius
p_modality_slugs text[]                      matches ANY (acu=10, fm=9, both=13)
p_verification_levels text[]                 unknown values return 0, no error
p_open_now p_walk_ins p_same_day boolean
p_query text                                 single ILIKE substring
p_include_seed boolean default false
p_limit integer                              clamps 1..500 (0 → 1 confirmed)
```

**The temporary path is deleted, not disabled.** Fetch-all, the in-memory
filters and the website Haversine are gone; there is exactly one search
implementation and one call site. `distance_meters` now comes from PostGIS, and
is NULL without an origin — which the website renders as "no distance" rather
than zero.

Verified live after the cutover: Miami 4, Naples 4, Boca 3, Palm Beach Gardens
4, Scottsdale 2, **Austin 0** (19 with `p_include_seed: true`).

#### Four things the probe turned up

1. **`accepts_walk_ins` and `same_day_available` are NULL on all 14 records.**
   The SQL filters work; there is nothing to match. `p_walk_ins: true` and
   `p_same_day: true` both return 0 rows.

   **Decision for V2 launch: the two chips are hidden, the capability is kept.**
   A control that always empties the map reads as "no practice near you takes
   walk-ins" when the truth is "nobody has been asked yet". The filter state,
   the URL parameters and the RPC arguments all still work — only the controls
   are withheld, behind `AVAILABILITY_FILTERS_ENABLED` in
   `client/src/components/health/DiscoverFilters.tsx`. Flip it to `true` when
   curation starts collecting those facts.

   Do **not** populate the columns artificially to make the controls work.

2. **`p_query` is a single substring match, not tokenised** — REQUEST FOR THE
   BACKEND. `"acupuncture naples"` returns 0, so a typed term and a city cannot
   share the argument; the `/discover/:modality/:city` route sends the city as
   the query only when nothing has been typed.

   ```
   current   one literal-ish substring expression
   wanted    token-aware search where multiple terms match across
             the relevant fields (name, organisation, city, modality,
             short_description)
   ```

   **The website is deliberately not doing this.** Tokenising above the
   canonical search layer would start rebuilding the query semantics this whole
   pass existed to remove, and would guarantee that the app and the website
   disagree about what a two-word search means. A `p_city` argument would also
   solve the narrow case cleanly.

3. **`%` was not escaped in `p_query`** — ✅ FIXED website-side 2026-08-14, no
   SQL change. Typing a single `%` returned the whole network and `_` matched
   any character. Never a security issue — the call is parameterised and
   `' OR 1=1--` returns 0 rows with no error — but literal user text should not
   become pattern syntax.

   The website now escapes `\`, `%` and `_` at the argument boundary. Verified
   against production that ordinary searches are untouched:

   ```
   "%"            14 → 0        "acupuncture"   10 → 10
   "_"            14 → 0        "naples"         4 → 4
   "a%"           14 → 0        "' OR 1=1--"     0 → 0
   ```

   This is a boundary fix, not a search implementation. If the canonical
   function ever escapes its own input, the website's pass becomes a harmless
   no-op for ordinary text and can be removed.

4. **No `timezone` among the 21 columns.** Hours are wall-clock with no offset,
   so the website reads `health_locations.timezone` separately to label open
   state. Without it every Florida practice was judged against the server's UTC
   clock — four hours ahead of its own front door. `America/Phoenix` is in the
   data too, which is why this must stay a timezone and never become an offset.
   Adding `timezone` to the search result would remove one round trip.

### One behaviour the website deliberately overrides

`health_location_is_open_now` returns `false` for a location with **no published
hours** — it cannot distinguish "shut right now" from "nobody told us the
hours". Two real records are in that state (Naples Center for Functional
Medicine, Eastern Medicine Center).

The website maps that to `null` (unknown) whenever the hours list is empty, and
renders nothing rather than "Closed". Putting "Closed" on the page of a practice
that is very likely open is worse for the practice than silence.

If the app would rather return `null` in that case, the website will use it
directly.

---

## 1b · `slug` — ✅ SHIPPED 2026-08-13, website cut over

`health_locations.slug` and `health_practitioners.slug` landed during this
integration pass. The website now resolves every provider URL with an indexed
`.eq("slug", …)` and derivation is off the resolution path.

**15 of 31 canonical slugs differed from the website's temporary derivation** —
the canonical convention strips professional post-nominals (`andrew-agoado`, not
`andrew-agoado-ap-dom`). Nothing had been indexed under the derived values, so
this cost nothing. Full comparison: `docs/slug-cutover-audit.md`.

### Small addition: `health_modalities.short_name`

Compact provider cards summarise as "Acupuncture · Traditional Chinese Medicine
+2". With a canonical short name that becomes "Acupuncture · TCM +2", which
fits without truncating.

The website will NOT invent abbreviations — deriving "TCM" from the slug would
produce "CHINESE-HERBAL" for the next one. If `short_name` is added,
`modalitySummary` in `shared/health-network.ts` already prefers it.

### ✅ Consumer DTOs now carry slugs — joins deleted 2026-08-14

`search_health_locations` returns `location_slug` + `organization_slug`;
`get_health_location_detail` returns `location.slug` and
`practitioners[].slug`. The website's two id→slug lookup maps
(`locationSlugById`, `practitionerSlugById`) are gone — two fewer round trips
per request.

### ✅ By-slug read RPCs adopted

`get_health_location_by_slug(p_slug)` and
`get_health_practitioner_by_slug(p_slug)` are now the primary detail reads.
Each resolves the slug, follows alias history, enforces published/non-seed
itself, and returns the whole payload in one round trip. Verified against
production: a seed slug returns null, and unpublished rows are invisible to
`anon`.

Both return `redirect` and `canonical_slug`, and the website acts on them at the
HTTP level: a retired slug answers **308** to the canonical URL rather than
rendering a second copy of the page. An unknown slug answers **404** — it used
to answer 200 with the app shell, which told crawlers that every mistyped
provider URL was a real page. The client-side URL replace remains only for
in-app navigation, where no request is made and so no redirect can happen.

**The old two-step is deleted, not retained as a fallback** (2026-08-14). So is
the flat-table assembly path it fell through to — `assembleLocation` and the
five join-rebuilding helpers that existed only to serve it. That path was a
second reader for the same records, reassembling the app's business logic out of
joins, and it would have run only when the canonical RPC broke: a code path
nobody had exercised in months, quietly serving pages instead of reporting the
regression. `get_health_location_by_slug` missing now means provider pages 404,
which is the correct and visible failure.

<details>
<summary>Historical: the interim derivation (now dead code)</summary>

`health_organizations` has `slug`. `health_locations` and `health_practitioners`
do not, so there is no canonical way to address a provider page.

The website currently **derives** one — `deriveLocationSlug(name, city)` in
`shared/health-network.ts` — reproducing the convention the org slugs already
follow. Verified unique across all 14 locations and 17 practitioners:

```
shin-wellness-miami
naples-center-for-functional-medicine
south-florida-acupuncture-associates-palm-beach-gardens
eastern-medicine-center-scottsdale
emily-rowe · jing-liu-lac-omd-phd · …
```

This is the weaker option and should be temporary:

- a practice renaming itself **silently changes its own indexed URL**
- slug resolution is a table scan, because there is no column to filter on
- the website is making a naming decision the canonical database should own

Please add `slug` to both tables, populated to match the values above so no
indexed URL moves. The reader already prefers a real `slug` column the moment
one exists — `row.slug ?? derive…` — so it is a zero-downtime swap.

</details>

### What the website enforces on top

Every public read filters `published = true AND is_seed = false` in its own SQL,
**and** the search RPC is abandoned in favour of the bounding-box path if its
rows don't carry the seed flag — a row we can't inspect is a row we can't clear.
If the seed column can't be found at all, production refuses to serve the
directory. That is deliberate: an empty map with an honest message is
recoverable, a fictional practitioner with a real-looking address is not.

---

## 2 · `submission_source` — ✅ SHIPPED, `public` is live

The live enum:

```
member | public | admin | practitioner | bulk_import | research
```

`public` is in it and both website sources file correctly:

```
practitioner applying for themselves →  submission_source = practitioner
visitor recommending somebody        →  submission_source = public
both                                 →  external_source   = sakred_web
```

`source` is who is vouching; `external_source` is the channel it arrived
through. Keeping them separate is what lets the queue tell "a practitioner
applied through the website" from "a stranger typed a name into a form".

<details>
<summary>Historical: why <code>public</code> was needed rather than reusing <code>member</code></summary>

There was never a `member_recommendation` value. An earlier version of the
website intake used that string and would have failed on first contact with
production — a `22P02` on every `/recommend` submission.

Reusing `member` was the other tempting shortcut. `member` means an
authenticated Sakred member vouched for someone; a website visitor is anonymous.
Filing the second as the first would have inflated the trust signal on exactly
the rows that deserve it least, and the person triaging the queue would have had
no way to tell them apart. A one-line enum migration was cheaper than
permanently corrupting the only provenance signal the queue has.

</details>

### Resulting admin badges

| `submission_source` | Badge |
|---|---|
| `member` | MEMBER RECOMMENDED |
| `public` | WEB RECOMMENDED |
| `practitioner` | PRACTITIONER SUBMITTED |
| `research` | SAKRED RESEARCH |
| `bulk_import` | BULK IMPORT |
| `admin` | ADMIN CREATED |

Until this is applied, `/recommend` **refuses submissions** with a 503 and logs
loudly. It does not silently file them under another source. See
`logSourceUnmigrated()` in `api/_lib/network-intake.ts`.

---

## 3 · Service-only intake RPCs — ✅ ALL THREE LIVE, website cut over 2026-08-14

### Why not the existing mobile RPC

`submit_practitioner_application` binds the row to `auth.uid()`. A website
applicant is frequently not a Sakred account holder, so calling it under the
service role would either fail or write a row whose ownership is a fiction. The
website needs its own entry points that force `submitted_by_user_id = null`.

These must be **service-only**: `REVOKE` from `anon` and `authenticated`,
`GRANT` to `service_role`. There is no browser-callable SECURITY DEFINER
function anywhere in this design — the browser talks to a Vercel route, and the
route talks to Postgres.

### 3.1 `submit_public_practitioner_application` — live

Called by `POST /api/network/practitioner-application` after Turnstile, rate
limiting, a payload cap, a honeypot and zod validation have all passed. Returns
the submission uuid, which the website needs to key media uploads to.

The live signature — the website's earlier guesses are corrected against it:

```
p_submitter_role          p_practitioner_name      (was p_full_name)
p_professional_title      p_contact_email
p_contact_phone           p_professional_bio
p_practice_name           p_practice_website       (was p_website)
p_booking_url             p_practice_phone
p_address_text            p_city
p_region                  p_postal_code
p_modality_ids uuid[]     (was p_modality_slugs — the website now resolves
                           slugs against the canonical vocabulary and sends ids)
p_alignment_statement     p_approach_statement
p_social_links jsonb      p_credentials jsonb
p_consent boolean         (was p_consent_at — a false consent is rejected, so
                           the website sends the applicant's actual answer
                           rather than a hardcoded true)
p_external_ref
```

Forced by the function: `status = new`, `submission_source = practitioner`,
`external_source = sakred_web`, `submitted_by_user_id = null`. The website never
sends `source`, `status`, `verification`, `published`, matched ids or admin ids.

`alignment_statement` and `approach_statement` are **research input** — the
applicant's own words about themselves. Neither may ever be promoted into
`why_sakred_recommends` or any other field rendered in Sakred's voice. Asserted
at both ends, and asserted again in `tests/intake-e2e.mjs`.

### 3.2 `submit_public_health_recommendation` — live

```
p_subject_type    'practitioner' | 'location'
p_name            p_city            p_region
p_address_text    p_website_url     p_phone
p_practitioner_name
p_modality_ids uuid[]
p_submitter_note
p_external_ref
```

**One gap.** There is no `p_contact_email`. The form offers an optional "your
email, if we may follow up", and a reviewer checking a tip needs the one person
who can confirm it — so the website prefixes it into `p_submitter_note` rather
than discarding it. If `p_contact_email` is added, that prefix comes straight
out.

### 3.3 `attach_public_application_media` — live

Called by `POST /api/network/application-media` **after** the file has been
re-encoded and written to private storage. Three arguments:

```
p_submission_id
p_kind             'headshot' | 'logo' | 'practice'
p_storage_path     'web/<submission_id>/<uuid>.jpg'
```

The website no longer sends bucket, content type, byte size or dimensions — the
function knows its own bucket, and a caller asserting a file's size is making a
claim about an object the database can read for itself.

### There is no fallback any more

The website used to insert into `health_network_submissions` directly when an
RPC was missing, narrowing the column set until Postgres accepted it. That code
is **deleted**.

A raw insert bypasses everything that makes these functions worth having —
forced status, forced provenance, forced null ownership, consent enforcement,
transactional credential rows. And a fallback that only runs when the backend
breaks is a code path nobody has exercised, quietly producing rows that look
fine and are not. If a function goes missing the website now refuses the
submission and logs which one, which is a problem someone finds out about.

The same rule already applied and still does: **if the RPC exists and rejects,
the website does not route around it.** A rejection means a rule fired.

#### Three practitioner-form fields with no parameter

Real inputs a visitor fills in, folded into the nearest field that honestly
holds them rather than dropped:

| form field | goes to | why |
|---|---|---|
| `designations` | appended to `professional_title` | "Licensed Acupuncturist, L.Ac., DAOM" is how practitioners write it anyway |
| `country` | part of `address_text` | a country belongs in an address |
| `otherModality` | appended to `professional_bio`, labelled | a `uuid[]` cannot carry free text, and a reviewer needs to see the modality the vocabulary is missing — that is how the vocabulary grows |

Add `p_designations` / `p_country` / `p_other_modality` and the website will
unpick all three and pass them straight through.

## 4 · Media — uses the app's existing store

No second bucket, no website media table.

```
bucket : network-application-media   (private)
table  : health_submission_media
path   : web/<submission_id>/<uuid>.jpg
```

Because website applicants are unauthenticated, the upload is server-mediated:

1. the application is submitted and the queue returns a row id
2. the server mints a **30-minute HMAC token scoped to that submission id**
   (`api/_lib/upload-token.ts`) and returns it with the response
3. the browser posts each image to `/api/network/application-media` with that
   token — never to storage directly
4. the server decodes it, applies the EXIF orientation flag, **strips all
   metadata**, resizes to ≤1600px on the longest edge, re-encodes as JPEG q82,
   and writes it to the private bucket
5. `attach_public_application_media` records the row, unapproved

Step 4 is the reason the server touches the bytes at all. Practice photos are
usually taken on a phone inside the practice, so the EXIF routinely carries GPS
coordinates and a device serial. A signed direct-upload URL would be less code
and would put both of those in storage.

Caps: 1 headshot, 1 logo, 5 practice photos, 12MB each before re-encoding.

If the attach step fails, the uploaded object is **deleted** — bytes in a
private bucket with no row pointing at them are an orphan nobody audits.

Requires `SUBMISSION_TOKEN_SECRET` on the website. Without it no tokens are
minted, the upload step is not offered, and the form asks for photos by email.

---

## 5 · What the website will never do

- write to any canonical table (`health_organizations`, `health_locations`,
  `health_practitioners`, `health_modalities`, `health_location_hours`,
  `health_links`)
- set `published`, `verification`, `verified_at`, or any status beyond `new`
- create a second submissions table, admin queue, or database
- copy an applicant's `alignment_statement` or `approach_statement` into
  `why_sakred_recommends` or anything else rendered in Sakred's voice
- invent a modality slug
- use a stock photograph to represent a real provider

### Direct-write audit, 2026-08-14

`api/_lib/network-intake.ts` contains **zero `.insert()` calls**. The
progressive-narrowing insert that used to live there is deleted, so the sentence
that used to sit here — "the only `.insert()` calls are in network-intake.ts,
against `health_network_submissions` and `health_submission_media`" — described
an architecture that no longer exists and contradicted the section above it.

Every write the website can perform, and where it goes:

| file · function | target | production path? | purpose |
|---|---|---|---|
| `network-intake.ts` · `submitPractitionerApplication` | RPC `submit_public_practitioner_application` | yes | the only practitioner intake |
| `network-intake.ts` · `submitRecommendation` | RPC `submit_public_health_recommendation` | yes | the only recommendation intake |
| `network-intake.ts` · `attachApplicationMedia` | RPC `attach_public_application_media` | yes | the only media metadata write |
| `application-media.ts` · handler | `storage.from(bucket).upload/remove` | yes | the file bytes themselves, and orphan removal when the attach RPC refuses. Object storage, not a table |
| `_lib/storage.ts` · various | CRM Postgres via Drizzle (`DATABASE_URL`) | yes | blog, testimonials, newsletter, A/B — **a different database** |
| `_lib/supabase.ts` · newsletter/email | Sakred Body Supabase (`SUPABASE_URL`) | yes | **a different project** |
| `admin/seed-blog.ts` | CRM Postgres | admin-authenticated | blog seeding |

**No code path in this repo writes a row to `health_network_submissions`,
`health_submission_media` or `health_submission_credentials` except through the
three RPCs.** Outside those calls, the three table names appear in this repo
only inside comments.

The service-role client is constructed in exactly one place
(`network-clients.ts`) and is consumed by exactly two files: `network-intake.ts`
for the three RPCs, and `application-media.ts` for bucket I/O.
