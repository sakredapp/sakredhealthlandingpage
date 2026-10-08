/*
 * DRAFT – for attorney review (privacy-agreements-gap, 2026-10-08).
 *
 * The terms for people who asked Sakred Health about life insurance or
 * mortgage protection. The lead portal's consent step and the insurance quote
 * forms link HERE (crmbuilds dial_brands.terms_url), not to /terms or
 * /terms-of-service: those are the Sakred Health app's and practitioner
 * directory's own terms and stay as they are.
 *
 * Wording is adapted, not new: it follows the lead-brand terms at
 * familyequityprotection.com/terms and the facts already stated in
 * /insurance-privacy (InsurancePrivacy.tsx: requests are sold or provided to
 * licensed agents and agencies; AI drafts and sends messages; STOP / HELP;
 * opt-outs follow the record). Left out of the FEP original on purpose, as
 * facts not verified for Sakred Health: how the brand is paid ("by carriers
 * only, never by you"), "we do not provide quotes or bind coverage", and a
 * fixed monthly text cap ("up to 8"). Attorney to confirm before adding any of
 * them. Do not add legal claims here without review.
 */
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

const CONTACT_EMAIL = "privacy@sakredhealth.com";

export default function InsuranceTerms() {
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
              Insurance Terms &amp; Conditions
            </h1>
            <p className="text-[#0F172A]/70 mb-8">
              Last updated: October 8, 2026
            </p>

            <div className="prose prose-lg max-w-none prose-headings:text-[#0F172A] prose-headings:font-display prose-headings:font-medium prose-p:text-[#0F172A]/70 prose-p:leading-relaxed prose-a:text-[#C5A059] prose-li:text-[#0F172A]/70">
              <p>
                These terms apply when you ask Sakred Health (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) about life insurance, mortgage protection, or other insurance coverage: the request you make through our websites, advertisements, and forms, and the texts, emails, calls, and private page that follow it. By making a request you agree to these terms. If you do not agree, please do not submit a request.
              </p>
              <p>
                They do not cover the Sakred Health app or practitioner directory, which have their own <Link href="/terms-of-service">Terms of Service</Link>. How we handle your information is in our <Link href="/insurance-privacy">Insurance Privacy Policy</Link>.
              </p>

              <h2>What we do</h2>
              <p>
                Sakred Health generates insurance inquiries and sells or provides them to licensed insurance agents and agencies, so that someone licensed in your state can respond to your request. We are not an insurance company and we do not underwrite policies. We are not a lender or loan servicer and have no connection to your mortgage. Any coverage you obtain is issued by a licensed insurance carrier and is subject to that carrier&rsquo;s underwriting, terms, and approval.
              </p>

              <h2>Not advice</h2>
              <p>
                Nothing on our pages, in our messages, or on your private page is financial, legal, or tax advice, or a recommendation for your situation. Guides and articles are general information. Any recommendation you receive comes from the licensed agent you speak with, based on your full circumstances.
              </p>

              <h2>Not a quote or an offer</h2>
              <p>
                Nothing we show you is a quote, an offer of insurance, or a promise of eligibility. Availability, coverage amounts, and pricing are determined by the carrier, and any figure you are given for your own coverage comes from the licensed agent you speak with.
              </p>

              <h2>Contact consent</h2>
              <p>
                When you tick a consent box, you agree to be contacted about insurance in the ways that box describes, at the number and email you provided. Consent is not a condition of any purchase. Message and data rates may apply. You can revoke consent at any time by replying STOP to a text, unsubscribing from an email, telling whoever calls you, or writing to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. The exact consent language is shown beside the box you tick and is stored with your request.
              </p>

              <h2>Text message terms</h2>
              <ul>
                <li><strong>Program:</strong> Sakred Health insurance requests, operated by Sakred Health.</li>
                <li><strong>What you receive:</strong> confirmation of your request, an introduction to the licensed agent handling it, scheduling and reminders, and follow-up about the coverage you asked about.</li>
                <li><strong>Frequency:</strong> varies.</li>
                <li><strong>Cost:</strong> message and data rates may apply.</li>
                <li><strong>To stop:</strong> reply <strong>STOP</strong> to any message.</li>
                <li><strong>For help:</strong> reply <strong>HELP</strong>, or email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</li>
                <li>Carriers are not liable for delayed or undelivered messages.</li>
              </ul>
              <p>
                Some messages are drafted and sent with the help of artificial intelligence, as described in our <Link href="/insurance-privacy">Insurance Privacy Policy</Link>. When you opt out by any channel, we stop texts, emails, and calls from every account on our platform that holds a copy of your record.
              </p>

              <h2>Accuracy of your information</h2>
              <p>
                You agree that the information you submit is accurate and is your own, that the phone number you give is one you are entitled to consent for, and that you are at least 18 years old.
              </p>

              <h2>Availability</h2>
              <p>Products described are not available in all states, and eligibility varies. We may change or discontinue these pages at any time.</p>

              <h2>Third-party sites</h2>
              <p>Links to other sites are provided for reference. We do not control them and are not responsible for their content or their privacy practices.</p>

              <h2>Intellectual property</h2>
              <p>Our pages, their design, and their content belong to Sakred Health and may not be copied or reused without permission.</p>

              <h2>Limitation of liability</h2>
              <p>
                Our pages and messages are provided &ldquo;as is,&rdquo; without warranties of any kind. To the fullest extent permitted by law, Sakred Health is not liable for any indirect, incidental, or consequential damages arising from your use of them or from any interaction with an agent or carrier you are connected with. Nothing in these terms limits rights you have under law that cannot be limited.
              </p>

              <h2>Changes</h2>
              <p>We may update these terms. The date at the top reflects the latest revision.</p>

              <h2>Contact us</h2>
              <p>
                Questions about these terms: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              </p>
            </div>
          </motion.div>
        </article>
      </div>
    </SiteLayout>
  );
}
