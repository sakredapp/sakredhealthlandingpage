/**
 * Quote forms on sakredhealth.com are switched OFF (2026-10-22).
 *
 * The site no longer promises insurance quote forms or "licensed insurance
 * guidance" in its public copy, so every quote form and every "Get a quote"
 * button is hidden behind this flag. The form code (GetCoverage,
 * ProductIntakeForm, /api/product-lead) is kept, not deleted: set this to true
 * to bring them all back at once.
 */
export const QUOTE_FORMS_LIVE = false;
