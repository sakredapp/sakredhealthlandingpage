import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useDownloadDialog } from "./DownloadDialog";

export function AppHero() {
  const { openDialog, DialogComponent } = useDownloadDialog();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F9F9F7] pt-16">
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-[#C5A059]/20 rounded-full blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-[#EBD598]/30 rounded-full blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 0.9, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C5A059]/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-[#C5A059]/30 shadow-sm mb-8"
        >
          <span className="text-sm font-medium text-[#2C2C2C]/80">Preventative Wellness Meets Insurance Intelligence</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-display font-normal tracking-tight text-[#2C2C2C] mb-6"
        >
          One app for your health, coverage,{" "}
          <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
            and long-term planning
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-[#2C2C2C]/70 max-w-3xl mx-auto mb-6 leading-relaxed"
        >
          Guided routines and daily habits, an eBook library and community, a curated shop, wearable sync, and a secure HIPAA-compliant Policy portal — with dedicated agent support across Health, Life, and Annuity coverage. Your entire health and long-term planning ecosystem in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-col items-center gap-4 mb-4"
        >
          <Button
            onClick={openDialog}
            size="lg"
            className="rounded-full btn-gold-gradient text-[#2C2C2C] px-10 py-7 text-lg font-normal shadow-lg shadow-[#C5A059]/30 hover:shadow-[#C5A059]/50 hover:-translate-y-0.5 transition-all border border-[#C5A059]"
          >
            Download the App
          </Button>
          <p className="text-sm text-[#2C2C2C]/50">Available on iOS and Android</p>
        </motion.div>
      </div>
      {DialogComponent}
    </section>
  );
}
