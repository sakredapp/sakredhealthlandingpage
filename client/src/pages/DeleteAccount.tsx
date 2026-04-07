import { motion } from "framer-motion";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { Card } from "@/components/ui/card";
import { Mail, Trash2, Clock, Shield, CheckCircle } from "lucide-react";

export default function DeleteAccount() {
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
              Delete Your Sakred Health Account
            </h1>
            <p className="text-lg text-[#0F172A]/70">
              We're sorry to see you go. Here's how to request deletion of your account and data.
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
                    How to Request Account Deletion
                  </h2>
                  <p className="text-[#0F172A]/70 mb-4">
                    To delete your Sakred Health account and all associated data, please follow these steps:
                  </p>
                </div>
              </div>

              <ol className="space-y-4 ml-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-[#C5A059] text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
                  <div>
                    <p className="text-[#0F172A] font-medium">Send an email to our support team</p>
                    <p className="text-[#0F172A]/70">
                      Email <a href="mailto:support@sakredhealth.com" className="text-[#C5A059] underline" data-testid="link-support-email">support@sakredhealth.com</a> with the subject line "Account Deletion Request"
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-[#C5A059] text-white rounded-full flex items-center justify-center text-sm font-medium">2</span>
                  <div>
                    <p className="text-[#0F172A] font-medium">Include your account information</p>
                    <p className="text-[#0F172A]/70">
                      Provide the email address associated with your Sakred Health account so we can locate your data
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
                    <p className="text-[#0F172A] font-medium">Account deletion completed</p>
                    <p className="text-[#0F172A]/70">
                      Your account and data will be permanently deleted within 30 days of your confirmed request.
                    </p>
                  </div>
                </li>
              </ol>
            </Card>

            <Card className="p-8 mb-8 border-0 shadow-lg rounded-2xl bg-white">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-red-100 rounded-xl">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-normal text-[#0F172A] mb-2">
                    Data That Will Be Deleted
                  </h2>
                  <p className="text-[#0F172A]/70">
                    When you delete your account, the following data is permanently removed:
                  </p>
                </div>
              </div>

              <ul className="space-y-3 ml-4">
                {[
                  "Your account profile and login credentials",
                  "Habit tracking data and streaks",
                  "Custom routines and progress history",
                  "Personalized insights and preferences",
                  "Subscription and payment history (except as required by law)",
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
                  "Transaction records for tax and accounting purposes (7 years)",
                  "Anonymized, aggregated usage data for service improvement",
                  "Communications related to legal disputes or investigations",
                  "Data required to comply with applicable laws and regulations",
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
