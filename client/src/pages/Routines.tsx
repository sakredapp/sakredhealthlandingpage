import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronDown } from "lucide-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDownloadDialog } from "@/components/landing/DownloadDialog";

interface Routine {
  id: string;
  name: string;
  duration: string;
  tier: "free" | "premium";
  category: string;
  whoItsFor: string;
  expectedResults: string[];
  keyBenefits: string[];
  intensityLevels: string;
  wellnessFocus: string[];
  description: string;
}

const routines: Routine[] = [
  // FREE FOUNDATION ROUTINES
  {
    id: "hydration-energy-reset",
    name: "Hydration & Energy Reset",
    duration: "21 days",
    tier: "free",
    category: "Foundation",
    whoItsFor: "Anyone beginning their wellness journey, experiencing fatigue, or wanting to build the essential foundation that supports every other system in the body.",
    expectedResults: [
      "Improved cellular hydration and function",
      "More stable energy throughout the day",
      "Reduced afternoon fatigue and brain fog",
      "Better mineral balance and electrolyte levels"
    ],
    keyBenefits: [
      "Establishes the foundation all other routines build upon",
      "Simple habits anyone can start today",
      "Gentle enough for complete beginners",
      "Sets the stage for deeper wellness work"
    ],
    intensityLevels: "Lite intensity only - designed to build consistency without overwhelm",
    wellnessFocus: ["Hydration", "Minerals", "Energy"],
    description: "A 21-day foundation to steady energy and focus. This foundational routine focuses on proper hydration and mineral replenishment - the first step in whole-body wellness. Every other system in your body depends on proper hydration."
  },
  {
    id: "calm-sleep-starter",
    name: "Calm Sleep Starter",
    duration: "14 days",
    tier: "free",
    category: "Foundation",
    whoItsFor: "Those experiencing poor sleep quality, difficulty winding down, or wanting a structured evening rhythm for deeper, more restorative rest.",
    expectedResults: [
      "Deeper, more consistent sleep quality",
      "Easier time winding down in the evening",
      "Reduced racing thoughts before bed",
      "More refreshed feeling upon waking"
    ],
    keyBenefits: [
      "Builds a consistent evening wind-down rhythm",
      "Simple breathwork and wind-down practices",
      "Supports natural circadian clock",
      "Creates foundation for recovery and renewal"
    ],
    intensityLevels: "Lite intensity - gentle evening practices for better sleep",
    wellnessFocus: ["Sleep", "Nervous System", "Recovery"],
    description: "A 14-day evening rhythm for deeper sleep. This routine combines electrolyte support, screen management, breathwork, and reflection to help your body transition smoothly into restful, restorative sleep."
  },

  // PREMIUM ROUTINES - COGNITIVE
  {
    id: "boost-focus-mental-energy-lite",
    name: "Boost Focus & Mental Energy (Lite)",
    duration: "28 days",
    tier: "premium",
    category: "Cognitive",
    whoItsFor: "Professionals, students, or anyone wanting to sharpen concentration and sustain mental stamina without overstimulation.",
    expectedResults: [
      "Calm, long-lasting focus without jitters",
      "Sustained mental clarity throughout the day",
      "Improved memory and recall",
      "Reduced need for caffeine and stimulants"
    ],
    keyBenefits: [
      "Foundation habits for mental clarity",
      "Supports electrolyte and light balance for neural signaling",
      "Supports clean energy to the brain",
      "Builds sustainable cognitive habits"
    ],
    intensityLevels: "Lite - foundation habits for mental clarity",
    wellnessFocus: ["Hydration", "Minerals", "Nervous System", "Light Exposure"],
    description: "Foundation habits for mental clarity. Focus fades when hydration, minerals, and sunlight rhythm are off. This routine supports electrolyte balance and optimizes light exposure for sustained mental energy."
  },
  {
    id: "boost-focus-mental-energy-intense",
    name: "Boost Focus & Mental Energy (Intense)",
    duration: "28 days",
    tier: "premium",
    category: "Cognitive",
    whoItsFor: "Those ready for advanced focus enhancement with nootropic and herbal support alongside foundational habits.",
    expectedResults: [
      "Enhanced cognitive performance",
      "Deeper, sustained focus sessions",
      "Improved mental stamina",
      "Reduced brain fatigue"
    ],
    keyBenefits: [
      "Advanced focus enhancement protocol",
      "Nootropic and herbal support stack",
      "Liver support for mental clarity",
      "Dopamine hygiene practices"
    ],
    intensityLevels: "Intense - advanced focus enhancement protocol",
    wellnessFocus: ["Cognitive", "Liver Support", "Nervous System"],
    description: "Advanced focus enhancement protocol. Builds on foundational habits with nootropic support, liver flow herbs, and dopamine hygiene practices for peak mental performance."
  },
  {
    id: "clear-mental-fog-lite",
    name: "Clear Mental Fog (Lite)",
    duration: "28 days",
    tier: "premium",
    category: "Cognitive",
    whoItsFor: "Those experiencing persistent brain fog, sluggish thinking, difficulty finding words, or feeling mentally 'cloudy' regardless of sleep.",
    expectedResults: [
      "Noticeable mental clarity",
      "Sharper recall and word-finding",
      "Lifted brain fog and clearer thinking",
      "Improved energy and focus"
    ],
    keyBenefits: [
      "Supports metabolic waste clearance",
      "Improves circulation and oxygen exchange",
      "Supports gentle renewal pathways",
      "Calms the nervous system for better processing"
    ],
    intensityLevels: "Lite - foundation habits for clearing brain fog",
    wellnessFocus: ["Reset", "Hydration", "Circulation"],
    description: "Clear brain fog with foundation habits. Brain fog forms when oxygen and metabolic waste exchange slow down. This routine supports re-hydration with minerals, gentle renewal, and proper circulation so clarity can return naturally."
  },
  {
    id: "clear-mental-fog-intense",
    name: "Clear Mental Fog (Intense)",
    duration: "28 days",
    tier: "premium",
    category: "Cognitive",
    whoItsFor: "Those ready for a deeper mental clarity reset with advanced mineral mobilization and neural circulation support.",
    expectedResults: [
      "Deep mental clarity reset",
      "Improved neural circulation",
      "Enhanced cognitive processing",
      "Better sleep environment for recovery"
    ],
    keyBenefits: [
      "Advanced mineral mobilization support",
      "Neural circulation movement practices",
      "Optimized sleep environment protocol",
      "Binding support for metabolic waste"
    ],
    intensityLevels: "Intense - deep mental clarity reset protocol",
    wellnessFocus: ["Mineral Balance", "Circulation", "Sleep", "Reset"],
    description: "Deep mental clarity reset protocol. Uses advanced mineral support, neural circulation movement, and optimized sleep environment practices for comprehensive cognitive renewal."
  },

  // PREMIUM ROUTINES - DIGESTIVE
  {
    id: "gut-calm-bloat-relief",
    name: "Gut Calm & Bloat Relief",
    duration: "28 days",
    tier: "premium",
    category: "Digestive",
    whoItsFor: "Those suffering from chronic bloating, gas, digestive discomfort, or irregular bowel movements that affect daily comfort.",
    expectedResults: [
      "Fast relief from bloating and gas",
      "More regular, comfortable elimination",
      "Reduced fermentation and discomfort",
      "Lighter, more comfortable feeling"
    ],
    keyBenefits: [
      "Supports healthy digestive movement",
      "Mindful eating practices",
      "Proper meal spacing for full digestion",
      "Gentle post-meal movement support"
    ],
    intensityLevels: "Lite - gentle approach for sensitive systems",
    wellnessFocus: ["Digestion", "Gut Support", "Motility"],
    description: "Reduce bloating and digestive discomfort. Sluggish digestion traps fermentation waste, creating bloating and discomfort. This routine supports natural movement and comfort through ginger, mindful eating, and meal spacing."
  },
  {
    id: "gut-reset-motility",
    name: "Gut Reset & Motility Reset Protocol",
    duration: "28 days",
    tier: "premium",
    category: "Digestive",
    whoItsFor: "Anyone wanting smooth digestion, better nutrient absorption, and the energizing feeling that comes from food properly nourishing your body.",
    expectedResults: [
      "Comfortable digestion without bloating",
      "More energy after meals, not less",
      "Improved nutrient absorption",
      "More regular, comfortable elimination"
    ],
    keyBenefits: [
      "Supports healthy gut motility",
      "Gradual fiber optimization",
      "Optimal elimination posture guidance",
      "Magnesium support for regularity"
    ],
    intensityLevels: "Lite - adapted to your digestive sensitivity",
    wellnessFocus: ["Digestion", "Motility", "Gut Support"],
    description: "Restore healthy gut motility. Food should energize, not bloat. This routine supports smooth digestion through proper fiber balance, magnesium support, and movement practices."
  },
  {
    id: "full-gut-reset",
    name: "Full Gut Reset & Circulation",
    duration: "28 days",
    tier: "premium",
    category: "Digestive",
    whoItsFor: "Those needing comprehensive gut support, or anyone with stubborn gut concerns requiring a full reset of motility and microbiome.",
    expectedResults: [
      "Reset gut motility and function",
      "Rebalanced gut flora",
      "Improved waste elimination",
      "Supported healthy digestion"
    ],
    keyBenefits: [
      "Comprehensive gut support protocol",
      "Digestive bitters and enzyme support",
      "Soil-based probiotic replenishment",
      "Gut-brain stress reset practices"
    ],
    intensityLevels: "Lite to Intense - comprehensive gut reset protocol",
    wellnessFocus: ["Digestion", "Gut Support", "Probiotics", "Elimination"],
    description: "Comprehensive gut support protocol. Uses digestive bitters, enzymes, probiotics, and gut-lining nutrients to support full digestive renewal. Includes gut-brain stress reset for nervous system support."
  },

  // PREMIUM ROUTINES - EMOTIONAL
  {
    id: "boost-mood-resilience",
    name: "Boost Mood & Stress Resilience",
    duration: "28 days",
    tier: "premium",
    category: "Emotional",
    whoItsFor: "Those wanting to elevate mood, build stress tolerance, and create sustainable emotional balance naturally.",
    expectedResults: [
      "Stable energy and relaxed drive",
      "Elevated, balanced mood",
      "Better stress tolerance",
      "Greater sense of calm wellbeing"
    ],
    keyBenefits: [
      "Supports mineral balance affecting mood",
      "Adaptogenic support for stress",
      "Essential fatty acid supplementation",
      "Evening calming support"
    ],
    intensityLevels: "Lite - gentle, supportive practices",
    wellnessFocus: ["Nervous System", "Nutrition", "Sleep", "Adaptogens"],
    description: "Build emotional balance and stress resilience. Mood depends on minerals, sleep, and adaptogenic support. This routine addresses these foundational factors for stable energy and resilient emotional balance."
  },

  // PREMIUM ROUTINES - IMMUNE
  {
    id: "calm-allergies-immunity",
    name: "Calm Allergies & Strengthen Immunity",
    duration: "28 days",
    tier: "premium",
    category: "Immune",
    whoItsFor: "Those with seasonal allergies, food sensitivities, or wanting to build stronger immune tolerance naturally.",
    expectedResults: [
      "Reduced allergic reactivity",
      "Stronger, more balanced immune response",
      "Clearer breathing and less congestion",
      "Better seasonal comfort"
    ],
    keyBenefits: [
      "Natural antihistamine support (quercetin + nettle)",
      "Immune modulation with black seed oil",
      "Nasal breathing practice",
      "Mineral and chlorophyll support"
    ],
    intensityLevels: "Lite - adapted to immune sensitivity",
    wellnessFocus: ["Immune", "Gut Support", "Hydration"],
    description: "Reduce allergies and support immune function. This routine strengthens your internal resilience and supports healthy immune response for reduced reactivity and comfortable breathing."
  },
  {
    id: "clear-sinus-histamine",
    name: "Clear Sinus & Histamine Overload",
    duration: "28 days",
    tier: "premium",
    category: "Immune",
    whoItsFor: "Those with chronic congestion, sinus concerns, histamine sensitivity, or responses affecting breathing and comfort.",
    expectedResults: [
      "Light, clear breathing",
      "Reduced sinus congestion and pressure",
      "Lower histamine reactivity",
      "Greater comfort and ease"
    ],
    keyBenefits: [
      "Enzyme support for mucus management",
      "Nasal rinse protocols",
      "Liver support for histamine processing",
      "Natural antimicrobial support"
    ],
    intensityLevels: "Lite to Intense - gentle clearing approach",
    wellnessFocus: ["Circulation Support", "Immune", "Respiratory"],
    description: "Reduce sinus congestion and histamine. Congestion occurs when circulation slows and histamine builds up. This routine supports liver function and lowers histamine burden for clear, comfortable breathing."
  },

  // PREMIUM ROUTINES - METABOLIC
  {
    id: "anti-cravings-simplified",
    name: "Anti-Cravings Simplified",
    duration: "28 days",
    tier: "premium",
    category: "Metabolic",
    whoItsFor: "People trying to lose stubborn fat. Someone who's not fully confident yet in a full gut or digestive stability reset protocol. Anyone who could use a boost of focus or an uplift in mood.",
    expectedResults: [
      "Better control of your diet",
      "Reduced sugar and carb dependency",
      "Improved mental clarity",
      "Easier weight management"
    ],
    keyBenefits: [
      "Entry-level digestive support approach",
      "Supports dietary control without drastic changes",
      "Mental clarity and mood uplift",
      "No lifestyle overhaul required"
    ],
    intensityLevels: "Lite - entry level, bare minimum approach",
    wellnessFocus: ["Digestive Stability", "Metabolic", "Mood"],
    description: "Entry level digestive support to reset dietary control and start feeling better mental clarity, without changing anything else in your life."
  },
  {
    id: "cravings-control-appetite",
    name: "Cravings Control & Appetite Reset",
    duration: "28 days",
    tier: "premium",
    category: "Metabolic",
    whoItsFor: "Anyone dealing with unstable appetite, energy dips after meals, blood sugar swings, or wanting to retrain their hunger signals naturally.",
    expectedResults: [
      "Steady energy without crashes",
      "Stable appetite and reduced cravings",
      "Better blood sugar regulation",
      "Healthier relationship with food"
    ],
    keyBenefits: [
      "Protein-first breakfast protocol",
      "Mineral stabilization for appetite",
      "Apple cider vinegar pre-meal support",
      "Stress downshift practices"
    ],
    intensityLevels: "Lite - customized to your metabolic needs",
    wellnessFocus: ["Metabolic", "Digestion", "Blood Sugar", "Nutrition"],
    description: "Master cravings and reset appetite signals. Cravings are communication signals - not willpower failures. This routine retrains your hunger through blood-sugar support and mineral balance for steady, sustainable energy."
  },
  {
    id: "blood-sugar-energy",
    name: "Blood Sugar & Energy Stability",
    duration: "28 days",
    tier: "premium",
    category: "Metabolic",
    whoItsFor: "Those with energy dips, afternoon crashes, or wanting steadier energy through better blood sugar management.",
    expectedResults: [
      "Stable blood sugar throughout the day",
      "Fewer energy crashes",
      "More consistent focus and productivity",
      "Reduced need for sugar and stimulants"
    ],
    keyBenefits: [
      "Blood-sugar balanced snacking",
      "Post-meal movement practices",
      "Optional glucose support supplementation",
      "Sustainable energy without stimulants"
    ],
    intensityLevels: "Lite to Intense - adapted to your needs",
    wellnessFocus: ["Metabolic", "Energy", "Blood Sugar"],
    description: "Stabilize blood sugar for steady energy. Supports consistent energy levels through balanced snacking, post-meal movement, and optional supplementation."
  },

  // PREMIUM ROUTINES - SKIN
  {
    id: "reset-skin-breakouts",
    name: "Reset Skin & Reduce Breakouts",
    duration: "28 days",
    tier: "premium",
    category: "Skin",
    whoItsFor: "Those with acne, dull complexion, skin congestion, or breakouts that indicate sluggish internal renewal pathways.",
    expectedResults: [
      "Clearer, more balanced complexion",
      "Reduced breakouts and blemishes",
      "Less skin congestion",
      "Healthier skin from the inside out"
    ],
    keyBenefits: [
      "Supports lymphatic circulation (dry brushing)",
      "Chlorophyll support for internal renewal",
      "Addresses internal factors behind breakouts",
      "Promotes healthy elimination"
    ],
    intensityLevels: "Lite - gentle reset approach",
    wellnessFocus: ["Reset", "Circulation Support", "Lymph", "Gut Support"],
    description: "Clear skin through internal renewal support. Skin congestion equals sluggish lymph and circulation. This routine supports the internal pathways that contribute to clearer, healthier skin."
  },
  {
    id: "enhance-skin-glow",
    name: "Enhance Skin Glow & Complexion",
    duration: "28 days",
    tier: "premium",
    category: "Skin",
    whoItsFor: "Anyone wanting brighter, more radiant skin, even tone, and the healthy glow that comes from proper internal hydration and nourishment.",
    expectedResults: [
      "Radiant, even skin tone",
      "Improved skin hydration from within",
      "Brighter, more youthful complexion",
      "Healthier skin texture"
    ],
    keyBenefits: [
      "Collagen peptide support",
      "Whole food vitamin C for antioxidant support",
      "Internal and external hydration protocol",
      "Building blocks for skin renewal"
    ],
    intensityLevels: "Lite - foundational approach to skin wellness",
    wellnessFocus: ["Hydration", "Nutrition", "Lymph", "Regeneration"],
    description: "Build radiant skin from within. Skin wellness reflects internal hydration and nutrition quality. This routine nourishes your skin through optimal hydration, collagen support, and the nutrients your skin needs to glow."
  },

  // PREMIUM ROUTINES - ADVANCED RESET
  {
    id: "digestive-stability-protocol",
    name: "Digestive Stability Protocol",
    duration: "30 days",
    tier: "premium",
    category: "Advanced Reset",
    whoItsFor: "Anyone experiencing fatigue, brain fog, bloating, stress, or emotional swings. Individuals with sugar cravings or digestive irregularity. Those who have never done a structured digestive stability protocol. Health-conscious individuals seeking internal maintenance, not extremes.",
    expectedResults: [
      "Improved digestive stability",
      "Reduced microbial imbalance",
      "Better gut clarity and comfort",
      "Supported nervous system regulation"
    ],
    keyBenefits: [
      "Core digestive stability reset protocol",
      "Supports gut clarity and nervous system regulation",
      "Structured, system-aware approach",
      "Long-term digestive maintenance"
    ],
    intensityLevels: "Lite to Intense - comprehensive digestive stability protocol",
    wellnessFocus: ["Digestive Stability", "Gut Support", "Nervous System", "Elimination"],
    description: "The foundational Sakred digestive stability reset protocol designed to support digestive balance, nervous system regulation, and waste elimination efficiency. This is the core protocol for long-term internal maintenance."
  },
  {
    id: "mineral-balance-protocol",
    name: "Mineral Balance Protocol",
    duration: "60 days",
    tier: "premium",
    category: "Advanced Reset",
    whoItsFor: "Those with suspected mineral imbalances affecting brain, thyroid, or liver function who have completed digestive stability protocol and are ready for deeper work.",
    expectedResults: [
      "Reduced mineral imbalance burden",
      "Improved brain and thyroid function support",
      "Better liver processing capacity",
      "Mineral balance restoration"
    ],
    keyBenefits: [
      "Safely mobilizes mineral imbalances from tissues",
      "Binding support for proper elimination",
      "Prevents redistribution through mineral replenishment",
      "Liver support throughout the process"
    ],
    intensityLevels: "Intense - requires completion of digestive stability protocol first",
    wellnessFocus: ["Mineral Balance", "Liver Support", "Circulation Support"],
    description: "Safely support mineral balance and eliminate imbalances that may impair brain, thyroid, and liver function. Uses mobilization, binding support, and mineral replenishment. Best after digestive stability protocol."
  },
  {
    id: "lymphatic-circulatory-reset",
    name: "Lymphatic & Circulatory Reset Protocol",
    duration: "28 days",
    tier: "premium",
    category: "Advanced Reset",
    whoItsFor: "Those with stagnant fluids, poor circulation, lymphatic congestion, or wanting to enhance circulation between major reset protocols.",
    expectedResults: [
      "Improved lymph flow and circulation",
      "Better circulation and oxygenation",
      "Reduced fluid stagnation",
      "Enhanced tissue renewal"
    ],
    keyBenefits: [
      "Dry brushing for lymph stimulation",
      "Rebounding for lymph movement",
      "Herbal lymph support",
      "Contrast showers for circulation"
    ],
    intensityLevels: "Lite to Intense - can be done between reset protocols",
    wellnessFocus: ["Lymph", "Circulation", "Circulation Support", "Reset"],
    description: "Support lymph flow and circulation. Lymph is the body's circulation highway. This protocol uses movement, temperature contrast, and targeted support to keep lymph clear and moving."
  },
];

const categories = [
  { name: "All Routines", filter: null },
  { name: "Foundation", filter: "Foundation" },
  { name: "Cognitive", filter: "Cognitive" },
  { name: "Metabolic", filter: "Metabolic" },
  { name: "Digestive", filter: "Digestive" },
  { name: "Immune", filter: "Immune" },
  { name: "Skin", filter: "Skin" },
  { name: "Emotional", filter: "Emotional" },
  { name: "Advanced Reset", filter: "Advanced Reset" },
];

function RoutineCard({ routine, isExpanded, onToggle, onDownload }: { routine: Routine; isExpanded: boolean; onToggle: () => void; onDownload: () => void }) {
  return (
    <Card className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-0">
      <button
        onClick={onToggle}
        className="w-full p-6 text-left flex items-start gap-4 hover-elevate"
        data-testid={`button-routine-${routine.id}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-xl font-display font-normal text-[#0F172A]">
              {routine.name}
            </h3>
            <Badge
              variant="secondary"
              className={routine.tier === "free" 
                ? "bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30" 
                : "bg-gradient-to-r from-[#C5A059] to-[#EBD598] text-[#0F172A]"
              }
            >
              {routine.tier === "free" ? "Free" : "Premium"}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#0F172A]/60 mb-2">
            <span>{routine.duration}</span>
            <span className="w-1 h-1 rounded-full bg-[#0F172A]/30" />
            <span>{routine.category}</span>
          </div>
          <p className="text-[#0F172A]/70 text-sm line-clamp-2">{routine.description}</p>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 mt-1"
        >
          <ChevronDown className="w-5 h-5 text-[#C5A059]" />
        </motion.div>
      </button>
      
      <motion.div
        initial={false}
        animate={{ 
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6 pt-2 border-t border-stone-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-display font-normal text-[#0F172A] mb-3">Who It's For</h4>
              <p className="text-sm text-[#0F172A]/70 leading-relaxed">{routine.whoItsFor}</p>
            </div>
            
            <div>
              <h4 className="font-display font-normal text-[#0F172A] mb-3">Intensity Levels</h4>
              <p className="text-sm text-[#0F172A]/70 leading-relaxed">{routine.intensityLevels}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h4 className="font-display font-normal text-[#0F172A] mb-3">Expected Results</h4>
              <ul className="space-y-2">
                {routine.expectedResults.map((result, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#0F172A]/70">
                    <span className="w-4 h-4 rounded-full bg-[#C5A059] flex items-center justify-center text-[#0F172A] text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                    {result}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-display font-normal text-[#0F172A] mb-3">Key Benefits</h4>
              <ul className="space-y-2">
                {routine.keyBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#0F172A]/70">
                    <span className="w-4 h-4 rounded-full bg-[#C5A059] flex items-center justify-center text-[#0F172A] text-xs font-bold flex-shrink-0 mt-0.5">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-display font-normal text-[#0F172A] mb-3">Wellness Focus</h4>
            <div className="flex flex-wrap gap-2">
              {routine.wellnessFocus.map((focus) => (
                <Badge
                  key={focus}
                  variant="outline"
                  className="border-[#C5A059]/30 text-[#C5A059] bg-[#C5A059]/5"
                >
                  {focus}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-stone-100">
            <Button
              onClick={onDownload}
              className="rounded-full btn-gold-gradient shadow-lg shadow-[#C5A059]/20"
              data-testid={`button-start-routine-${routine.id}`}
            >
              {routine.tier === "free" ? "Download Free" : "Get Premium Access"}
            </Button>
          </div>
        </div>
      </motion.div>
    </Card>
  );
}

export default function Routines() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { openDialog, DialogComponent } = useDownloadDialog();
  
  const filteredRoutines = selectedCategory 
    ? routines.filter(r => r.category === selectedCategory)
    : routines;
  
  const freeRoutines = filteredRoutines.filter(r => r.tier === "free");
  const premiumRoutines = filteredRoutines.filter(r => r.tier === "premium");
  
  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      <Navigation />
      
      <main className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="w-12 h-1 bg-gradient-to-r from-[#C5A059] to-[#EBD598] mx-auto mb-6" />
            <h1 className="text-4xl sm:text-5xl font-display font-normal text-[#0F172A] mb-4">
              Wellness{" "}
              <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
                Routines
              </span>
            </h1>
            <p className="text-lg text-[#0F172A]/70 max-w-3xl mx-auto mb-6">
              Structured programs designed to support your internal wellness - from digestive stability and metabolic reset 
              to nervous system regulation and hormonal balance. Each routine follows our foundational 
              approach, ensuring your body is properly supported for lasting results.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/60 backdrop-blur-md rounded-2xl p-6 mb-12 border border-[#C5A059]/20"
          >
            <h2 className="text-xl font-display font-normal text-[#0F172A] mb-4 text-center">
              The Foundational Approach
            </h2>
            <p className="text-[#0F172A]/70 text-center mb-6 max-w-3xl mx-auto">
              Unlike quick fixes, our routines follow a specific sequence for safety and lasting results. 
              We always establish foundational wellness before introducing advanced practices.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "1. Hydration + Minerals",
                "2. Digestion Support", 
                "3. Nervous System",
                "4. Movement",
                "5. Metabolic Reset",
                "6. Regeneration"
              ].map((step, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="border-[#C5A059] text-[#0F172A] bg-[#C5A059]/10 px-4 py-2"
                >
                  {step}
                </Badge>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {categories.map((cat) => (
              <Badge
                key={cat.name}
                variant={selectedCategory === cat.filter ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 ${
                  selectedCategory === cat.filter
                    ? "bg-gradient-to-r from-[#C5A059] to-[#EBD598] text-[#0F172A] border-0"
                    : "border-stone-300 text-[#0F172A]/70 hover:border-[#C5A059]"
                }`}
                onClick={() => setSelectedCategory(cat.filter)}
                data-testid={`button-category-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {cat.name}
              </Badge>
            ))}
          </motion.div>
          
          {freeRoutines.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-display font-normal text-[#0F172A] mb-6">
                Free Foundational Routines
              </h2>
              <p className="text-[#0F172A]/70 mb-6">
                Start your wellness journey with these essential routines - no payment required.
              </p>
              <div className="space-y-4">
                {freeRoutines.map((routine) => (
                  <RoutineCard
                    key={routine.id}
                    routine={routine}
                    isExpanded={expandedId === routine.id}
                    onToggle={() => setExpandedId(expandedId === routine.id ? null : routine.id)}
                    onDownload={openDialog}
                  />
                ))}
              </div>
            </motion.div>
          )}
          
          {premiumRoutines.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-2xl font-display font-normal text-[#0F172A] mb-6">
                Premium Wellness Routines
              </h2>
              <p className="text-[#0F172A]/70 mb-6">
                Guided reset protocols with advanced analytics, step-by-step daily guidance, and personalized support.
              </p>
              <div className="space-y-4">
                {premiumRoutines.map((routine) => (
                  <RoutineCard
                    key={routine.id}
                    routine={routine}
                    isExpanded={expandedId === routine.id}
                    onToggle={() => setExpandedId(expandedId === routine.id ? null : routine.id)}
                    onDownload={openDialog}
                  />
                ))}
              </div>
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 text-center"
          >
            <p className="text-[#0F172A]/60 text-sm mb-6">
              All routines include step-by-step daily guidance, habit tracking, and progress analytics
            </p>
            <Link href="/">
              <Button
                variant="outline"
                className="rounded-full border-[#C5A059] text-[#0F172A] hover:bg-[#C5A059]/10"
                data-testid="button-back-home"
              >
                Back to Home
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
      {DialogComponent}
    </div>
  );
}
