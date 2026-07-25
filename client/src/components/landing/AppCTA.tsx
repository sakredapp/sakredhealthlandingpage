import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useDownloadDialog } from "./DownloadDialog";

export function AppCTA() {
  const { openDialog, DialogComponent } = useDownloadDialog();

  return (
    <section className="py-12 lg:py-20 bg-gradient-to-b from-[#F6F4EF] to-[#EDE9E0] relative overflow-hidden">
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 bg-[#C5A059]/8 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-72 h-72 bg-[#EBD598]/15 rounded-full blur-3xl"
        animate={{ scale: [1, 0.9, 1], opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-display font-normal text-[#2C2C2C] mb-6"
        >
          Your Health,{" "}
          <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
            Finally in One Place
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-[#2C2C2C]/70 max-w-2xl mx-auto mb-10"
        >
          Stop juggling separate apps for insurance, wellness, health tracking, and financial planning. Sakred brings your Policy portal, guided routines, library, shop, and long-term planning together — so you can focus on what matters.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-10"
        >
          <Button
            onClick={openDialog}
            size="lg"
            className="rounded-full btn-gold-gradient text-[#2C2C2C] px-10 py-7 text-lg font-normal shadow-lg shadow-[#C5A059]/20 hover:shadow-[#C5A059]/40 hover:-translate-y-0.5 transition-all border border-[#C5A059]"
          >
            Download the App
          </Button>
          <p className="text-sm text-[#2C2C2C]/50 mt-4">
            Available on iOS and Android
          </p>
        </motion.div>
      </div>
      {DialogComponent}
    </section>
  );
}
