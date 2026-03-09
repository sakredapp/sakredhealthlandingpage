import { motion } from "framer-motion";
import homeScreenImg from "@assets/IMG_6822_1771471874439.jpg";
import routinesImg from "@assets/IMG_6823_1771471874438.jpg";
import portalImg from "@assets/IMG_6824_1771471874439.jpg";
import membersImg from "@assets/IMG_6825_1771471874439.jpg";
import wearablesImg from "@assets/IMG_6826_1771471874439.jpg";

const screenshots = [
  {
    image: portalImg,
    label: "Healthcare Portal",
  },
  {
    image: membersImg,
    label: "Coverage & Support",
  },
  {
    image: homeScreenImg,
    label: "Home Dashboard",
  },
  {
    image: routinesImg,
    label: "Guided Routines",
  },
  {
    image: wearablesImg,
    label: "Wearable Integrations",
  },
];

export function AppShowcase() {
  return (
    <section className="py-12 lg:py-20 bg-[#F9F9F7]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <p className="text-sm font-medium uppercase tracking-wider text-[#C5A059] mb-3">Inside the App</p>
          <h2 className="text-3xl sm:text-4xl font-display font-normal text-[#2C2C2C] mb-4">
            See It in{" "}
            <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
              Action
            </span>
          </h2>
        </motion.div>

        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide sm:justify-center">
          {screenshots.map((screenshot, index) => (
            <motion.div
              key={screenshot.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="flex-shrink-0 snap-center w-[160px] sm:w-[150px]"
            >
              <div
                className="rounded-2xl overflow-hidden border-2 border-[#C5A059]/20 shadow-[0_4px_20px_rgba(197,160,89,0.12)] bg-white"
                data-testid={`card-screenshot-${index}`}
              >
                <img
                  src={screenshot.image}
                  alt={screenshot.label}
                  className="w-full h-auto block"
                  loading="lazy"
                  data-testid={`img-screenshot-${index}`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
