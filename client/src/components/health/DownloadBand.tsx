/**
 * "Take the network with you." — the download band above the footer.
 *
 * Warm stone plane, real screenshots, and a QR on desktop. The QR is a static
 * SVG generated at authoring time rather than fetched from a QR service: a
 * third-party image request in the last band of every page, for a code that
 * never changes, is a dependency bought for nothing.
 */
import { motion, useReducedMotion } from "framer-motion";
import { SiApple } from "react-icons/si";
import { DUR, EASE, StampHeading } from "@/components/motion";
import {
  APP_QR_SRC,
  APP_SCREENS,
  APP_STORE_URL,
  GOOGLE_PLAY_URL,
} from "@/data/app-assets";
import { track } from "@/lib/analytics";

/** Two phones and a tablet-ish third, fanned. */
const FAN = [
  { screen: APP_SCREENS[0], rotate: -7, x: -104, y: 18, z: 1, scale: 0.92 },
  { screen: APP_SCREENS[2], rotate: 0, x: 0, y: 0, z: 3, scale: 1 },
  { screen: APP_SCREENS[6], rotate: 7, x: 104, y: 18, z: 2, scale: 0.92 },
];

function StoreButton({
  href,
  primary,
  secondary,
  children,
}: {
  href: string;
  primary: string;
  secondary: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("download_app_clicked", { surface: "homepage" })}
      className="flex items-center gap-3 rounded-xl bg-sakred-espresso px-5 py-3 text-white transition-transform duration-micro hover:-translate-y-0.5"
    >
      {children}
      <span className="text-left">
        <span className="block text-[10px] leading-tight opacity-75">{secondary}</span>
        <span className="block text-base font-semibold leading-tight">{primary}</span>
      </span>
    </a>
  );
}

export function DownloadBand() {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-sakred-stone/70 py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-sakred-gold-deep">
            iOS &amp; Android
          </p>
          <StampHeading
            as="h2"
            text="Take the network"
            accent="with you."
            className="font-display text-3xl leading-tight tracking-tight text-sakred-espresso sm:text-4xl"
          />
          <p className="mt-4 max-w-md text-base leading-relaxed text-sakred-ink/70">
            Discover care, follow protocols, access your policies, learn and connect —
            wherever you are.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <StoreButton href={APP_STORE_URL} secondary="Download on the" primary="App Store">
              <SiApple className="h-7 w-7 shrink-0" aria-hidden="true" />
            </StoreButton>
            <StoreButton href={GOOGLE_PLAY_URL} secondary="GET IT ON" primary="Google Play">
              <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0 fill-current" aria-hidden="true">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
            </StoreButton>

            {/* Desktop only: a QR is useless on the device you'd scan it with. */}
            <div className="hidden items-center gap-3 rounded-xl border border-sakred-espresso/15 bg-sakred-surface px-4 py-3 lg:flex">
              <img
                src={APP_QR_SRC}
                alt="QR code linking to sakredhealth.com/app"
                width={56}
                height={56}
                loading="lazy"
                className="h-14 w-14"
              />
              <span className="max-w-[7rem] text-xs leading-snug text-sakred-ink/60">
                Scan to open on your phone
              </span>
            </div>
          </div>
        </div>

        {/* ---- the fan ---- */}
        <div className="relative h-[26rem] sm:h-[30rem]">
          <div
            className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sakred-gold/20 blur-3xl"
            aria-hidden="true"
          />
          {FAN.map((item, index) => (
            <motion.div
              key={item.screen.label}
              initial={reduced ? false : { opacity: 0, y: 40, rotate: item.rotate - 6 }}
              whileInView={{ opacity: 1, y: item.y, rotate: item.rotate }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: DUR.reveal, ease: EASE, delay: 0.1 + index * 0.12 }}
              style={{ x: item.x, zIndex: item.z, scale: item.scale }}
              className="absolute left-1/2 top-1/2 -ml-[7.5rem] -mt-[15rem] w-60"
            >
              <div className="overflow-hidden rounded-[2rem] border-4 border-sakred-espresso/85 bg-sakred-espresso shadow-[0_30px_60px_-30px_rgba(28,26,23,0.7)]">
                <img
                  src={item.screen.image}
                  alt={item.screen.alt}
                  loading="lazy"
                  decoding="async"
                  className="block w-full"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
