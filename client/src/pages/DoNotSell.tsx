/*
 * DRAFT – for attorney review (privacy-agreements-gap, 2026-10-08).
 *
 * Do Not Sell or Share My Personal Information, for people who asked Sakred
 * Health about insurance. Lead emails and the lead portal link here
 * (crmbuilds shared/portal/privacy-footer.ts: <brand site>/do-not-sell).
 *
 * Mirrors familyequityprotection.com/do-not-sell: requests are made by email to
 * the brand's privacy@ address (no web form). Wording is adapted from that page
 * and the Sakred privacy page in crmbuilds #2899; do not add legal claims here
 * without review.
 */
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Mail } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";

const PRIVACY_EMAIL = "privacy@sakredhealth.com";
const REQUEST_HREF = `mailto:${PRIVACY_EMAIL}?subject=Privacy%20Request`;

export default function DoNotSell() {
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
              Do Not Sell or Share My Personal Information
            </h1>
            <p className="text-lg text-[#0F172A]/70 mb-2">
              Your privacy rights, and the one email that exercises all of them. Every request is free, and asking never changes how we treat you.
            </p>
            <p className="text-[#0F172A]/70 mb-8">
              Last updated: October 8, 2026
            </p>

            <a
              href={REQUEST_HREF}
              className="inline-flex items-center gap-2 rounded-full btn-gold-gradient text-[#2C2C2C] px-6 py-3 text-base font-normal shadow-lg shadow-[#C5A059]/20 border border-[#C5A059] mb-10"
              data-testid="link-privacy-request"
            >
              <Mail className="w-4 h-4" />
              Email a privacy request
            </a>

            <div className="prose prose-lg max-w-none prose-headings:text-[#0F172A] prose-headings:font-display prose-headings:font-medium prose-p:text-[#0F172A]/70 prose-p:leading-relaxed prose-a:text-[#C5A059] prose-li:text-[#0F172A]/70">
              <p>
                Residents of California and other states with comparable privacy laws have the right to opt out of the sale or sharing of their personal information, to limit the use of sensitive personal information, and to request access to, correction of, or deletion of the personal information we hold about them. We extend the same rights to everyone, wherever they live. Sakred Health sells or provides insurance requests to licensed insurance agents and agencies, as described in our <Link href="/insurance-privacy">Insurance Privacy Policy</Link>.
              </p>

              <h2>How to submit a request</h2>
              <p>
                Email <a href={REQUEST_HREF}>{PRIVACY_EMAIL}</a> with the subject line &ldquo;Privacy Request&rdquo; and tell us which right you are exercising:
              </p>
              <ul>
                <li>Opt out of the sale or sharing of my personal information, including for targeted advertising</li>
                <li>Access the personal information you hold about me</li>
                <li>Delete the personal information you hold about me</li>
                <li>Correct inaccurate personal information</li>
                <li>Limit the use of my sensitive personal information</li>
                <li>Place me on your internal do-not-contact list</li>
              </ul>
              <p>
                Include the full name, email address, and phone number you submitted so we can locate your record. We verify requests by matching them to that record, and we may ask for more information if they don&rsquo;t match. We respond within 45 days, and will tell you if we need an extension the law allows. We honour Global Privacy Control.
              </p>

              <h2>What opting out covers</h2>
              <p>
                Opting out stops us selling your request to licensed agents and sharing your information with advertising partners for targeted advertising going forward. It does not undo an introduction already made: a licensed agent you have already been matched with holds their own record of your consent and must be asked directly, or sent STOP, to stop their outreach. We can tell you who that is.
              </p>

              <h2>Stopping contact</h2>
              <p>
                To stop text messages, reply <strong>STOP</strong> to any message from us. To stop emails, use the unsubscribe link in any email. These are the fastest ways to end communications and take effect immediately. When you opt out by any channel, we stop texts, emails, and calls from every account on our platform that holds a copy of your record.
              </p>

              <h2>Authorized agents</h2>
              <p>You may designate an authorized agent to submit a request on your behalf. We may ask for proof of that authorization and for verification of your identity before acting on it.</p>

              <h2>Appeals and complaints</h2>
              <p>If we decline a request, reply to our response to appeal it and we will review it again and explain the outcome. You may also contact your state&rsquo;s attorney general or privacy regulator.</p>

              <h2>No discrimination</h2>
              <p>We will not deny you services, charge you a different price, or provide a different level of service because you exercised any of these rights.</p>

              <h2>Contact us</h2>
              <p>
                <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>
              </p>
            </div>
          </motion.div>
        </article>
      </div>
    </SiteLayout>
  );
}
