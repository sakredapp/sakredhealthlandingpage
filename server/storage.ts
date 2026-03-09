import { 
  type User, 
  type InsertUser, 
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
  users,
  blogPosts,
  demoVideos,
  testimonials,
  newsletterSubscribers,
  videoAnalytics,
  abTestVariants,
  abTestConversions,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Blog Posts
  getBlogPosts(): Promise<BlogPost[]>;
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getBlogPostById(id: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<boolean>;
  
  // Demo Videos
  getDemoVideos(): Promise<DemoVideo[]>;
  createDemoVideo(video: InsertDemoVideo): Promise<DemoVideo>;
  
  // Testimonials
  getTestimonials(): Promise<Testimonial[]>;
  getFeaturedTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  
  // Newsletter
  subscribeNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  getSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined>;
  
  // Video Analytics
  trackVideoEvent(event: InsertVideoAnalytics): Promise<VideoAnalytics>;
  getVideoAnalytics(videoId: string): Promise<{ plays: number; completions: number; avgWatchTime: number }>;
  
  // A/B Testing
  getAbTestVariants(testName: string): Promise<AbTestVariant[]>;
  createAbTestVariant(variant: InsertAbTestVariant): Promise<AbTestVariant>;
  trackConversion(conversion: InsertAbTestConversion): Promise<AbTestConversion>;
  getConversionStats(testName: string): Promise<{ variantId: string; variantName: string; conversions: number; impressions: number }[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Blog Posts
  async getBlogPosts(): Promise<BlogPost[]> {
    return db.select().from(blogPosts)
      .where(eq(blogPosts.published, true))
      .orderBy(desc(blogPosts.publishedAt));
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return db.select().from(blogPosts)
      .orderBy(desc(blogPosts.publishedAt));
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)));
    return post || undefined;
  }

  async getBlogPostById(id: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post || undefined;
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db.insert(blogPosts).values(insertPost).returning();
    return post;
  }

  async updateBlogPost(id: string, updates: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [post] = await db.update(blogPosts)
      .set(updates)
      .where(eq(blogPosts.id, id))
      .returning();
    return post || undefined;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning();
    return result.length > 0;
  }

  // Demo Videos
  async getDemoVideos(): Promise<DemoVideo[]> {
    return db.select().from(demoVideos).orderBy(demoVideos.order);
  }

  async createDemoVideo(insertVideo: InsertDemoVideo): Promise<DemoVideo> {
    const [video] = await db.insert(demoVideos).values(insertVideo).returning();
    return video;
  }

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    return db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
  }

  async getFeaturedTestimonials(): Promise<Testimonial[]> {
    return db.select().from(testimonials)
      .where(eq(testimonials.featured, true))
      .orderBy(desc(testimonials.createdAt));
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const [testimonial] = await db.insert(testimonials).values(insertTestimonial).returning();
    return testimonial;
  }

  // Newsletter
  async subscribeNewsletter(insertSubscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const [subscriber] = await db.insert(newsletterSubscribers)
      .values(insertSubscriber)
      .returning();
    return subscriber;
  }

  async getSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined> {
    const [subscriber] = await db.select().from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email));
    return subscriber || undefined;
  }

  // Video Analytics
  async trackVideoEvent(event: InsertVideoAnalytics): Promise<VideoAnalytics> {
    const [analytics] = await db.insert(videoAnalytics).values(event).returning();
    return analytics;
  }

  async getVideoAnalytics(videoId: string): Promise<{ plays: number; completions: number; avgWatchTime: number }> {
    const events = await db.select().from(videoAnalytics)
      .where(eq(videoAnalytics.videoId, videoId));
    
    const plays = events.filter(e => e.eventType === 'play').length;
    const completions = events.filter(e => e.eventType === 'complete').length;
    const totalWatchTime = events.reduce((sum, e) => sum + (e.watchTime || 0), 0);
    const avgWatchTime = plays > 0 ? Math.round(totalWatchTime / plays) : 0;

    return { plays, completions, avgWatchTime };
  }

  // A/B Testing
  async getAbTestVariants(testName: string): Promise<AbTestVariant[]> {
    return db.select().from(abTestVariants)
      .where(and(eq(abTestVariants.testName, testName), eq(abTestVariants.active, true)));
  }

  async createAbTestVariant(variant: InsertAbTestVariant): Promise<AbTestVariant> {
    const [created] = await db.insert(abTestVariants).values(variant).returning();
    return created;
  }

  async trackConversion(conversion: InsertAbTestConversion): Promise<AbTestConversion> {
    const [tracked] = await db.insert(abTestConversions).values(conversion).returning();
    return tracked;
  }

  async getConversionStats(testName: string): Promise<{ variantId: string; variantName: string; conversions: number; impressions: number }[]> {
    const variants = await this.getAbTestVariants(testName);
    const conversions = await db.select().from(abTestConversions)
      .where(eq(abTestConversions.testName, testName));

    return variants.map(variant => ({
      variantId: variant.id,
      variantName: variant.variantName,
      conversions: conversions.filter(c => c.variantId === variant.id && c.conversionType === 'click').length,
      impressions: conversions.filter(c => c.variantId === variant.id && c.conversionType === 'impression').length,
    }));
  }
}

export const storage = new DatabaseStorage();
