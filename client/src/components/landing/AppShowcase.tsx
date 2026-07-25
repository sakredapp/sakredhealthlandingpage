import { motion } from "framer-motion";

// App screenshots hosted in Supabase Storage (public bucket "appdemoscreenshots").
// Swapping an image = replace the URL; add/remove a screen = edit this array.
const BUCKET =
  "https://auth.sakredhealth.com/storage/v1/object/public/appdemoscreenshots";

const screenshots = [
  { image: `${BUCKET}/homescreen%20.jpeg`, label: "Home Dashboard" },
  { image: `${BUCKET}/todays%20habits.jpeg`, label: "Today's Habits" },
  { image: `${BUCKET}/routine%20and%20habit%20tracker%20.jpeg`, label: "Habit Tracker" },
  { image: `${BUCKET}/routine%20outline%20.jpeg`, label: "Routine Walkthrough" },
  { image: `${BUCKET}/library%20overview%20.jpeg`, label: "Library & Community" },
  { image: `${BUCKET}/real%20foods%20market%20.jpeg`, label: "Shop" },
  { image: `${BUCKET}/policy%20portal%20.jpeg`, label: "Policy Portal" },
];

export function AppShowcase() {
  return (
    <section className="py-12 lg:py-20 bg-[#F9F9F7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide lg:justify-center">
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
              <p className="text-center text-xs text-[#2C2C2C]/55 mt-2">{screenshot.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
