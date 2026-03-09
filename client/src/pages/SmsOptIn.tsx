import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";

export default function SmsOptIn() {
  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      <Navigation />

      <main className="pt-34 pb-20">
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
            <h1 className="text-4xl sm:text-5xl font-display font-semibold text-[#0F172A] mb-4" data-testid="heading-sms-opt-in">
              SMS Opt-In & Messaging Policy
            </h1>
            <p className="text-[#0F172A]/70 mb-8">
              Last updated: March 2026
            </p>

            <div className="prose prose-lg max-w-none prose-headings:text-[#0F172A] prose-headings:font-display prose-headings:font-medium prose-p:text-[#0F172A]/70 prose-p:leading-relaxed prose-a:text-[#C5A059] prose-li:text-[#0F172A]/70">

              <h2>1. Program Description</h2>
              <p>
                Sakred Health ("Sakred," "we," "our," or "us") offers an SMS messaging program to provide information about private health insurance services, coverage options, plan availability, enrollment assistance, and related healthcare updates. By opting in, you consent to receive text messages from Sakred Health related to these services.
              </p>

              <h2>2. Consent & Opt-In</h2>
              <p>
                By providing your mobile phone number and opting in to our SMS program, you expressly consent to receive recurring automated marketing and informational text messages from Sakred Health. Consent is not a condition of purchase or enrollment in any insurance plan. You may opt in through:
              </p>
              <ul>
                <li>Submitting your phone number via our website or app</li>
                <li>Texting a designated keyword to our short code or phone number</li>
                <li>Providing verbal or written consent during a consultation or enrollment process</li>
                <li>Completing an online form that includes SMS consent language</li>
              </ul>
              <p>
                By opting in, you confirm that the phone number provided is your own and that you are authorized to receive messages at that number.
              </p>

              <h2>3. Message Types & Frequency</h2>
              <p>
                Messages may include, but are not limited to:
              </p>
              <ul>
                <li>Private health insurance plan information and updates</li>
                <li>Coverage options, benefits, and enrollment details</li>
                <li>Appointment reminders and callback confirmations</li>
                <li>Open enrollment notifications and deadline reminders</li>
                <li>Wellness tips and preventative health information</li>
                <li>Promotional offers related to our insurance services</li>
                <li>Account and service updates</li>
              </ul>
              <p>
                Message frequency varies. You may receive up to 10 messages per month, though frequency may increase during open enrollment periods or based on your interaction with our services.
              </p>

              <h2>4. Opt-Out Instructions</h2>
              <p>
                You may opt out of receiving SMS messages at any time by:
              </p>
              <ul>
                <li>Replying <strong>STOP</strong> to any message you receive from us</li>
                <li>Contacting us at <a href="mailto:team@sakredhealth.com">team@sakredhealth.com</a></li>
                <li>Calling us at (227) 225-6591</li>
              </ul>
              <p>
                After opting out, you will receive a one-time confirmation message. No further messages will be sent unless you re-subscribe. Opting out of SMS does not affect your ability to use Sakred Health services or access your account.
              </p>

              <h2>5. Help & Support</h2>
              <p>
                For help or questions about our SMS program, you may:
              </p>
              <ul>
                <li>Reply <strong>HELP</strong> to any message you receive from us</li>
                <li>Email us at <a href="mailto:team@sakredhealth.com">team@sakredhealth.com</a></li>
                <li>Call us at (227) 225-6591</li>
              </ul>

              <h2>6. Message & Data Rates</h2>
              <p>
                Standard message and data rates may apply depending on your mobile carrier and plan. Sakred Health is not responsible for any charges incurred from your carrier for receiving text messages.
              </p>

              <h2>7. Supported Carriers</h2>
              <p>
                Our SMS program is supported on all major U.S. carriers including AT&T, T-Mobile, Verizon, Sprint, and others. Carriers are not liable for delayed or undelivered messages.
              </p>

              <h2>8. Privacy & Data Use</h2>
              <p>
                Your phone number and opt-in data are collected solely for the purpose of sending you SMS messages as described in this policy. We do not sell, rent, or share your phone number or opt-in information with third parties for their marketing purposes.
              </p>
              <p>
                Information collected through our SMS program is subject to our{" "}
                <Link href="/privacy-policy" className="text-[#C5A059] hover:underline">Privacy Policy</Link>.
                We use your information in accordance with applicable privacy regulations, including the Telephone Consumer Protection Act (TCPA) and CAN-SPAM Act.
              </p>

              <h2>9. Data Retention</h2>
              <p>
                We retain your phone number and opt-in/opt-out records for the duration of your participation in the SMS program and for a reasonable period thereafter to comply with legal and regulatory requirements. Upon request, we will delete your information in accordance with our Privacy Policy.
              </p>

              <h2>10. Terms & Conditions</h2>
              <p>
                By participating in our SMS program, you also agree to our{" "}
                <Link href="/terms-of-service" className="text-[#C5A059] hover:underline">Terms of Service</Link>.
                We reserve the right to modify or discontinue the SMS program at any time without notice.
              </p>

              <h2>11. Contact Information</h2>
              <p>
                Sakred Health<br />
                382 NE 191st St<br />
                Miami, FL 33179
              </p>
              <p>
                Email: <a href="mailto:team@sakredhealth.com">team@sakredhealth.com</a><br />
                Phone: (227) 225-6591<br />
                Website: <a href="https://sakredhealth.com" target="_blank" rel="noopener noreferrer">sakredhealth.com</a>
              </p>
            </div>
          </motion.div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
