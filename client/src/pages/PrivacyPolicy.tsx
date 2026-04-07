import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";

export default function PrivacyPolicy() {
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
              Privacy Policy
            </h1>
            <p className="text-[#0F172A]/70 mb-8">
              Last updated: March 2026
            </p>

            <div className="prose prose-lg max-w-none prose-headings:text-[#0F172A] prose-headings:font-display prose-headings:font-medium prose-p:text-[#0F172A]/70 prose-p:leading-relaxed prose-a:text-[#C5A059] prose-li:text-[#0F172A]/70">
              <p>
                Sakred Health ("Sakred," "we," "our," or "us") is committed to protecting your privacy and handling your information responsibly. This Privacy Policy explains what information we collect, how we use it, how it is stored, and your rights regarding your data.
              </p>
              <p>
                By using the Sakred Health app or web portal, you agree to the practices described in this policy.
              </p>

              <h2>1. Information We Collect</h2>

              <h3>Account Information</h3>
              <p>When you create an account, we collect:</p>
              <ul>
                <li>Email address</li>
                <li>Name or display name</li>
                <li>Authentication credentials (password or social login data)</li>
              </ul>
              <p>
                If you sign in using Google or Apple, we receive basic profile information from that provider.
              </p>

              <h3>Wellness Activity Data</h3>
              <p>
                We collect the wellness-related information you choose to use within the app, including:
              </p>
              <ul>
                <li>Habit tracking data and completion records</li>
                <li>Routine participation history</li>
                <li>Streaks and engagement metrics</li>
                <li>Routine configuration and intensity settings</li>
              </ul>
              <p>
                This data is used to provide structure and progress tracking within the app.
              </p>

              <h3>Wearable Device Data</h3>
              <p>
                If you choose to connect supported wearable devices or health services, we may collect data such as:
              </p>
              <ul>
                <li>Sleep duration and sleep metrics</li>
                <li>Activity data (steps, workouts, calories)</li>
                <li>Heart rate and HRV</li>
                <li>Recovery and readiness scores</li>
              </ul>
              <p>
                Supported integrations include Fitbit, WHOOP, Oura Ring, Garmin, and Apple Health.
              </p>
              <p>
                You may disconnect these integrations at any time.
              </p>

              <h3>Healthcare Client Portal Information</h3>
              <p>
                If you activate the Healthcare Client Portal, we may process:
              </p>
              <ul>
                <li>Healthcare enrollment email</li>
                <li>Carrier name and plan details</li>
                <li>Policy information</li>
                <li>Coverage summaries</li>
                <li>Uploaded policy documents</li>
                <li>Support and callback requests</li>
              </ul>
              <p>
                Policy documents uploaded to the portal may be processed to enable in-app search functionality and structured coverage summaries. This processing uses deterministic text extraction and search indexing methods. No generative AI or language models are used to analyze your policy documents.
              </p>

              <h3>Support & Callback Requests</h3>
              <p>
                If you submit support requests or callback scheduling requests, we collect:
              </p>
              <ul>
                <li>Request type</li>
                <li>Preferred time slots</li>
                <li>Time zone</li>
                <li>Message details you provide</li>
              </ul>
              <p>
                This information is used solely to assist you with your healthcare plan.
              </p>

              <h3>SMS & Communications Data</h3>
              <p>
                If you opt in to our SMS messaging program, we collect:
              </p>
              <ul>
                <li>Mobile phone number</li>
                <li>Opt-in and opt-out records</li>
                <li>Message delivery and interaction data</li>
              </ul>
              <p>
                This information is used to send you messages about private health insurance services, coverage options, enrollment assistance, and related updates. Your phone number and opt-in data are not sold, rented, or shared with third parties for their marketing purposes. For full details, see our{" "}
                <a href="/opt-in">SMS Opt-In & Messaging Policy</a>.
              </p>

              <h2>2. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul>
                <li>Provide and maintain the Sakred Health app</li>
                <li>Track routine participation and progress</li>
                <li>Personalize your dashboard experience</li>
                <li>Enable wearable data synchronization</li>
                <li>Activate and operate the Healthcare Client Portal</li>
                <li>Provide policy document search and coverage summaries</li>
                <li>Process support and callback requests</li>
                <li>Send SMS messages about health insurance services (with your consent)</li>
                <li>Improve app functionality and reliability</li>
                <li>Communicate important updates regarding your account</li>
              </ul>
              <p>
                We do not use your data to train artificial intelligence models. We do not sell, rent, or share your phone number or opt-in information with third parties for their marketing purposes.
              </p>

              <h2>3. Data Storage & Security</h2>
              <p>
                Sakred Health uses Supabase (PostgreSQL) for secure data storage.
              </p>
              <p>Security measures include:</p>
              <ul>
                <li>Row Level Security (RLS) to ensure users can only access their own data</li>
                <li>Encrypted data transmission via TLS</li>
                <li>Encrypted storage at rest</li>
                <li>Role-based access controls for administrative functions</li>
                <li>Signed URL access for private policy document downloads</li>
              </ul>
              <p>
                Uploaded policy documents are stored in private storage buckets and are only accessible to authorized users.
              </p>
              <p>
                We implement industry-standard security practices designed to protect against unauthorized access, disclosure, or alteration.
              </p>

              <h2>4. Data Sharing</h2>
              <p>
                We do not sell, rent, or trade your personal information.
              </p>
              <p>We may share data only:</p>
              <ul>
                <li>With trusted service providers who operate parts of our infrastructure (under strict confidentiality agreements)</li>
                <li>When required by law</li>
                <li>To protect the rights, safety, or security of Sakred Health or its users</li>
                <li>With your explicit consent</li>
              </ul>
              <p>
                Wearable integrations share data only through your authorized connections with those services.
              </p>

              <h2>5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Export your data</li>
                <li>Opt out of non-essential communications</li>
                <li>Restrict certain processing where applicable</li>
              </ul>
              <p>
                To request account deletion, contact us at{" "}
                <a href="mailto:help@sakredhealth.com">help@sakredhealth.com</a>.
              </p>

              <h2>6. Data Retention</h2>
              <p>
                We retain your data for as long as your account remains active.
              </p>
              <p>
                Upon account deletion, we permanently delete your personal data within 30 days, unless retention is required for legal, regulatory, or operational reasons.
              </p>
              <p>
                Policy documents and healthcare records are removed upon account deletion unless legally required to retain them.
              </p>

              <h2>7. Children's Privacy</h2>
              <p>
                Sakred Health is not intended for individuals under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that such data has been collected, we will delete it promptly.
              </p>

              <h2>8. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. If material changes occur, we will notify you via email or in-app notice. Continued use of Sakred Health after updates indicates acceptance of the revised policy.
              </p>

              <h2>9. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or our data practices, please contact:
              </p>
              <p>
                Sakred Health<br />
                382 NE 191st St<br />
                Miami, FL 33179
              </p>
              <p>
                Email:{" "}
                <a href="mailto:team@sakredhealth.com">team@sakredhealth.com</a><br />
                Phone: (227) 225-6591<br />
                Website:{" "}
                <a href="https://sakredhealth.com" target="_blank" rel="noopener noreferrer">sakredhealth.com</a>
              </p>
            </div>
          </motion.div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
