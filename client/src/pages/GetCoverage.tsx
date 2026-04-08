import { motion } from "framer-motion";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function GetCoverage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navigation />
      <section className="pt-24 pb-12 lg:pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-[#C5A059]/30 shadow-sm mb-6">
              <MapPin className="w-4 h-4 text-[#C5A059]" />
              <span className="text-sm font-medium text-[#2C2C2C]/80">Find Coverage in Your Area</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-normal tracking-tight text-[#2C2C2C] mb-6">
              Let's find the right{" "}
              <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
                plan for you
              </span>
            </h1>

            <p className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto mb-4">
              Answer a few quick questions and a licensed Sakred Health agent will reach out with personalized options — no obligation, no pressure.
            </p>
          </motion.div>

          {/* Placeholder for the intake form — will be replaced with actual form fields and webhook */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl border border-[#E8E4DC] p-8 sm:p-10 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]"
          >
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C5A059]/10 to-[#EBD598]/10 flex items-center justify-center mx-auto mb-6">
                <Phone className="w-8 h-8 text-[#C5A059]" />
              </div>
              <h2 className="text-2xl font-display font-normal text-[#2C2C2C] mb-3">
                Intake Form Coming Soon
              </h2>
              <p className="text-[#2C2C2C]/60 max-w-md mx-auto mb-8">
                Our intake form is being set up. In the meantime, reach out directly and a licensed agent will help you find affordable coverage.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="mailto:info@sakredhealth.com">
                  <Button
                    size="lg"
                    className="rounded-full btn-gold-gradient text-[#2C2C2C] px-8 py-6 text-base font-normal shadow-lg shadow-[#C5A059]/20 hover:shadow-[#C5A059]/40 hover:-translate-y-0.5 transition-all border border-[#C5A059]"
                  >
                    Contact Us
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-[#2C2C2C]/50">
              Already have a plan?{" "}
              <Link href="/app" className="text-[#C5A059] font-medium hover:underline">
                Explore the Sakred Health app
              </Link>
            </p>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
