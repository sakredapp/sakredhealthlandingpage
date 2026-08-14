# Archive audit — legacy landing components

**Status: AUDIT ONLY. Nothing has been deleted.**

The V2 rebuild replaced the homepage, `/app`, `/products` and `/blog`, which
left 26 components in `client/src/components/landing/` and one unrouted page
(`client/src/pages/Routines.tsx`) with no importer.

They cost nothing at runtime — nothing imports them, so nothing bundles them —
but they should not be deleted until the salvageable content below has been
either migrated or consciously dropped. Deletion belongs in its own commit,
separate from network integration.

---

## 1. Genuine functional regressions — RESOLVED

These two were doing real work on the old site and had **no equivalent in V2**.
Both have now been decided.

| Component | Endpoint | Decision |
|---|---|---|
| `NewsletterSignup` | `POST /api/newsletter/subscribe` | **Restored, relocated.** Replaced by `components/site/NewsletterBand.tsx` at the bottom of `/resources` and the blog index. Not in a hero: the homepage's job is Discover and the practitioner funnel, and an email field competing with those costs more than the list is worth. The old component is now genuinely superseded and can go with §3. |
| `DemoVideoShowcase` | `GET /api/demo-videos`, `POST /api/video-analytics/:id` | **Stays retired.** The footage advertises the protocol/habit product Sakred Health used to be, not the network. Restoring it because the component still exists would put the pre-pivot product back on the site. Revisit only with current Discover / Protocols / Community footage. |

The `demo-videos` and `video-analytics` API routes are now knowingly uncalled.
Leave them for now — deleting an endpoint is a separate decision from deleting a
component, and nothing depends on their absence.

## 2. Copy worth reading before it goes

| Component | Contains |
|---|---|
| `FAQ` | 10 insurance Q&As — objection handling written for real leads. V2's only FAQ is the four app questions on `/app`. |
| `AppFAQ` | 8 app questions. Partly superseded by the new `/app` FAQ, but not all of it. |
| `WhoWeHelp` (180 lines) | Audience segmentation copy — who each product is for. Nothing in V2 replaces this. |
| `HowGettingCoveredWorks` | The step-by-step of the insurance buying process. `/get-coverage` covers some of it. |
| `InsuranceFeatures`, `ProblemSection`, `LifeTransformation` | Positioning copy for the insurance pillar. |
| `CarrierPartners` | "Licensed in 50 states" trust bar. Carries no carrier names — the trust claims are generic and are already made on `/products`. |
| `ParasiteCleanse`, `WellnessRoutines`, `ProtocolsSection`, `TerrainTranslator` | Old protocol-era product copy. **Superseded by the pivot** — this is the "detox-first" material V2 deliberately moved away from. Safe to drop. |
| `Routines.tsx` (806 lines) | A full unrouted routines catalogue from the protocol era. Not linked from anywhere, not in the sitemap, not in the router. Superseded. |

## 3. Safe to delete once §1 and §2 are settled

`AppCTA`, `AppHero`, `AppPricing`, `AppShowcase`, `FamilyBand`, `FeaturesGrid`,
`FinalCTA`, `Hero`, `HowItWorks`, `Pricing`, `ProductsOverview`, `Testimonials`
— all superseded by V2 equivalents, no unique copy, no API calls, no assets that
aren't referenced elsewhere.

Also then removable: `client/src/components/landing/Navigation.tsx` and
`Footer.tsx` (replaced by `components/site/SiteHeader` / `SiteFooter`). Note the
old `Footer` still contains outdated positioning copy including a Medicare
reference, which is another reason not to leave it lying around where someone
might reuse it.

## 4. What is NOT orphaned — do not touch

Still imported and load-bearing: `DownloadDialog`, `CoverageCalculator`,
`MortgageCalculator`, `ProductIntakeForm`, `ProductDemos`, `TextUsSection`,
`ObjectUploader`, `BlogDataBlocks`.

---

## Suggested sequence

1. Decide on the newsletter and demo-video regressions (§1).
2. Harvest any FAQ / audience copy worth keeping into the live pages (§2).
3. Delete §3 + anything settled from §2, **in its own commit**, message along the
   lines of `chore: remove landing components superseded by the V2 rebuild`.
