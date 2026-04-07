import { motion } from "framer-motion";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { Card } from "@/components/ui/card";
import { Mail, Database, Clock, Shield, CheckCircle } from "lucide-react";

export default function DeleteData() {
  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl sm:text-4xl font-display font-normal text-[#0F172A] mb-4">
              Delete Your Sakred Health Data
            </h1>
            <p className="text-lg text-[#0F172A]/70">
              Request deletion of your personal data while optionally keeping your account.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="p-8 mb-8 border-0 shadow-lg rounded-2xl bg-white">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-[#C5A059]/10 rounded-xl">
                  <Mail className="w-6 h-6 text-[#C5A059]" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-normal text-[#0F172A] mb-2">
                    How to Request Data Deletion
                  </h2>
                  <p className="text-[#0F172A]/70 mb-4">
                    To delete your personal data from Sakred Health, please follow these steps:
                  </p>
                </div>
              </div>

              <ol className="space-y-4 ml-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-[#C5A059] text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
                  <div>
                    <p className="text-[#0F172A] font-medium">Send an email to our support team</p>
                    <p className="text-[#0F172A]/70">
                      Email <a href="mailto:support@sakredhealth.com" className="text-[#C5A059] underline" data-testid="link-support-email">support@sakredhealth.com</a> with the subject line "Data Deletion Request"
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-[#C5A059] text-white rounded-full flex items-center justify-center text-sm font-medium">2</span>
                  <div>
                    <p className="text-[#0F172A] font-medium">Specify what data you want deleted</p>
                    <p className="text-[#0F172A]/70">
                      Let us know if you want all data deleted, or specific types of data (habits, routines, progress history, etc.)
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-[#C5A059] text-white rounded-full flex items-center justify-center text-sm font-medium">3</span>
                  <div>
                    <p className="text-[#0F172A] font-medium">Confirm your request</p>
                    <p className="text-[#0F172A]/70">
                      You will receive a confirmation email within 24-48 hours. Reply to confirm your deletion request.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-[#C5A059] text-white rounded-full flex items-center justify-center text-sm font-medium">4</span>
                  <div>
                    <p className="text-[#0F172A] font-medium">Data deletion completed</p>
                    <p className="text-[#0F172A]/70">
                      Your requested data will be permanently deleted within 30 days of your confirmed request.
                    </p>
                  </div>
                </li>
              </ol>
            </Card>

            <Card className="p-8 mb-8 border-0 shadow-lg rounded-2xl bg-white">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-red-100 rounded-xl">
                  <Database className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-normal text-[#0F172A] mb-2">
                    Data That Can Be Deleted
                  </h2>
                  <p className="text-[#0F172A]/70">
                    You can request deletion of any or all of the following data types:
                  </p>
                </div>
              </div>

              <ul className="space-y-3 ml-4">
                {[
                  "Habit tracking data and streaks",
                  "Custom routines and progress history",
                  "Personalized insights and preferences",
                  "Profile information and preferences",
                  "Usage analytics and activity logs",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-[#0F172A]/80">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-8 mb-8 border-0 shadow-lg rounded-2xl bg-white">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-normal text-[#0F172A] mb-2">
                    Data That May Be Retained
                  </h2>
                  <p className="text-[#0F172A]/70">
                    Certain information may be retained for legal and operational purposes:
                  </p>
                </div>
              </div>

              <ul className="space-y-3 ml-4">
                {[
                  "Transaction records for tax and accounting purposes (retained for 7 years)",
                  "Anonymized, aggregated usage data for service improvement",
                  "Communications related to legal disputes or investigations",
                  "Data required to comply with applicable laws and regulations",
                  "Basic account information if you choose to keep your account active",
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-[#0F172A]/80">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-8 border-0 shadow-lg rounded-2xl bg-white">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-[#C5A059]/10 rounded-xl">
                  <Clock className="w-6 h-6 text-[#C5A059]" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-normal text-[#0F172A] mb-2">
                    Processing Timeline
                  </h2>
                </div>
              </div>

              <div className="space-y-4 ml-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-[#0F172A]/60 w-32">Initial Response</span>
                  <span className="text-[#0F172A]">Within 24-48 hours</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-[#0F172A]/60 w-32">Confirmation</span>
                  <span className="text-[#0F172A]">Within 5 business days</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-[#0F172A]/60 w-32">Full Deletion</span>
                  <span className="text-[#0F172A]">Within 30 days of confirmed request</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-[#F9F9F7] rounded-xl">
                <p className="text-sm text-[#0F172A]/70">
                  <strong className="text-[#0F172A]">Need to delete your entire account?</strong> Visit our{" "}
                  <a href="/delete-account" className="text-[#C5A059] underline">
                    Account Deletion page
                  </a>{" "}
                  for full account removal.
                </p>
              </div>

              <div className="mt-4 p-4 bg-[#F9F9F7] rounded-xl">
                <p className="text-sm text-[#0F172A]/70">
                  <strong className="text-[#0F172A]">Questions?</strong> Contact us at{" "}
                  <a href="mailto:support@sakredhealth.com" className="text-[#C5A059] underline">
                    support@sakredhealth.com
                  </a>
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
