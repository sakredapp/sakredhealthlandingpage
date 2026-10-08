/*
 * DRAFT – for attorney review (privacy-agreements-gap, 2026-10-08).
 *
 * The privacy policy for people who asked Sakred Health about life insurance
 * or mortgage protection. Lead emails and the lead portal link HERE
 * (crmbuilds dial_brands.privacy_url), not to /privacy: /privacy is the
 * practitioner directory's and app's own policy and stays as it is.
 *
 * Wording is adapted, not new: it follows the Sakred privacy page rewritten in
 * crmbuilds #2899 (client/public/privacy.html: leads we generate and sell,
 * AI processing, opt-outs follow the lead, not a consumer report, 30-day
 * third-party refresh, state privacy rights) and the lead-brand policy at
 * familyequityprotection.com/privacy. Do not add legal claims here without
 * review.
 */
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

const PRIVACY_EMAIL = "privacy@sakredhealth.com";

const CATEGORIES: [string, string, string][] = [
  ["Identifiers", "Name, email address, phone number, IP address", "You; your device"],
  ["Personal characteristics", "Age or age range", "You"],
  ["Financial and household information", "Details you give about the coverage you are asking about, such as a mortgage you want protected or the person you want to protect", "You"],
  ["Location", "State and ZIP code; a street address where you choose to give it", "You"],
  ["Property and household details", "Details of the home you asked about", "Public records and third-party data partners"],
  ["Internet activity", "Pages visited, referring advertisement, browser and device details", "Your device; our advertising partners"],
  ["Consent record", "The exact consent text you agreed to, and when", "You"],
];

export default function InsurancePrivacy() {
  return (
    <SiteLayout solidHeader>
      <div className="pb-20">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="inline-flex items-center gap-2 text-[#C5A059] hover:underline mb-8" data-testid="link-back-home">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <div className="w-12 h-1 bg-gradient-to-r from-[#C5A059] to-[#EBD598] mb-6" />
            <h1 className="text-4xl sm:text-5xl font-display font-semibold text-[#0F172A] mb-4">
              Insurance Privacy Policy
            </h1>
            <p className="text-[#0F172A]/70 mb-8">
              Last updated: October 8, 2026
            </p>

            <div className="prose prose-lg max-w-none prose-headings:text-[#0F172A] prose-headings:font-display prose-headings:font-medium prose-p:text-[#0F172A]/70 prose-p:leading-relaxed prose-a:text-[#C5A059] prose-li:text-[#0F172A]/70">
              <p>
                This policy explains what Sakred Health (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) collects when you ask us about life insurance, mortgage protection, or other insurance coverage, what we do with it, who receives it, and the choices you have. It covers the request you made through our websites, advertisements, and forms, and the texts, emails, calls, and private page that follow it.
              </p>
              <p>
                It does not cover the Sakred Health app or practitioner directory, which have their own <Link href="/privacy">Privacy Policy</Link>.
              </p>

              <h2>Information we collect</h2>
              <h3>What you give us</h3>
              <p>
                When you make a request we collect what you enter, such as your name, email address, phone number, state, ZIP code, age, and the details of the coverage you are asking about.
              </p>
              <h3>What we record automatically</h3>
              <p>
                With every request we record your IP address, browser user agent, the page you submitted from, the date and time, and the exact consent language you agreed to. That is your consent record, and we keep it so we can prove what you agreed to and when.
              </p>
              <h3>Public records and third-party data partners</h3>
              <p>
                We use public records and third-party data partners to personalise our own messages and your private page, for example with property and household details of the home you asked about. Information from third-party data partners is not provided to agents or agencies.
              </p>
              <h3>Cookies, pixels, and advertising</h3>
              <p>
                We and our advertising partners (such as Meta) use cookies, pixels, and similar technologies to measure how you reached us and whether an advertisement led to a request. Where a click identifier or campaign parameter is present in the address that brought you here, we store it with your request. You can limit cookies in your browser settings and limit ad measurement in the settings of the platform that showed you the advertisement.
              </p>

              <h2>How we use it</h2>
              <ul>
                <li>To route your request to a licensed insurance agent in your state, who contacts you to discuss coverage.</li>
                <li>To contact you by phone, text, or email as described in the consent you gave, and to keep the record of that consent.</li>
                <li>To personalise our own messages and your private page.</li>
                <li>To measure and improve our advertising.</li>
                <li>To respond to your requests, resolve complaints, and comply with law.</li>
              </ul>

              <h2>Automated and AI tools</h2>
              <p>
                We use artificial intelligence to draft and send messages, summarise conversations, and propose appointment times. Features that handle health information run on Amazon Bedrock under a business associate agreement where required. Other automated and AI features use other AI service providers, under contracts that prohibit them from retaining your content beyond what is needed to serve the request and from using it to train their models.
              </p>

              <h2>Who receives your request</h2>
              <p>
                Sakred Health generates insurance inquiries and sells or provides them to licensed insurance agents and agencies, so that someone licensed in your state can respond to your request. If you choose to apply for coverage, your information goes to the insurance carrier. We also share information with service providers that host our systems, deliver messages, and measure advertising, under contracts that limit what they may do with it.
              </p>
              <p>
                We do not sell your information to unrelated third parties for their own marketing. Some state laws treat selling your request to agents, or sharing for targeted advertising, as a &ldquo;sale&rdquo; or &ldquo;share&rdquo;; see <Link href="/do-not-sell">Do Not Sell or Share My Info</Link> for how to opt out. We may also disclose information when the law requires it, to protect our rights, or as part of a merger or sale of the business.
              </p>
              <h3>Not a consumer report</h3>
              <p>
                Information from public records or third-party data partners is not a consumer report and is not used as a factor in deciding anyone&rsquo;s eligibility for credit, insurance (including underwriting or risk evaluation), employment, or housing.
              </p>

              <h2>Text messages</h2>
              <p>
                Mobile information is used to send the messages you agreed to: confirming your request, introducing the licensed agent handling it, scheduling, and follow-up about the coverage you asked about. Message frequency varies. Message and data rates may apply. Reply <strong>STOP</strong> to any message to opt out, or <strong>HELP</strong> for help.
              </p>
              <p>
                <strong>No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. Text-messaging originator opt-in data and consent will not be shared with any third parties,</strong> other than the providers that deliver our messages on our behalf and are bound not to use it for anything else. The categories of sharing above exclude your text-messaging opt-in data.
              </p>

              <h2>Your choices</h2>
              <ul>
                <li>Reply <strong>STOP</strong> to any text to stop texts immediately.</li>
                <li>Use the unsubscribe link in any email, or ask whoever calls to put you on their do-not-call list.</li>
                <li>Email <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a> to end all contact, or to access, correct, or delete your information.</li>
              </ul>
              <h3>Opt-outs follow your record</h3>
              <p>
                When you opt out by any channel (replying STOP to a text, unsubscribing from an email, asking a caller, or writing to us), we stop texts, emails, and calls from every account on our platform that holds a copy of your record, including licensed agents who received your request from us there.
              </p>

              <h2>State privacy rights</h2>
              <p>
                Residents of California, Colorado, Connecticut, Virginia, Utah, Texas, Oregon, and other states with comprehensive privacy laws have specific rights over their personal information. We extend the same rights to everyone whose request reached us. This section is the notice those laws require.
              </p>
              <h3>Categories we collect</h3>
              <div className="not-prose overflow-x-auto rounded-2xl border border-[#E8E4DC] bg-white my-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs tracking-wider text-[#0F172A]/60 uppercase">
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Examples</th>
                      <th className="px-4 py-3 font-medium">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CATEGORIES.map(([cat, ex, src]) => (
                      <tr key={cat} className="border-t border-[#E8E4DC] align-top">
                        <td className="px-4 py-3 font-medium text-[#0F172A]">{cat}</td>
                        <td className="px-4 py-3 text-[#0F172A]/70">{ex}</td>
                        <td className="px-4 py-3 text-[#0F172A]/70">{src}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                We collect these for the purposes listed under &ldquo;How we use it&rdquo; and disclose them to the recipients listed under &ldquo;Who receives your request.&rdquo; We do not knowingly sell or share the personal information of anyone under 16.
              </p>
              <h3>Your rights</h3>
              <ul>
                <li>To know what personal information we hold about you, and to receive a copy of it.</li>
                <li>To correct inaccurate personal information.</li>
                <li>To delete personal information, subject to exceptions such as keeping a consent record the law requires us to retain.</li>
                <li>To opt out of the sale or sharing of personal information and of targeted advertising.</li>
                <li>To not be discriminated against for exercising any of these rights.</li>
              </ul>
              <p>We honour Global Privacy Control.</p>
              <h3>How to exercise them</h3>
              <p>
                Email <a href={`mailto:${PRIVACY_EMAIL}?subject=Privacy%20Request`}>{PRIVACY_EMAIL}</a> with the subject &ldquo;Privacy Request.&rdquo; Tell us which right you are exercising and include the name, email, and phone number you submitted so we can find your record. We verify requests by matching them to that record, and we may ask for more information if they don&rsquo;t match. You may use an authorised agent; we may ask for proof of the authorisation. We respond within 45 days, and will tell you if we need an extension the law allows. If we decline a request you may appeal by replying to our response, and we will explain the outcome and how to contact your state&rsquo;s attorney general.
              </p>

              <h2>Retention</h2>
              <p>
                We keep your request and consent record for as long as needed to respond to your request and to meet our legal and record-keeping obligations, including the retention of consent records under telemarketing law. Information obtained from third-party data partners is refreshed or deleted at least every 30 days, and deleted within 30 days of a verified deletion request.
              </p>

              <h2>Security</h2>
              <p>
                We use administrative, technical, and organizational safeguards designed to protect information, including encryption in transit, access controls, and restricted internal access. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.
              </p>

              <h2>Children</h2>
              <p>Our insurance services are not directed to children, and we do not knowingly collect information from children.</p>

              <h2>Changes</h2>
              <p>We may update this policy. The date at the top reflects the latest revision.</p>

              <h2>Contact us</h2>
              <p>
                Questions or requests about this policy or your information: <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>.
              </p>
            </div>
          </motion.div>
        </article>
      </div>
    </SiteLayout>
  );
}
