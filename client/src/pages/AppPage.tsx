/**
 * /app — full rewrite.
 *
 * The old page led with detox protocols, habit streaks and wearable sync,
 * which is the product Sakred used to be. This one leads with the five things
 * the app actually is now, in the app's own order:
 *
 *   Discover · Protocols · Community · Resources · Policies
 *
 * Specifically NOT leading with: detox, streaks, wearable syncing (brief §11).
 * Those things may still exist in the app, but they are features of the
 * protocol pillar, not the reason to download it.
 */
import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  BookOpen,
  Compass,
  MessagesSquare,
  Route,
  ShieldCheck,
} from "lucide-react";
import { SiApple } from "react-icons/si";
import { SiteLayout } from "@/components/site/SiteLayout";
import { AtlasCanvas } from "@/components/map/AtlasCanvas";
import {
  DUR,
  EASE,
  StampHeading,
  Reveal,
  StaggerChildren,
  StaggerItem,
  fadeUp,
} from "@/components/motion";
import {
  APP_QR_SRC,
  APP_SCREENS,
  APP_STORE_URL,
  GOOGLE_PLAY_URL,
} from "@/data/app-assets";
import { useSeo, SITE_URL } from "@/lib/seo";
import { track } from "@/lib/analytics";

/** The five pillars, in the app's own order. Discover is first, deliberately. */
const PILLARS = [
  {
    icon: Compass,
    title: "Discover",
    body: "Find trusted practitioners, practices and health resources near you — the same network the website maps, in your pocket, with the places you save kept between visits.",
  },
  {
    icon: Route,
    title: "Protocols",
    body: "Follow Sakred protocols, and — as the network fills in — the plans your own practitioner assigns. Sequenced day by day so guidance survives the drive home.",
  },
  {
    icon: MessagesSquare,
    title: "Community",
    body: "Ask who's worth seeing and answer for someone else. Real experiences from people who have already been, rather than anonymous star ratings.",
  },
  {
    icon: BookOpen,
    title: "Resources",
    body: "The library of guides and cited research, plus the Real Foods Market — what to eat, what to buy, and the specific reason behind each one.",
  },
  {
    icon: ShieldCheck,
    title: "Policies",
    body: "Eligible Sakred clients can see their coverage, documents and member IDs, and message their agent, without leaving the app.",
  },
];

const FAQ = [
  {
    q: "What does the app cost?",
    a: "The app is free to download and the network is free to search. Some resources and programs are part of a membership; you'll always see which is which before anything is charged.",
  },
  {
    q: "Do I need a Sakred insurance policy to use it?",
    a: "No. Discovery, protocols, community and resources are open to everyone. The Policies section only appears if you're a Sakred client with active coverage.",
  },
  {
    q: "Is my health information private?",
    a: "Your protocol activity and saved places are yours. We don't sell personal data, and we don't hand it to carriers or practitioners. Read the details in our privacy policy.",
  },
  {
    q: "Is Sakred Health a medical record?",
    a: "No. It organises guidance between appointments — it is not an EHR, it does not hold a clinical record, and nothing in it replaces advice from your practitioner.",
  },
];

function StoreButtons() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("download_app_clicked", { surface: "app_page" })}
        className="flex items-center gap-3 rounded-xl bg-sakred-espresso px-5 py-3 text-white transition-transform duration-micro hover:-translate-y-0.5"
      >
        <SiApple className="h-7 w-7 shrink-0" aria-hidden="true" />
        <span className="text-left">
          <span className="block text-[10px] leading-tight opacity-75">Download on the</span>
          <span className="block text-base font-semibold leading-tight">App Store</span>
        </span>
      </a>
      <a
        href={GOOGLE_PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("download_app_clicked", { surface: "app_page" })}
        className="flex items-center gap-3 rounded-xl bg-sakred-espresso px-5 py-3 text-white transition-transform duration-micro hover:-translate-y-0.5"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0 fill-current" aria-hidden="true">
          <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
        </svg>
        <span className="text-left">
          <span className="block text-[10px] leading-tight opacity-75">GET IT ON</span>
          <span className="block text-base font-semibold leading-tight">Google Play</span>
        </span>
      </a>
    </div>
  );
}

export default function AppPage() {
  const [activeScreen, setActiveScreen] = useState(0);

  useSeo({
    title: "The Sakred Health App — Find Care, Follow Protocols, Stay Connected",
    description:
      "Find trusted practitioners near you, follow care protocols between visits, learn from the community, and access your Sakred coverage — one app for iOS and Android.",
    canonical: "/app",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "MobileApplication",
      name: "Sakred Health",
      operatingSystem: "iOS, Android",
      applicationCategory: "HealthApplication",
      url: `${SITE_URL}/app`,
      description:
        "A trusted navigation layer for real-world health: discover practitioners and practices near you, follow care protocols, learn from the community, and access Sakred insurance coverage.",
      featureList: PILLARS.map((pillar) => pillar.title).join(", "),
      publisher: { "@type": "Organization", name: "Sakred Health", url: SITE_URL },
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  });

  return (
    <SiteLayout solidHeader>
      {/* ---- hero ---- */}
      <header className="relative overflow-hidden border-b border-sakred-stone bg-sakred-surface-alt">
        <div className="pointer-events-none absolute inset-0 opacity-35" aria-hidden="true">
          <AtlasCanvas className="h-full w-full" animated />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          <div>
            <motion.p
              {...fadeUp(0)}
              className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-sakred-gold-deep"
            >
              iOS &amp; Android · Free to download
            </motion.p>
            <StampHeading
              as="h1"
              text="Your health world,"
              accent="in one place."
              delay={0.08}
              className="font-display text-4xl leading-[1.06] tracking-tight text-sakred-espresso sm:text-5xl"
            />
            <motion.p
              {...fadeUp(0.3)}
              className="mt-5 max-w-lg text-base leading-relaxed text-sakred-ink/70 sm:text-lg"
            >
              Find trusted care around you, follow what to do between appointments,
              learn from people who&rsquo;ve been where you are — and keep your
              coverage in the same place.
            </motion.p>

            <motion.div {...fadeUp(0.44)} className="mt-8">
              <StoreButtons />
            </motion.div>

            <motion.div
              {...fadeUp(0.54)}
              className="mt-6 hidden items-center gap-3 lg:flex"
            >
              <img
                src={APP_QR_SRC}
                alt="QR code linking to sakredhealth.com/app"
                width={64}
                height={64}
                className="h-16 w-16"
              />
              <span className="max-w-[9rem] text-xs leading-snug text-sakred-ink/55">
                Scan to open on your phone
              </span>
            </motion.div>
          </div>

          {/* ---- screen switcher ---- */}
          <div>
            <div className="relative mx-auto w-full max-w-[17rem]">
              <div
                className="absolute inset-0 -m-8 rounded-full bg-sakred-gold/20 blur-3xl"
                aria-hidden="true"
              />
              <div className="relative overflow-hidden rounded-[2.2rem] border-[5px] border-sakred-espresso/85 bg-sakred-espresso shadow-[0_36px_70px_-32px_rgba(28,26,23,0.65)]">
                {/* Crossfade rather than a carousel: the phone frame stays put,
                    only what's inside it changes, so nothing on the page moves. */}
                {APP_SCREENS.map((screen, index) => (
                  <motion.img
                    key={screen.label}
                    src={screen.image}
                    alt={screen.alt}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    initial={false}
                    animate={{ opacity: activeScreen === index ? 1 : 0 }}
                    transition={{ duration: DUR.card, ease: EASE }}
                    className={`w-full ${index === 0 ? "block" : "absolute inset-0"}`}
                  />
                ))}
              </div>
            </div>

            <div
              className="mt-6 flex flex-wrap justify-center gap-2"
              role="tablist"
              aria-label="App screens"
            >
              {APP_SCREENS.map((screen, index) => (
                <button
                  key={screen.label}
                  type="button"
                  role="tab"
                  aria-selected={activeScreen === index}
                  onClick={() => setActiveScreen(index)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-micro ${
                    activeScreen === index
                      ? "border-sakred-gold bg-sakred-gold/15 text-sakred-gold-deep"
                      : "border-sakred-stone bg-sakred-surface text-sakred-ink/65 hover:text-sakred-espresso"
                  }`}
                >
                  {screen.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ---- the five pillars ---- */}
      <section className="bg-sakred-canvas py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-sakred-gold-deep">
              Inside the app
            </p>
            <StampHeading
              as="h2"
              text="Five things, and they"
              accent="belong together."
              className="font-display text-3xl leading-tight tracking-tight text-sakred-espresso sm:text-4xl"
            />
          </div>

          <StaggerChildren as="ul" className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <StaggerItem as="li" key={pillar.title}>
                  <div className="h-full rounded-2xl border border-sakred-stone bg-sakred-surface p-6 lift-card">
                    <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-sakred-gold/40 bg-sakred-gold/10">
                      <Icon className="h-5 w-5 text-sakred-gold-deep" aria-hidden="true" />
                    </span>
                    <h3 className="font-display text-xl leading-tight text-sakred-espresso">
                      {pillar.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-sakred-ink/65">
                      {pillar.body}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}

            {/* The sixth cell is the CTA, so the grid closes cleanly at three
                columns instead of leaving a hole. */}
            <StaggerItem as="li">
              <div className="flex h-full flex-col justify-between rounded-2xl border border-sakred-gold/40 bg-sakred-gold/[0.08] p-6">
                <div>
                  <h3 className="font-display text-xl leading-tight text-sakred-espresso">
                    Start with the map
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-sakred-ink/65">
                    You don&rsquo;t need the app to search the network — try it on the
                    web first and pick it up on your phone.
                  </p>
                </div>
                <Link
                  href="/discover"
                  className="mt-5 inline-flex w-fit items-center rounded-full border border-sakred-stone bg-sakred-surface px-5 py-2.5 text-sm font-medium text-sakred-espresso lift-card"
                >
                  Explore the network
                </Link>
              </div>
            </StaggerItem>
          </StaggerChildren>
        </div>
      </section>

      {/* ---- screen gallery ---- */}
      <section className="overflow-hidden bg-sakred-surface-alt py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl text-sakred-espresso sm:text-3xl">
            See it in action
          </h2>
        </div>
        <ul className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8">
          {APP_SCREENS.map((screen) => (
            <li key={screen.label} className="w-44 shrink-0 snap-center sm:w-52">
              <div className="overflow-hidden rounded-[1.4rem] border-4 border-sakred-espresso/85 bg-sakred-espresso">
                <img
                  src={screen.image}
                  alt={screen.alt}
                  loading="lazy"
                  decoding="async"
                  className="block w-full"
                />
              </div>
              <p className="mt-2 text-center text-xs text-sakred-ink/55">{screen.label}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---- FAQ ---- */}
      <section className="bg-sakred-canvas py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl text-sakred-espresso sm:text-3xl">
            Questions
          </h2>
          <dl className="mt-8 divide-y divide-sakred-stone/70 border-y border-sakred-stone/70">
            {FAQ.map((item, index) => (
              <Reveal key={item.q} delay={index * 0.05}>
                <div className="py-6">
                  <dt className="font-display text-lg leading-snug text-sakred-espresso">
                    {item.q}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-sakred-ink/65">{item.a}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ---- final CTA ---- */}
      <section className="surface-cafe py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-display text-2xl leading-tight text-[#F5EFE3] sm:text-3xl">
            Take the network with you
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-[#F5EFE3]/70">
            Free to download. Free to search.
          </p>
          <div className="mt-8 flex justify-center">
            <StoreButtons />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
