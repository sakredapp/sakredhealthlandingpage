/**
 * "Real people. Real experiences." — the community band.
 *
 * ── An honesty note about the cards ──────────────────────────────────
 *
 * The community lives in the app, and this site has no read access to it. So
 * these cards show the *kinds of questions* the community is for, and are
 * labelled as such. They carry no usernames, no avatars, no reply counts and
 * no answers — because a fabricated username with a fabricated reply count is
 * a testimonial nobody gave, sitting on the homepage of a company that sells
 * insurance.
 *
 * When the app exposes a public read endpoint for threads, swap the array for
 * a fetch and drop the "examples" label. Nothing else here has to change.
 */
import { Link } from "wouter";
import { MessagesSquare } from "lucide-react";
import { StampHeading, Reveal } from "@/components/motion";
import { AtlasContours } from "./AtlasMarks";

const EXAMPLE_THREADS = [
  "Has anyone seen an acupuncturist around Miami for sports recovery?",
  "Experience with a TCM practitioner for post-surgical recovery?",
  "Best biological dentist around Austin?",
  "Who's worth seeing for chronic digestive issues in Denver?",
  "Anyone found a functional practitioner who takes their time?",
  "Recommendations for prenatal bodywork in the Bay Area?",
];

function ThreadCard({ question, duplicate }: { question: string; duplicate?: boolean }) {
  return (
    <li
      aria-hidden={duplicate}
      className="w-[19rem] shrink-0 rounded-2xl border border-sakred-stone bg-sakred-surface p-5"
    >
      <MessagesSquare
        className="mb-3 h-4 w-4 text-sakred-gold-deep"
        aria-hidden="true"
      />
      <p className="font-display text-base leading-snug text-sakred-espresso">
        &ldquo;{question}&rdquo;
      </p>
    </li>
  );
}

export function CommunityBand() {
  return (
    <section className="relative overflow-hidden bg-sakred-surface-alt py-20 sm:py-28">
      <AtlasContours className="absolute inset-x-0 bottom-0 h-40 w-full opacity-70" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-sakred-gold-deep">
            Community
          </p>
          <StampHeading
            as="h2"
            text="Real people."
            accent="Real experiences."
            className="font-display text-3xl leading-tight tracking-tight text-sakred-espresso sm:text-4xl"
          />
          <p className="mt-4 max-w-lg text-base leading-relaxed text-sakred-ink/65">
            The hardest part of finding care isn&rsquo;t the search — it&rsquo;s not
            knowing whether the person you found is any good. In the app, people who
            have already been ask and answer that for each other.
          </p>
        </div>
      </div>

      {/* The rail. Duplicated once and translated by exactly half its width,
          so the loop is seamless without any JS measuring anything. Pauses on
          hover, and stops entirely under reduced motion.
          Wrapped in a Reveal so it settles in with the rest of the section
          rather than already being mid-scroll when you arrive. */}
      <Reveal className="marquee relative mt-10 select-none" y={14}>
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-sakred-surface-alt to-transparent sm:w-28"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-sakred-surface-alt to-transparent sm:w-28"
          aria-hidden="true"
        />

        <ul className="marquee__track flex gap-4">
          {EXAMPLE_THREADS.map((question) => (
            <ThreadCard key={question} question={question} />
          ))}
          {/* The duplicate is decoration: a screen reader reads the list once. */}
          {EXAMPLE_THREADS.map((question) => (
            <ThreadCard key={`dup-${question}`} question={question} duplicate />
          ))}
        </ul>
      </Reveal>

      <div className="relative mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-sakred-ink/45">
          Examples of what the community is for. Discussions live in the Sakred
          Health app.
        </p>
        <Link
          href="/app"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sakred-espresso"
        >
          <span className="border-b border-sakred-gold pb-0.5">Explore the community</span>
          <span aria-hidden="true" className="text-sakred-gold">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
