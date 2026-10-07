/**
 * THE REAL-TIME LEAD CHECK (owner GO 2026-10-07), same pattern as
 * familyequityprotection#50 / brand-landers#19. This site holds no key and no
 * copy: it asks the CRM and carries the answer back. Every failure accepts;
 * a soft phone answer never refuses a lead. Synthetic values only.
 *
 *   npx tsx --test tests/lead-check.test.ts
 */
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

process.env.CRM_BASE_URL = "https://crm.example.test";
const { checkEmail, checkPhone } = await import("../api/_lib/lead-check.ts");
const { default: leadCheck } = await import("../api/lead-check.ts");
const { default: productLead } = await import("../api/product-lead.ts");

const realFetch = globalThis.fetch;
type Call = { url: URL; init?: RequestInit };
let calls: Call[] = [];
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
function stubFetch(impl: (url: URL, init?: RequestInit) => Response) {
  globalThis.fetch = (async (input: any, init?: RequestInit) => {
    const url = new URL(String(input));
    calls.push({ url, init });
    return impl(url, init);
  }) as typeof fetch;
}

beforeEach(() => {
  calls = [];
  process.env.CRM_CAMPAIGN_HEALTH_INSURANCE = "synthetic-health";
  process.env.CRM_CAMPAIGN_MORTGAGE_PROTECTION = "synthetic-mp";
  console.warn = () => {};
  console.error = () => {};
});
afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.CRM_CAMPAIGN_FINAL_EXPENSE;
});

function fakeRes() {
  const r: any = { statusCode: 200, body: undefined, headers: {} };
  r.status = (c: number) => ((r.statusCode = c), r);
  r.json = (b: unknown) => ((r.body = b), r);
  r.end = () => r;
  r.setHeader = (k: string, v: string) => ((r.headers[k] = v), r);
  return r;
}
const fakeReq = (query: Record<string, string>, body: unknown, method = "POST") =>
  ({ method, query, body, headers: { "x-forwarded-for": "203.0.113.9, 10.0.0.1" } }) as any;

test("email: asks the CRM's email check for the product's campaign and names the visitor", async () => {
  stubFetch(() => reply({ result: "invalid", message: "Double-check your email" }));
  const r = await checkEmail("mortgage-protection", "gone@example.test", 3500, "203.0.113.9");
  assert.deepEqual(r, { result: "invalid", message: "Double-check your email" });
  assert.equal(calls[0].url.origin, "https://crm.example.test");
  assert.equal(calls[0].url.pathname, "/api/phone-validation");
  assert.equal(calls[0].url.searchParams.get("campaign"), "synthetic-mp");
  assert.equal(calls[0].url.searchParams.get("check"), "email");
  assert.equal((calls[0].init?.headers as Record<string, string>)["x-visitor-ip"], "203.0.113.9");
});

test("email: typo suggestion and disposable copy pass through", async () => {
  stubFetch(() => reply({ result: "typo", message: "Double-check your email", suggestion: "ada@gmail.com" }));
  assert.deepEqual(await checkEmail("health-insurance", "ada@gmial.com"), {
    result: "typo", message: "Double-check your email", suggestion: "ada@gmail.com",
  });
  stubFetch(() => reply({ result: "disposable", message: "Please use your real email" }));
  assert.equal((await checkEmail("health-insurance", "ada@mailinator.com")).message, "Please use your real email");
});

for (const [name, impl] of [
  ["the CRM errors", () => reply({}, 500)],
  ["the CRM is unreachable", () => { throw new TypeError("fetch failed"); }],
  ["the body is junk", () => reply({ nope: true })],
] as const) {
  test(`email + phone accept silently when ${name}`, async () => {
    stubFetch(impl as () => Response);
    assert.deepEqual(await checkEmail("health-insurance", "ada@example.test"), { result: "accepted" });
    assert.equal((await checkPhone("health-insurance", "2025550123")).valid, true);
  });
}

test("unconfigured or unknown product: accepted without a call", async () => {
  stubFetch(() => reply({ result: "invalid", message: "x" }));
  assert.deepEqual(await checkEmail("final-expense", "ada@example.test"), { result: "accepted" });
  assert.deepEqual(await checkEmail("nope", "ada@example.test"), { result: "accepted" });
  assert.equal((await checkPhone("nope", "2025550123")).valid, true);
  assert.equal(calls.length, 0);
});

test("/api/lead-check answers with only what the form shows", async () => {
  stubFetch(() => reply({ result: "invalid", message: "Double-check your email", internal: "x" }));
  const r1 = fakeRes();
  await leadCheck(fakeReq({ product: "health-insurance", check: "email" }, { email: "gone@example.test" }), r1);
  assert.deepEqual(r1.body, { result: "invalid", message: "Double-check your email" });
  assert.equal((calls[0].init?.headers as Record<string, string>)["x-visitor-ip"], "203.0.113.9");

  stubFetch(() => reply({ valid: false, blocking: false, lineType: "unknown", carrier: "x", message: "Double-check your number" }));
  const r2 = fakeRes();
  await leadCheck(fakeReq({ product: "health-insurance", check: "phone" }, { phone: "2025550199" }), r2);
  assert.deepEqual(r2.body, { valid: false, message: "Double-check your number", blocking: false });
});

const leadBody = {
  product: "health-insurance", first_name: "Test", last_name: "Lead", email: "synthetic@example.test",
  phone: "2025550123", state: "FL", sms_consent: true,
};
function crm(phoneAnswer: unknown) {
  const seen = { leads: 0 };
  stubFetch((url) => {
    if (url.pathname === "/api/phone-validation") return reply(phoneAnswer);
    if (url.pathname === "/api/webhooks/leads") { seen.leads++; return reply({ received: true, prospect_id: "p-1" }); }
    return new Response(null, { status: 204 });
  });
  return seen;
}

test("product-lead: a soft 'Double-check your number' never refuses the lead", async () => {
  const seen = crm({ valid: false, blocking: false, lineType: "unknown", message: "Double-check your number" });
  const res = fakeRes();
  await productLead(fakeReq({}, leadBody), res);
  assert.equal(res.statusCode, 200);
  assert.equal(seen.leads, 1);
});

test("product-lead: a soft landline (calls only) is delivered", async () => {
  const seen = crm({ valid: true, blocking: false, lineType: "fixed line", textable: false });
  const res = fakeRes();
  await productLead(fakeReq({}, leadBody), res);
  assert.equal(res.statusCode, 200);
  assert.equal(seen.leads, 1);
});

test("product-lead: the hard mobile-only gate refuses with the CRM's own sentence", async () => {
  const seen = crm({ valid: false, lineType: "unknown", message: "Double-check your number" });
  const res = fakeRes();
  await productLead(fakeReq({}, leadBody), res);
  assert.equal(res.statusCode, 422);
  assert.deepEqual(res.body, { error: "Double-check your number" });
  assert.equal(seen.leads, 0);
});

test("product-lead: the CRM check being down never stops a lead", async () => {
  const seen = { leads: 0 };
  stubFetch((url) => {
    if (url.pathname === "/api/phone-validation") throw new TypeError("fetch failed");
    seen.leads++;
    return reply({ received: true, prospect_id: "p-2" });
  });
  const res = fakeRes();
  await productLead(fakeReq({}, leadBody), res);
  assert.equal(res.statusCode, 200);
  assert.equal(seen.leads, 1);
});

test("no provider key or host appears anywhere in this site's code", () => {
  for (const f of [
    "api/_lib/lead-check.ts", "api/lead-check.ts", "api/product-lead.ts",
    "client/src/lib/use-email-validation.ts", "client/src/lib/use-phone-validation.ts",
    "client/src/components/ProductIntakeForm.tsx", "client/src/pages/GetCoverage.tsx",
  ]) {
    const src = readFileSync(f, "utf8");
    assert.doesNotMatch(src, /MILLIONVERIFIER_API_KEY|millionverifier\.com|TELNYX_API_KEY|process\.env\.[A-Z_]*KEY/);
  }
});
