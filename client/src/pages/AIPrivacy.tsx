import { motion } from "framer-motion";
import { Link } from "wouter";
import { Shield, Lock, Eye, Trash2, Download, UserCheck } from "lucide-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const privacyFeatures = [
  {
    icon: Shield,
    title: "Your Data, Your Control",
    description: "You have complete ownership of your wellness data. Export it anytime, delete it completely, or modify what's stored. We're custodians, not owners.",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "All your habits, routine progress, and personal data are encrypted using AES-256 encryption. Your wellness data stays private and secure.",
  },
  {
    icon: Eye,
    title: "No Data Selling",
    description: "We will never sell, share, or monetize your personal wellness data. Our business model is simple: subscription revenue, not your information.",
  },
  {
    icon: UserCheck,
    title: "Private Personalization",
    description: "Sakred Health personalizes your experience locally. Your data is never used to train external models or shared with third parties.",
  },
  {
    icon: Download,
    title: "Data Portability",
    description: "Export all your data in standard formats at any time. Your wellness journey belongs to you, whether you stay with us or move on.",
  },
  {
    icon: Trash2,
    title: "Right to Be Forgotten",
    description: "Request complete deletion of your account and all associated data. We process deletion requests within 30 days with no data remnants.",
  },
];

export default function AIPrivacy() {
  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      <Navigation />

      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C5A059]/10 mb-6">
              <Shield className="w-8 h-8 text-[#C5A059]" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-semibold text-[#0F172A] mb-4">
              AI &{" "}
              <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
                Privacy
              </span>
            </h1>
            <p className="text-lg text-[#0F172A]/70 max-w-2xl mx-auto">
              At Sakred Health, we believe your wellness data is sacred. Here's how we protect it while delivering personalized AI guidance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-16"
          >
            <Card className="bg-white rounded-2xl p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-0">
              <h2 className="text-2xl font-display font-medium text-[#0F172A] mb-4">
                How Your Data Is Protected
              </h2>
              <div className="space-y-4 text-[#0F172A]/70 leading-relaxed">
                <p>
                  Sakred Health is designed to be your personal wellness companion, not a data harvester. Our platform tracks your habits and progress to provide meaningful insights—but this analysis happens with your privacy as the top priority.
                </p>
                <p>
                  Your wellness data is stored securely and never used to train external models, sold to third parties, or accessible to our team beyond what's needed for support purposes.
                </p>
                <p>
                  The personalization you experience comes from your own data working for you. As you use the app, your routine progress, habit data, and preferences create a truly personalized experience that belongs entirely to you.
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
          >
            {privacyFeatures.map((feature) => (
              <Card
                key={feature.title}
                className="bg-white rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-0 hover:shadow-[0_4px_20px_-4px_rgba(197,160,89,0.25)] hover:border-[#C5A059]/30 transition-all duration-300 border border-transparent"
              >
                <div className="w-12 h-12 rounded-xl bg-[#C5A059]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#C5A059]" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{feature.title}</h3>
                <p className="text-[#0F172A]/70 text-sm leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-br from-[#C5A059]/10 to-[#EBD598]/20 rounded-2xl p-8 border-0">
              <h2 className="text-2xl font-display font-medium text-[#0F172A] mb-4">
                Questions About Your Privacy?
              </h2>
              <p className="text-[#0F172A]/70 mb-6 max-w-lg mx-auto">
                We're committed to transparency. If you have any questions about how we handle your data, we're here to help.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild className="rounded-full btn-gold-shine text-[#0F172A] border border-[#C5A059] shadow-lg shadow-[#C5A059]/20" data-testid="button-contact-privacy">
                  <a href="mailto:team@sakredunion.com">Contact Privacy Team</a>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059]/10" data-testid="button-view-privacy-policy">
                  <Link href="/privacy-policy">View Full Privacy Policy</Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
