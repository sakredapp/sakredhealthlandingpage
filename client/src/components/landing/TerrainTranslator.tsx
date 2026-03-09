import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDownloadDialog } from "./DownloadDialog";

const features = [
  {
    title: "Foundational Analysis",
    description: "Discover the underlying factors that may be contributing to how you feel",
  },
  {
    title: "What's Happening Inside",
    description: "Clear explanation of the body systems and lifestyle factors at play",
  },
  {
    title: "3 Key Variables",
    description: "The most important factors to focus on for your wellness goals",
  },
  {
    title: "Routine Recommendations",
    description: "Personalized wellness programs matched to your needs",
  },
];

const exampleConditions = [
  "Low Energy",
  "Brain Fog",
  "Digestive Discomfort",
  "Hormonal Balance",
  "Sleep Quality",
  "Stress Response",
];

export function TerrainTranslator() {
  const { openDialog, DialogComponent } = useDownloadDialog();

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-[#F9F9F7] to-[#F6F4EF] relative overflow-hidden">
      <motion.div
        className="absolute top-10 right-10 w-64 h-64 bg-[#C5A059]/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-10 left-10 w-80 h-80 bg-[#EBD598]/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 0.9, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/30 px-4 py-1.5 text-sm font-medium">
            Free With Your Account
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-normal text-[#0F172A] mb-4">
            Wellness{" "}
            <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
              Insight Tool
            </span>
          </h2>
          <p className="text-xl text-[#0F172A]/80 max-w-2xl mx-auto mb-2">
            Understand the bigger picture, not just individual concerns
          </p>
          <p className="text-lg text-[#0F172A]/60 max-w-3xl mx-auto">
            Enter any wellness concern and get instant insights through a whole-body wellness lens - 
            helping you understand the factors that may be contributing to how you feel.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-[0_4px_30px_-3px_rgba(197,160,89,0.15)] border border-[#C5A059]/20">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h3 className="text-2xl font-display font-normal text-[#0F172A] mb-4">
                  How It Works
                </h3>
                <p className="text-[#0F172A]/70 mb-6 leading-relaxed">
                  Simply enter any wellness concern - like "low energy," "digestive discomfort," 
                  or "brain fog" - and get an instant whole-body analysis that goes beyond surface-level concerns.
                </p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {exampleConditions.map((condition) => (
                    <Badge
                      key={condition}
                      variant="outline"
                      className="border-[#C5A059]/40 text-[#0F172A]/70 bg-[#C5A059]/5 px-3 py-1"
                    >
                      {condition}
                    </Badge>
                  ))}
                </div>

                <Button
                  onClick={openDialog}
                  size="lg"
                  className="rounded-full btn-gold-gradient text-[#0F172A] px-8 py-6 text-lg font-normal shadow-lg shadow-[#C5A059]/30 hover:-translate-y-0.5 transition-transform"
                  data-testid="button-try-translator"
                >
                  Download the App
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  >
                    <Card className="bg-[#F9F9F7] rounded-2xl p-5 h-full border-0 shadow-sm">
                      <h4 className="font-display font-normal text-[#0F172A] mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-[#0F172A]/60 leading-relaxed">
                        {feature.description}
                      </p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <p className="text-[#0F172A]/60 text-sm">
            Focused on your body's internal environment and whole-body wellness rather than isolated concerns
          </p>
        </motion.div>
      </div>
      {DialogComponent}
    </section>
  );
}
