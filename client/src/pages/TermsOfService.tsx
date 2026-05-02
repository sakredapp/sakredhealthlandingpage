import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      <Navigation />

      <main className="pt-24 pb-20">
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
              Terms of Service
            </h1>
            <p className="text-[#0F172A]/70 mb-8">
              Effective Date: May 2, 2026
            </p>

            <div className="prose prose-lg max-w-none prose-headings:text-[#0F172A] prose-headings:font-display prose-headings:font-medium prose-p:text-[#0F172A]/70 prose-p:leading-relaxed prose-a:text-[#C5A059] prose-li:text-[#0F172A]/70">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using Sakred Health ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>

              <h2>2. Services</h2>
              <p>
                We provide life and health insurance brokerage and enrollment services ("Services"), including plan comparison, policy quoting, enrollment assistance, and ongoing customer support for individuals and families seeking life insurance and health coverage. Sakred Health also offers an optional client portal and preventative wellness platform with policy information, coverage breakdowns, dedicated agent support, structured daily wellness routines, habit tracking, and wearable integrations. The Service is designed to support your insurance and wellness needs but is not a substitute for professional medical advice, diagnosis, or treatment.
              </p>

              <h2>3. User Accounts</h2>
              <p>To use certain features, you must create an account. You agree to:</p>
              <ul>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h2>4. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Use the Service for any unlawful purpose</li>
                <li>Share your account with others</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Upload malicious content or code</li>
                <li>Use the Service to harm, threaten, or harass others</li>
              </ul>

              <h2>5. Content Ownership</h2>
              <p>
                You retain ownership of all content you create within the Service, including habit data, routine progress, and personal preferences. By using the Service, you grant us a limited license to store, process, and display your content solely to provide the Service to you.
              </p>

              <h2>6. Fees and Payment</h2>
              <p>
                Consumers do not pay Sakred Health for our brokerage and enrollment Services. As a licensed life and health insurance agency, Sakred Health is compensated by the insurance carriers whose products we offer when a policy is placed. The wellness app and client portal are free to use, with no paid tiers, subscriptions, or credit card information required.
              </p>

              <h2>7. SMS Communications</h2>
              <p>
                By opting in to our SMS messaging program, you consent to receive recurring automated marketing and informational text messages from Sakred Health related to your life and health insurance inquiries. Consent to receive SMS messages is not a condition of using the Service or of purchasing any insurance policy.
              </p>
              <p>
                You may opt out at any time by replying STOP to any message. Standard message and data rates may apply. For complete details, see our full Section 17 below and our{" "}
                <a href="/opt-in">SMS Opt-In & Messaging Policy</a>.
              </p>

              <h2>8. Wellness Guidance</h2>
              <p>
                Sakred Health provides structured wellness routines and general wellness guidance. The routines and guidance are not professional medical, psychological, or therapeutic advice. Always consult qualified professionals for health decisions.
              </p>

              <h2>9. Disclaimers</h2>
              <p>
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee that the Service will be uninterrupted, error-free, or meet your specific requirements. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service.
              </p>

              <h2>10. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Sakred Health shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
              </p>

              <h2>11. Modifications</h2>
              <p>
                We may modify these Terms at any time. Material changes will be communicated via email, SMS, or through the Service. Continued use after changes indicates acceptance of the modified Terms.
              </p>

              <h2>12. Termination</h2>
              <p>
                You may terminate your account at any time. We may suspend or terminate your access if you violate these Terms. Upon termination, your right to use the Service ceases immediately.
              </p>

              <h2>13. Governing Law</h2>
              <p>
                These Terms are governed by the laws of the State of Florida, United States, without regard to conflict of law principles.
              </p>

              <h2>14. Dispute Resolution</h2>
              <p>
                Any dispute arising out of or relating to these Terms or the Services shall be resolved in the state or federal courts located in Miami-Dade County, Florida, and you consent to the personal jurisdiction of those courts. The State of Florida is the governing state, matching Sakred Health's state of incorporation.
              </p>

              <h2>15. Privacy</h2>
              <p>
                Your use of the Service is also governed by our{" "}
                <a href="/privacy-policy">Privacy Policy</a>, which describes how we collect, use, and protect your information.
              </p>

              <h2>16. Contact</h2>
              <p>
                For questions about these Terms, please contact us at{" "}
                <a href="mailto:team@sakredhealth.com">team@sakredhealth.com</a>.
              </p>
              <p>
                Sakred Health<br />
                382 NE 191st St<br />
                Miami, FL 33179<br />
                Phone: (227) 225-6591
              </p>

              <h2>17. SMS Messaging Program</h2>
              <p>
                By providing your mobile phone number to Sakred Health, you consent to receive SMS text messages from us related to your life and health insurance inquiries, including:
              </p>
              <ul>
                <li>
                  <strong>Account notifications</strong> (appointment confirmations, policy updates, enrollment status, beneficiary changes)
                </li>
                <li>
                  <strong>Customer care</strong> (responses to your inquiries, plan and policy questions, support for both life and health products)
                </li>
                <li>
                  <strong>Marketing messages</strong> (new plan offerings, open enrollment reminders, life insurance product updates), only if you have explicitly opted into marketing communications
                </li>
              </ul>
              <p>
                Message frequency varies. Standard message and data rates may apply. You may opt out at any time by replying <strong>STOP</strong> to any message. You may request help by replying <strong>HELP</strong>, calling (227) 225-6591, or emailing{" "}
                <a href="mailto:team@sakredhealth.com">team@sakredhealth.com</a>.
              </p>
              <p>
                We will never sell, rent, or share your mobile phone number or SMS opt-in data with third parties for their own marketing purposes.
              </p>
              <p>
                For complete SMS terms, see our{" "}
                <a href="/opt-in">Opt-In &amp; Messaging Policy</a>.
              </p>
            </div>
          </motion.div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
