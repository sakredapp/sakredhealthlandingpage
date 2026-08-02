import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCorsHeaders } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { blogPosts } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

const articles = [
  {
    title: "Burnout Prevention in the Workplace: Daily Health Routines for Resilience",
    slug: "burnout-prevention-workplace-daily-health-routines-resilience",
    excerpt: "Burnout prevention in the workplace starts with daily health routines that build resilience—consistent sleep, regular movement breaks, proper hydration, and mindfulness practices.",
    content: "Burnout prevention in the workplace starts with daily health routines that build resilience. With an estimated 76% of employees experiencing burnout at least occasionally, proactive daily habits are needed to protect well-being on the job.\n\n## Recognize and Reset\n\nBurnout often creeps in gradually with fatigue, detachment, and irritability. Prioritize 7–9 hours of sleep and take short, frequent breaks during the workday.\n\n## Healthy Hydration and Nutrition\n\nEven mild dehydration can impair attention, memory, and mood. Stay well-hydrated and eat balanced meals to prevent energy crashes.\n\n## Movement and Stress Management\n\nRegular physical activity releases tension, improves mood, and increases resilience. Even a brisk walk at lunch can release endorphins and calm the nervous system.\n\n## Set Boundaries and Find Support\n\nDesignate offline time in the evenings. Practice saying no when your plate is full. Social support is key to mitigating burnout.",
    author: "Sakred Wellness Team",
    tags: ["burnout", "workplace-wellness", "resilience", "stress-management"],
    seoTitle: "Burnout Prevention: Daily Health Routines for Workplace Resilience",
    seoDescription: "Learn evidence-based daily health routines to prevent workplace burnout.",
    seoKeywords: ["burnout prevention", "workplace wellness", "stress management", "resilience"],
  },
  {
    title: "The Science of Sleep: Building Nightly Routines for Better Rest and Focus",
    slug: "science-of-sleep-nightly-routines-better-rest-focus",
    excerpt: "Improving your sleep starts with building a consistent nightly routine—science shows that good sleep hygiene practices lead to better rest and sharper focus.",
    content: "Adults who get 7–9 hours of sleep enjoy better cognitive performance, mood stability, and lower risk of chronic diseases.\n\n## Consistency is Key\n\nGoing to bed and waking up at the same time each day helps regulate your circadian rhythm.\n\n## Create a Calming Wind-Down Routine\n\nAbout 30–60 minutes before bed, engage in calming, low-light activities like reading or meditation.\n\n## Light and Tech Hygiene\n\nBlue light from screens suppresses melatonin. Limit bright lights and technology use in the hours before bedtime.\n\n## Optimize Your Sleep Environment\n\nA cool, dark, and quiet environment is ideal. The recommended bedroom temperature is around 65°F (18°C).",
    author: "Sakred Wellness Team",
    tags: ["sleep", "rest", "focus", "circadian-rhythm"],
    seoTitle: "Science of Sleep: Build Nightly Routines for Better Rest & Focus",
    seoDescription: "Discover evidence-based sleep hygiene practices to improve rest and mental clarity.",
    seoKeywords: ["sleep science", "nightly routines", "sleep hygiene", "circadian rhythm"],
  },
  {
    title: "From Low Energy to High Performance: Hydration Habits to Boost Your Workday",
    slug: "low-energy-high-performance-hydration-habits-boost-workday",
    excerpt: "One of the simplest and most effective performance boosters is proper hydration—consistent hydration habits can sharpen your focus and improve mood.",
    content: "Water is the ultimate fuel: roughly 50–60% of your body weight is water, and even your brain is about 75% water.\n\n## Morning Hydration\n\nAfter 7–8 hours of sleep, your body is naturally dehydrated. Drink 12–16 ounces of water within 15–30 minutes of waking.\n\n## Keep a Water Bottle Handy\n\nMake hydration effortless by keeping water visible and within reach. Sip regularly rather than chugging only when parched.\n\n## Electrolytes and Smart Hydration\n\nElectrolytes like sodium, potassium, and magnesium play a critical role in fluid balance and cell function.\n\n## Practical Tips\n\nInfuse water with citrus, cucumber, or berries for flavor. Set daily goals and listen to your body.",
    author: "Sakred Wellness Team",
    tags: ["hydration", "energy", "productivity", "focus"],
    seoTitle: "Hydration Habits to Boost Energy & Workday Performance",
    seoDescription: "Discover how proper hydration can transform your workday performance.",
    seoKeywords: ["hydration habits", "energy boost", "productivity", "focus"],
  },
  {
    title: "Digital Overload: Daily Habits to Reduce Screen Fatigue and Boost Focus",
    slug: "digital-overload-daily-habits-reduce-screen-fatigue-boost-focus",
    excerpt: "Combating digital overload requires daily habits that give your brain regular breaks from devices—scheduled no-screen intervals, eye rest techniques, and tech-free zones.",
    content: "Heavy acute smartphone use induces mental fatigue and decreases cognitive performance.\n\n## The Digital Detox Window\n\nInstitute a daily digital detox period—a block of time where you deliberately step away from all screens.\n\n## Adopt the 20-20-20 Rule\n\nEvery 20 minutes, look at something 20 feet away for 20 seconds. This simple habit reduces digital eye strain.\n\n## Mindful Tech Boundaries\n\nSet specific times for checking email and social media rather than constant monitoring. Use app timers to enforce limits.\n\n## Tech-Free Zones\n\nDesignate certain spaces (bedroom, dining table) as screen-free to protect sleep and social connection.",
    author: "Sakred Wellness Team",
    tags: ["digital-detox", "screen-fatigue", "focus", "mindfulness"],
    seoTitle: "Digital Overload: Daily Habits to Reduce Screen Fatigue & Boost Focus",
    seoDescription: "Learn daily habits to combat digital overload, reduce screen fatigue, and reclaim focus.",
    seoKeywords: ["digital overload", "screen fatigue", "focus", "digital detox"],
  },
  {
    title: "Why Gut Health Matters: Daily Habits for Better Digestion and Less Stress",
    slug: "gut-health-matters-daily-habits-better-digestion-less-stress",
    excerpt: "Your gut health is intricately connected to your overall well-being—daily habits like eating fiber-rich foods, consuming probiotics, and managing stress can improve digestion and mood.",
    content: "The gut-brain axis is a real two-way communication system. Your gut has been called a 'second brain' because it produces neurotransmitters like serotonin.\n\n## Feed Your Microbiome\n\nEat a variety of fiber-rich foods—vegetables, fruits, legumes, and whole grains—to nourish beneficial gut bacteria.\n\n## Incorporate Fermented Foods\n\nYogurt, kefir, sauerkraut, kimchi, and kombucha introduce live beneficial microbes to your digestive system.\n\n## Practice Mindful Eating\n\nEat slowly, chew thoroughly, and avoid eating while distracted. This promotes the rest and digest response.\n\n## Manage Stress for Gut Health\n\nChronic stress disrupts gut motility, increases intestinal permeability, and negatively alters the microbiome.",
    author: "Sakred Wellness Team",
    tags: ["gut-health", "digestion", "stress", "microbiome"],
    seoTitle: "Gut Health Matters: Daily Habits for Better Digestion & Less Stress",
    seoDescription: "Discover how daily gut health habits improve digestion and reduce stress.",
    seoKeywords: ["gut health", "digestion", "microbiome", "stress reduction"],
  },
  {
    title: "Mindful Minutes: Journaling and Breathwork Practices to Build Stress Resilience",
    slug: "mindful-minutes-journaling-breathwork-stress-resilience",
    excerpt: "Building stress resilience can be as simple as carving out a few mindful minutes each day for journaling and breathwork.",
    content: "Daily practices like writing in a journal and practicing controlled breathing engage the body's relaxation response.\n\n## The Power of Journaling\n\nWriting about your emotions can reduce anxiety, improve mood, and even boost immune function.\n\n## How to Journal for Stress Resilience\n\nEven 5–10 minutes can make a difference. Try gratitude journaling or reflective journaling after stressful events.\n\n## Breathwork: Your Built-in Relaxation Tool\n\nSlow, deep breaths with a longer exhale stimulate the vagus nerve and activate the parasympathetic nervous system.\n\n## Simple Breathwork Techniques\n\nTry cyclic sighing or box breathing (4-4-4-4). Research shows just 5 minutes per day significantly reduces anxiety.",
    author: "Sakred Wellness Team",
    tags: ["mindfulness", "journaling", "breathwork", "stress-resilience"],
    seoTitle: "Mindful Minutes: Journaling & Breathwork for Stress Resilience",
    seoDescription: "Learn how journaling and breathwork practices build stress resilience.",
    seoKeywords: ["journaling", "breathwork", "stress resilience", "mindfulness"],
  },
  {
    title: "The Habit Loop: How to Build Sustainable Self-Care Routines That Stick",
    slug: "habit-loop-build-sustainable-self-care-routines-stick",
    excerpt: "Understanding the habit loop—cue, routine, reward—is the key to building self-care routines that actually stick long-term.",
    content: "The habit loop consists of three components: a cue (trigger), a routine (the behavior), and a reward (the payoff).\n\n## Design Your Cues\n\nAttach new healthy habits to existing ones through habit stacking. After I pour my coffee, I will drink a glass of water.\n\n## Start Small\n\nBegin with a version of the habit that's almost too easy. A 2-minute stretch instead of a 30-minute yoga session.\n\n## Make It Rewarding\n\nThe reward doesn't have to be extrinsic. Notice how you feel after the habit—the energy, the calm, the sense of accomplishment.\n\n## Be Patient and Self-Compassionate\n\nMissing one day doesn't destroy your progress. What matters is the overall pattern. Consistency beats perfection.",
    author: "Sakred Wellness Team",
    tags: ["habit-loop", "self-care", "routines", "behavior-change"],
    seoTitle: "The Habit Loop: Build Sustainable Self-Care Routines That Stick",
    seoDescription: "Learn how the habit loop works and how to use it to build sustainable self-care habits.",
    seoKeywords: ["habit loop", "self-care routines", "behavior change", "habit stacking"],
  },
  {
    title: "Nature-First Wellness: Daily Habits for Health Without Quick Fixes",
    slug: "nature-first-wellness-daily-habits-health-without-quick-fixes",
    excerpt: "True wellness comes from aligning with nature's rhythms and building foundational habits—not from chasing quick fixes or magic supplements.",
    content: "A nature-first approach prioritizes sleep, hydration, movement, and whole foods as the bedrock of health.\n\n## What Nature-First Means\n\nPrioritizing practices humans have evolved with: adequate sleep, physical movement, hydration, sunlight, and real, unprocessed foods.\n\n## The Terrain Over the Symptom\n\nFocus on root causes through lifestyle adjustments first, before reaching for stimulants or supplements.\n\n## Simple Habits, Compounding Benefits\n\nBetter sleep leads to better mood and more energy to exercise. Exercise improves sleep. Healthy eating supports both.\n\n## Skepticism of Quick Fixes\n\nBe wary of any wellness promise that seems too good to be true. Lasting improvements come from sustained effort.",
    author: "Sakred Wellness Team",
    tags: ["nature-first", "natural-wellness", "no-quick-fixes"],
    seoTitle: "Nature-First Wellness: Daily Habits for Health Without Quick Fixes",
    seoDescription: "Discover the nature-first approach to wellness that prioritizes foundational habits over quick fixes.",
    seoKeywords: ["nature-first wellness", "natural health", "foundational habits"],
  },
  {
    title: "Personalized Wellness: Tailoring Your Daily Routine to Fit Your Lifestyle",
    slug: "personalized-wellness-tailoring-daily-routine-fit-lifestyle",
    excerpt: "One-size-fits-all wellness plans often fall short—personalized wellness means tailoring your daily routine to fit your unique lifestyle and goals.",
    content: "The best routine is the one you can consistently do and adjust over time.\n\n## Assess Your Individual Needs\n\nTake stock of your work hours, energy patterns, and resources. Journal about your ideal day.\n\n## Set Personalized Goals\n\nDig into what you truly want. Use SMART goals: Specific, Measurable, Achievable, Relevant, Time-bound.\n\n## Customize Habit Selection\n\nChoose habits that resonate with you. If you hate running, swim or dance instead.\n\n## Adapting to Life Stages\n\nYour routine should change as your life changes. Consistency and adaptation trump perfection.",
    author: "Sakred Wellness Team",
    tags: ["personalized-wellness", "lifestyle", "customization"],
    seoTitle: "Personalized Wellness: Tailor Your Daily Routine to Your Lifestyle",
    seoDescription: "Learn how to create a personalized wellness routine that fits your unique lifestyle.",
    seoKeywords: ["personalized wellness", "daily routine", "lifestyle", "customization"],
  },
  {
    title: "Employee Wellness 2.0: Integrating Habit Tracking and Self-Care into Company Culture",
    slug: "employee-wellness-integrating-habit-tracking-self-care-company-culture",
    excerpt: "Employee Wellness 2.0 isn't just about offering gym discounts—it's about weaving healthy habits into the workday.",
    content: "Healthier employees are more engaged, productive, and resilient.\n\n## Make Wellness Visible and Supported\n\nLeadership should openly endorse wellness activities in daily actions, not just HR memos.\n\n## Implement Habit-Tracking Tools\n\nWellness platforms let employees set health goals and monitor progress with team challenges.\n\n## Integrate Wellness into Workflow\n\nStanding desks, healthy snacks, 50-minute meetings with 10-minute breaks, walking meetings.\n\n## Normalize Self-Care Conversations\n\nManagers should feel comfortable checking in on workload and encouraging breaks and vacation.",
    author: "Sakred Wellness Team",
    tags: ["employee-wellness", "workplace", "habit-tracking"],
    seoTitle: "Employee Wellness 2.0: Habit Tracking & Self-Care in Company Culture",
    seoDescription: "Learn how companies integrate habit tracking and self-care into workplace culture.",
    seoKeywords: ["employee wellness", "workplace wellness", "habit tracking", "company culture"],
  },
  {
    title: "Building a Resilient Workforce: How Daily Health Habits Improve Employee Wellness",
    slug: "building-resilient-workforce-daily-health-habits-employee-wellness",
    excerpt: "A resilient workforce is built on the foundation of employees' daily health habits, which cumulatively improve wellness and reduce burnout.",
    content: "Think of each employee as an athlete and the workplace as a team sport.\n\n## Prioritizing Sleep for Recovery\n\nWell-rested employees think more clearly, regulate emotions, and handle stressors without melting down.\n\n## Regular Movement Breaks\n\nEven small bouts of activity keep the body and mind alert. Walking meetings, stairs, and micro-workouts add up.\n\n## Nutrition and Hydration\n\nProvide healthy snacks and easy water access. Balanced lunches maintain steadier energy and focus.\n\n## Stress Management Rituals\n\nMorning meditation, midday walks, or evening journaling prevent stress from accumulating day after day.",
    author: "Sakred Wellness Team",
    tags: ["resilient-workforce", "daily-habits", "employee-wellness"],
    seoTitle: "Building a Resilient Workforce: Daily Health Habits for Employee Wellness",
    seoDescription: "Discover how daily health habits build workforce resilience and improve employee wellness.",
    seoKeywords: ["resilient workforce", "employee wellness", "daily health habits"],
  },
  {
    title: "Desk Detox: Simple Daily Movement Routines to Counteract Sedentary Work Life",
    slug: "desk-detox-daily-movement-routines-counteract-sedentary-work-life",
    excerpt: "A desk detox of simple daily movement routines can counteract the negative effects of sedentary work life.",
    content: "The modern office worker often sits for 8+ hours a day, linked to higher risks of cardiovascular disease and musculoskeletal problems.\n\n## Hourly Movement Breaks\n\nFor every hour of sitting, get up and move for 5 minutes. That's 40 minutes of cumulative movement over a workday.\n\n## Desk Stretches and Exercises\n\nNeck rolls, shoulder shrugs, wrist stretches, hip flexor stretches, and calf raises—all at your workstation.\n\n## Posture Resets\n\nConsciously check your posture several times a day. Sit back, roll shoulders back and down, align ears over shoulders.\n\n## Micro-Workouts\n\nDo 10 squats while waiting for coffee. Wall push-ups on bathroom breaks. A 2-minute plank before lunch.",
    author: "Sakred Wellness Team",
    tags: ["desk-detox", "movement", "sedentary", "office-wellness"],
    seoTitle: "Desk Detox: Daily Movement Routines for Sedentary Work Life",
    seoDescription: "Combat desk work effects with simple daily movement routines.",
    seoKeywords: ["desk detox", "sedentary work", "office wellness", "movement routines"],
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  // Require admin secret to prevent unauthorized seeding
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.SESSION_SECRET;
  if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const db = getDb();

    // Check existing posts
    const existing = await db.select({ id: blogPosts.id }).from(blogPosts);

    if (existing.length >= 10) {
      return res.json({
        message: `Blog already has ${existing.length} posts. Skipping seed.`,
        count: existing.length,
      });
    }

    // NOTE: this is a one-time seeder, not a sync. It inserts missing slugs and
    // never updates an existing row, so running it against already-seeded
    // content reports "Seed complete" having changed nothing. That is correct
    // for seeding and wrong for refreshing — scripts/sync-blog-content.mjs is
    // the only thing that should reconcile blog_posts with the markdown files.
    let inserted = 0;
    for (const article of articles) {
      try {
        // Check if slug already exists
        const [exists] = await db
          .select({ id: blogPosts.id })
          .from(blogPosts)
          .where(eq(blogPosts.slug, article.slug));

        if (!exists) {
          await db.insert(blogPosts).values({
            ...article,
            published: true,
          });
          inserted++;
        }
      } catch (err) {
        console.error(`Error inserting "${article.title}":`, err);
      }
    }

    const total = await db.select({ id: blogPosts.id }).from(blogPosts);

    return res.json({
      message: `Seed complete. Inserted ${inserted} new articles.`,
      total: total.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return res.status(500).json({ error: "Failed to seed blog posts" });
  }
}
