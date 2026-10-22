/**
 * Quote forms on sakredhealth.com are switched OFF (2026-10-22).
 *
 * The site no longer promises insurance quote forms or "licensed insurance
 * guidance" in its public copy, so every quote form and every "Get a quote"
 * button is hidden behind this flag, AND the two intake routes
 * (/api/product-lead, /api/lead-check) refuse direct posts while it is off.
 * The form code (GetCoverage, ProductIntakeForm, the routes' live handlers) is
 * kept, not deleted: set this to true to bring them all back at once. Turning
 * it back on is a lead-facing change and needs a compliance review: the Terms,
 * Insurance Terms, SMS opt-in and Privacy pages were rewritten for the paused
 * state and must be restored with it.
 *
 * Lives in shared/ so the browser (client/src/lib/quote-forms.ts re-exports
 * it) and the API read the same switch.
 */
export const QUOTE_FORMS_LIVE: boolean = false;

/** The answer every intake route gives while the switch is off. */
export const INTAKE_PAUSED_BODY = {
  error: "We are not taking coverage requests on this site right now.",
  paused: true,
} as const;
