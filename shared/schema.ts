import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  featuredImage: text("featured_image"),
  featuredImageAlt: text("featured_image_alt"),
  tags: text("tags").array(),
  published: boolean("published").default(true),
  publishedAt: timestamp("published_at").defaultNow(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords").array(),
  canonicalUrl: text("canonical_url"),
  ogImage: text("og_image"),
  llmSummary: text("llm_summary"),
  status: text("status").default("draft"),
  draftContent: text("draft_content"),
  previewToken: text("preview_token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const mediaAssets = pgTable("media_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  objectPath: text("object_path").notNull(),
  url: text("url"),
  alt: text("alt"),
  blogPostId: varchar("blog_post_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMediaAssetSchema = createInsertSchema(mediaAssets).omit({
  id: true,
  createdAt: true,
});

export type InsertMediaAsset = z.infer<typeof insertMediaAssetSchema>;
export type MediaAsset = typeof mediaAssets.$inferSelect;

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

export const demoVideos = pgTable("demo_videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  order: text("order").default("0"),
});

export const insertDemoVideoSchema = createInsertSchema(demoVideos).omit({
  id: true,
});

export type InsertDemoVideo = z.infer<typeof insertDemoVideoSchema>;
export type DemoVideo = typeof demoVideos.$inferSelect;

// Testimonials for success stories section
export const testimonials = pgTable("testimonials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role"),
  avatarUrl: text("avatar_url"),
  quote: text("quote").notNull(),
  rating: integer("rating").default(5),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true,
});

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

// Newsletter subscribers
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  confirmed: boolean("confirmed").default(false),
  source: text("source").default("website"),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({
  id: true,
  subscribedAt: true,
  confirmed: true,
});

export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

// Video analytics events
export const videoAnalytics = pgTable("video_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  videoId: varchar("video_id").notNull(),
  eventType: text("event_type").notNull(), // 'play', 'pause', 'complete', 'seek', 'progress'
  sessionId: text("session_id"),
  watchTime: integer("watch_time").default(0), // seconds watched
  progressPercent: integer("progress_percent").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVideoAnalyticsSchema = createInsertSchema(videoAnalytics).omit({
  id: true,
  createdAt: true,
});

export type InsertVideoAnalytics = z.infer<typeof insertVideoAnalyticsSchema>;
export type VideoAnalytics = typeof videoAnalytics.$inferSelect;

// A/B Test variants
export const abTestVariants = pgTable("ab_test_variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testName: text("test_name").notNull(), // e.g., 'hero_cta', 'pricing_button'
  variantName: text("variant_name").notNull(), // e.g., 'control', 'variant_a'
  buttonText: text("button_text"),
  buttonColor: text("button_color"),
  headline: text("headline"),
  subheadline: text("subheadline"),
  active: boolean("active").default(true),
  weight: integer("weight").default(50), // percentage weight for traffic split
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAbTestVariantSchema = createInsertSchema(abTestVariants).omit({
  id: true,
  createdAt: true,
});

export type InsertAbTestVariant = z.infer<typeof insertAbTestVariantSchema>;
export type AbTestVariant = typeof abTestVariants.$inferSelect;

// A/B Test conversions
export const abTestConversions = pgTable("ab_test_conversions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testName: text("test_name").notNull(),
  variantId: varchar("variant_id").notNull(),
  sessionId: text("session_id"),
  conversionType: text("conversion_type").notNull(), // 'click', 'signup', 'purchase'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAbTestConversionSchema = createInsertSchema(abTestConversions).omit({
  id: true,
  createdAt: true,
});

export type InsertAbTestConversion = z.infer<typeof insertAbTestConversionSchema>;
export type AbTestConversion = typeof abTestConversions.$inferSelect;
