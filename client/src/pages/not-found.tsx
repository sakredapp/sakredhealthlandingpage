import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-[#C5A059]/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-display font-semibold text-[#C5A059]">404</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-display font-semibold text-[#0F172A] mb-4">
            Page Not Found
          </h1>
          
          <p className="text-[#0F172A]/70 mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          
          <Button
            asChild
            className="rounded-full btn-gold-shine text-[#0F172A] border border-[#C5A059] shadow-lg shadow-[#C5A059]/20"
            data-testid="button-back-home"
          >
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
