import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";

export default function Terms() {
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
              Sakred Health — Terms of Use
            </h1>
            <p className="text-[#0F172A]/70 mb-8">
              Last updated: June 26, 2026
            </p>

            <div className="prose prose-lg max-w-none prose-headings:text-[#0F172A] prose-headings:font-display prose-headings:font-medium prose-p:text-[#0F172A]/70 prose-p:leading-relaxed prose-a:text-[#C5A059] prose-li:text-[#0F172A]/70">
              <p>
                These Terms of Use ("Terms") govern your use of the Sakred Health mobile and web application (the "App"), including the eBook Library and the Community Forum. By creating an account or using the App, you agree to these Terms.
              </p>

              <h2>1. Educational content, not medical advice</h2>
              <p>
                Content in the Library (eBooks, guides, resources) is provided for general educational purposes only and is <strong>not medical advice</strong>. It is not a substitute for professional diagnosis or treatment. Always consult a qualified healthcare provider. Insurance and policy information shown in the App is informational; your carrier's official documents control.
              </p>

              <h2>2. Community Forum — code of conduct (zero tolerance)</h2>
              <p>
                The Community Forum is a shared space for members. You agree <strong>not</strong> to post content that is objectionable, including: harassment, hate speech, threats, sexual or violent content, illegal content, spam, or another person's private information. We have <strong>zero tolerance</strong> for objectionable content and abusive behavior.
              </p>
              <ul>
                <li>
                  <strong>Report:</strong> use the "⋯" menu on any message to report it.
                </li>
                <li>
                  <strong>Block:</strong> block any member to stop seeing their content.
                </li>
                <li>
                  <strong>Moderation:</strong> we review reported content and act on violations (removing content and/or removing the user) <strong>within 24 hours</strong>.
                </li>
                <li>
                  <strong>Contact:</strong> report abuse or reach our team at{" "}
                  <a href="mailto:support@sakredhealth.com">support@sakredhealth.com</a>.
                </li>
              </ul>
              <p>
                Violating this code may result in content removal and loss of Library/Community access without refund.
              </p>

              <h2>3. Library access &amp; purchases</h2>
              <p>
                Access to the Library and Community is granted by owning an eBook or by Sakred Health staff. Where eBooks are sold, purchases are processed through the platform's in-app purchase system. Access may be revoked for violations of these Terms.
              </p>

              <h2>4. Accounts</h2>
              <p>
                You are responsible for activity under your account and for keeping your credentials secure. Healthcare portal activation requires proof of identity (your account email or an activation code we issue).
              </p>

              <h2>5. Privacy</h2>
              <p>
                Our handling of your data is described in the{" "}
                <a href="/privacy">Privacy Policy</a>. The Community Forum displays your first name and last initial only; do not post personal information.
              </p>

              <h2>6. Changes</h2>
              <p>
                We may update these Terms. Continued use after an update constitutes acceptance.
              </p>

              <h2>7. Contact</h2>
              <p>
                Sakred Health —{" "}
                <a href="mailto:support@sakredhealth.com">support@sakredhealth.com</a>
              </p>
            </div>
          </motion.div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
