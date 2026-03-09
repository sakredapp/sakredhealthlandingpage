import {
  type BlogPost,
  type InsertBlogPost,
  type DemoVideo,
  type InsertDemoVideo,
  type Testimonial,
  type InsertTestimonial,
  type NewsletterSubscriber,
  type InsertNewsletterSubscriber,
  type VideoAnalytics,
  type InsertVideoAnalytics,
  type AbTestVariant,
  type InsertAbTestVariant,
  type AbTestConversion,
  type InsertAbTestConversion,
  blogPosts,
  demoVideos,
  testimonials,
  newsletterSubscribers,
  videoAnalytics,
  abTestVariants,
  abTestConversions,
} from "../../shared/schema";
import { getDb } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Blog Posts
export async function getBlogPosts(): Promise<BlogPost[]> {
  const db = getDb();
  return db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.publishedAt));
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const db = getDb();
  return db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt));
}

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | undefined> {
  const db = getDb();
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)));
  return post || undefined;
}

export async function getBlogPostById(
  id: string
): Promise<BlogPost | undefined> {
  const db = getDb();
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id));
  return post || undefined;
}

export async function createBlogPost(
  insertPost: InsertBlogPost
): Promise<BlogPost> {
  const db = getDb();
  const [post] = await db.insert(blogPosts).values(insertPost).returning();
  return post;
}

export async function updateBlogPost(
  id: string,
  updates: Partial<InsertBlogPost>
): Promise<BlogPost | undefined> {
  const db = getDb();
  const [post] = await db
    .update(blogPosts)
    .set(updates)
    .where(eq(blogPosts.id, id))
    .returning();
  return post || undefined;
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const db = getDb();
  const result = await db
    .delete(blogPosts)
    .where(eq(blogPosts.id, id))
    .returning();
  return result.length > 0;
}

// Demo Videos
export async function getDemoVideos(): Promise<DemoVideo[]> {
  const db = getDb();
  return db.select().from(demoVideos).orderBy(demoVideos.order);
}

export async function createDemoVideo(
  insertVideo: InsertDemoVideo
): Promise<DemoVideo> {
  const db = getDb();
  const [video] = await db.insert(demoVideos).values(insertVideo).returning();
  return video;
}

// Testimonials
export async function getTestimonials(): Promise<Testimonial[]> {
  const db = getDb();
  return db
    .select()
    .from(testimonials)
    .orderBy(desc(testimonials.createdAt));
}

export async function getFeaturedTestimonials(): Promise<Testimonial[]> {
  const db = getDb();
  return db
    .select()
    .from(testimonials)
    .where(eq(testimonials.featured, true))
    .orderBy(desc(testimonials.createdAt));
}

export async function createTestimonial(
  insertTestimonial: InsertTestimonial
): Promise<Testimonial> {
  const db = getDb();
  const [testimonial] = await db
    .insert(testimonials)
    .values(insertTestimonial)
    .returning();
  return testimonial;
}

// Newsletter
export async function subscribeNewsletter(
  insertSubscriber: InsertNewsletterSubscriber
): Promise<NewsletterSubscriber> {
  const db = getDb();
  const [subscriber] = await db
    .insert(newsletterSubscribers)
    .values(insertSubscriber)
    .returning();
  return subscriber;
}

export async function getSubscriberByEmail(
  email: string
): Promise<NewsletterSubscriber | undefined> {
  const db = getDb();
  const [subscriber] = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email));
  return subscriber || undefined;
}

// Video Analytics
export async function trackVideoEvent(
  event: InsertVideoAnalytics
): Promise<VideoAnalytics> {
  const db = getDb();
  const [analytics] = await db
    .insert(videoAnalytics)
    .values(event)
    .returning();
  return analytics;
}

export async function getVideoAnalytics(
  videoId: string
): Promise<{ plays: number; completions: number; avgWatchTime: number }> {
  const db = getDb();
  const events = await db
    .select()
    .from(videoAnalytics)
    .where(eq(videoAnalytics.videoId, videoId));

  const plays = events.filter((e) => e.eventType === "play").length;
  const completions = events.filter((e) => e.eventType === "complete").length;
  const totalWatchTime = events.reduce(
    (sum, e) => sum + (e.watchTime || 0),
    0
  );
  const avgWatchTime = plays > 0 ? Math.round(totalWatchTime / plays) : 0;

  return { plays, completions, avgWatchTime };
}

// A/B Testing
export async function getAbTestVariants(
  testName: string
): Promise<AbTestVariant[]> {
  const db = getDb();
  return db
    .select()
    .from(abTestVariants)
    .where(
      and(
        eq(abTestVariants.testName, testName),
        eq(abTestVariants.active, true)
      )
    );
}

export async function createAbTestVariant(
  variant: InsertAbTestVariant
): Promise<AbTestVariant> {
  const db = getDb();
  const [created] = await db
    .insert(abTestVariants)
    .values(variant)
    .returning();
  return created;
}

export async function trackConversion(
  conversion: InsertAbTestConversion
): Promise<AbTestConversion> {
  const db = getDb();
  const [tracked] = await db
    .insert(abTestConversions)
    .values(conversion)
    .returning();
  return tracked;
}

export async function getConversionStats(
  testName: string
): Promise<
  {
    variantId: string;
    variantName: string;
    conversions: number;
    impressions: number;
  }[]
> {
  const db = getDb();
  const variants = await getAbTestVariants(testName);
  const conversions = await db
    .select()
    .from(abTestConversions)
    .where(eq(abTestConversions.testName, testName));

  return variants.map((variant) => ({
    variantId: variant.id,
    variantName: variant.variantName,
    conversions: conversions.filter(
      (c) => c.variantId === variant.id && c.conversionType === "click"
    ).length,
    impressions: conversions.filter(
      (c) => c.variantId === variant.id && c.conversionType === "impression"
    ).length,
  }));
}
