import type { Express } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import { storage } from "./storage";
import { saveNewsletterSubscriberToSupabase, getSubscriberFromSupabase, saveEmailSignup, supabase } from "./supabase";
import { 
  insertBlogPostSchema, 
  insertTestimonialSchema,
  insertNewsletterSubscriberSchema,
  insertVideoAnalyticsSchema,
  insertAbTestVariantSchema,
  insertAbTestConversionSchema 
} from "@shared/schema";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register Object Storage routes for file uploads
  registerObjectStorageRoutes(app);

  // Blog Posts API
  app.get("/api/blog-posts", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog-posts/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  // Generate a simple signed token using SESSION_SECRET only
  const generateAdminToken = () => {
    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret) {
      throw new Error("SESSION_SECRET environment variable is required for admin authentication");
    }
    const timestamp = Date.now();
    const payload = `admin-auth:${timestamp}`;
    const signature = crypto.createHmac("sha256", sessionSecret).update(payload).digest("hex");
    return `${timestamp}:${signature}`;
  };

  // Verify admin token
  const verifyAdminToken = (token: string): boolean => {
    if (!token) return false;
    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret) return false;
    const parts = token.split(":");
    if (parts.length !== 2) return false;
    const [timestamp, signature] = parts;
    const payload = `admin-auth:${timestamp}`;
    const expectedSignature = crypto.createHmac("sha256", sessionSecret).update(payload).digest("hex");
    if (signature !== expectedSignature) return false;
    const tokenAge = Date.now() - parseInt(timestamp, 10);
    const maxAge = 24 * 60 * 60 * 1000;
    return tokenAge < maxAge;
  };

  // Admin auth middleware - no authentication required
  const adminAuth = (req: any, res: any, next: any) => {
    return next();
  };

  // Admin login endpoint - no password required
  app.post("/api/admin/login", (req, res) => {
    return res.json({ success: true, token: generateAdminToken() });
  });

  // Check admin auth status - always authenticated
  app.get("/api/admin/auth-status", (req, res) => {
    return res.json({ authenticated: true, required: false });
  });

  // Admin endpoint - returns all posts including drafts
  app.get("/api/admin/blog-posts", adminAuth, async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching all blog posts:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  // Bulk SEO generation for all posts
  app.post("/api/admin/blog-posts/generate-all-seo", adminAuth, async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      const updates: { id: string; title: string; success: boolean }[] = [];
      
      for (const post of posts) {
        try {
          // Generate SEO fields from content
          const plainContent = post.content?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || '';
          const contentPreview = plainContent.substring(0, 500);
          
          // Generate SEO title (use existing or create from title)
          const seoTitle = post.seoTitle || `${post.title} | Sakred Health`;
          
          // Generate SEO description from excerpt or content
          const seoDescription = post.seoDescription || post.excerpt || contentPreview.substring(0, 155) + '...';
          
          // Generate keywords from tags and title
          const titleWords = post.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
          const tagKeywords = post.tags || [];
          const seoKeywords = post.seoKeywords?.length ? post.seoKeywords : [...new Set([...tagKeywords, ...titleWords])].slice(0, 10);
          
          // Generate LLM summary from content
          const llmSummary = post.llmSummary || `This article discusses ${post.title.toLowerCase()}. ${post.excerpt || contentPreview.substring(0, 200)}`;
          
          // Update the post
          await storage.updateBlogPost(post.id, {
            seoTitle,
            seoDescription,
            seoKeywords,
            llmSummary,
          });
          
          updates.push({ id: post.id, title: post.title, success: true });
        } catch (err) {
          console.error(`Failed to update SEO for post ${post.id}:`, err);
          updates.push({ id: post.id, title: post.title, success: false });
        }
      }
      
      const successCount = updates.filter(u => u.success).length;
      res.json({ 
        success: true, 
        message: `Updated SEO for ${successCount} of ${posts.length} posts`,
        updates 
      });
    } catch (error) {
      console.error("Error generating bulk SEO:", error);
      res.status(500).json({ error: "Failed to generate SEO" });
    }
  });

  app.get("/api/admin/blog-posts/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const post = await storage.getBlogPostById(id);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  // Blog Post CMS endpoints
  app.post("/api/blog-posts", async (req, res) => {
    try {
      const parsed = insertBlogPostSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid blog post data", details: parsed.error.errors });
      }
      const post = await storage.createBlogPost(parsed.data);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ error: "Failed to create blog post" });
    }
  });

  app.put("/api/blog-posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const parsed = insertBlogPostSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid blog post data", details: parsed.error.errors });
      }
      const post = await storage.updateBlogPost(id, parsed.data);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ error: "Failed to update blog post" });
    }
  });

  app.delete("/api/blog-posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBlogPost(id);
      if (!deleted) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  // Demo Videos API
  app.get("/api/demo-videos", async (req, res) => {
    try {
      const videos = await storage.getDemoVideos();
      res.json(videos);
    } catch (error) {
      console.error("Error fetching demo videos:", error);
      res.status(500).json({ error: "Failed to fetch demo videos" });
    }
  });

  // Testimonials API
  app.get("/api/testimonials", async (req, res) => {
    try {
      const featured = req.query.featured === 'true';
      const testimonials = featured 
        ? await storage.getFeaturedTestimonials()
        : await storage.getTestimonials();
      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  app.post("/api/testimonials", async (req, res) => {
    try {
      const parsed = insertTestimonialSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid testimonial data", details: parsed.error.errors });
      }
      const testimonial = await storage.createTestimonial(parsed.data);
      res.status(201).json(testimonial);
    } catch (error) {
      console.error("Error creating testimonial:", error);
      res.status(500).json({ error: "Failed to create testimonial" });
    }
  });

  // Newsletter API - saves to Supabase if configured, otherwise uses local storage
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email, firstName } = req.body;
      
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: "Invalid email address" });
      }

      // Try Supabase first if configured
      if (supabase) {
        console.log('Saving newsletter subscriber to Supabase:', email);
        const result = await saveNewsletterSubscriberToSupabase(email, firstName);
        
        if (!result.success) {
          if (result.error === 'Email already subscribed') {
            return res.status(409).json({ error: "Email already subscribed" });
          }
          console.error('Supabase error:', result.error);
          // Fall through to local storage as backup
        } else {
          console.log('Successfully saved to Supabase');
          return res.status(201).json({ success: true, message: "Successfully subscribed to newsletter" });
        }
      }

      // Fallback to local storage
      const parsed = insertNewsletterSubscriberSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid subscription data", details: parsed.error.errors });
      }
      
      const existing = await storage.getSubscriberByEmail(parsed.data.email);
      if (existing) {
        return res.status(409).json({ error: "Email already subscribed" });
      }
      
      await storage.subscribeNewsletter(parsed.data);
      res.status(201).json({ success: true, message: "Successfully subscribed to newsletter" });
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ error: "Failed to subscribe to newsletter" });
    }
  });

  // Email Signup API (for food chart and other lead magnets)
  app.post("/api/email-signup", async (req, res) => {
    try {
      const { email, source } = req.body;
      
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: "Invalid email address" });
      }

      if (!supabase) {
        console.warn('Supabase not configured, email signup stored locally only');
        return res.status(201).json({ success: true, message: "Email saved" });
      }

      const result = await saveEmailSignup(email, source || 'website');
      
      if (!result.success) {
        console.error('Email signup error:', result.error);
        return res.status(500).json({ error: result.error });
      }

      console.log('Email signup saved:', email, 'source:', source);
      return res.status(201).json({ success: true, message: "Email saved successfully" });
    } catch (error) {
      console.error("Error saving email signup:", error);
      res.status(500).json({ error: "Failed to save email" });
    }
  });

  // Video Analytics API
  app.post("/api/video-analytics", async (req, res) => {
    try {
      const parsed = insertVideoAnalyticsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid analytics data", details: parsed.error.errors });
      }
      const event = await storage.trackVideoEvent(parsed.data);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error tracking video event:", error);
      res.status(500).json({ error: "Failed to track video event" });
    }
  });

  app.get("/api/video-analytics/:videoId", async (req, res) => {
    try {
      const { videoId } = req.params;
      const analytics = await storage.getVideoAnalytics(videoId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching video analytics:", error);
      res.status(500).json({ error: "Failed to fetch video analytics" });
    }
  });

  // A/B Testing API
  app.get("/api/ab-tests/:testName/variants", async (req, res) => {
    try {
      const { testName } = req.params;
      const variants = await storage.getAbTestVariants(testName);
      res.json(variants);
    } catch (error) {
      console.error("Error fetching A/B test variants:", error);
      res.status(500).json({ error: "Failed to fetch A/B test variants" });
    }
  });

  app.post("/api/ab-tests/variants", async (req, res) => {
    try {
      const parsed = insertAbTestVariantSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid variant data", details: parsed.error.errors });
      }
      const variant = await storage.createAbTestVariant(parsed.data);
      res.status(201).json(variant);
    } catch (error) {
      console.error("Error creating A/B test variant:", error);
      res.status(500).json({ error: "Failed to create A/B test variant" });
    }
  });

  app.post("/api/ab-tests/conversions", async (req, res) => {
    try {
      const parsed = insertAbTestConversionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid conversion data", details: parsed.error.errors });
      }
      const conversion = await storage.trackConversion(parsed.data);
      res.status(201).json(conversion);
    } catch (error) {
      console.error("Error tracking conversion:", error);
      res.status(500).json({ error: "Failed to track conversion" });
    }
  });

  app.get("/api/ab-tests/:testName/stats", async (req, res) => {
    try {
      const { testName } = req.params;
      const stats = await storage.getConversionStats(testName);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching A/B test stats:", error);
      res.status(500).json({ error: "Failed to fetch A/B test stats" });
    }
  });

  // Dynamic sitemap with blog posts
  app.get("/sitemap-dynamic.xml", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      const baseUrl = "https://sakredhealth.com";
      
      const staticPages = [
        { loc: "/", priority: "1.0", changefreq: "weekly" },
        { loc: "/routines", priority: "0.9", changefreq: "weekly" },
        { loc: "/blog", priority: "0.9", changefreq: "daily" },
        { loc: "/food-chart", priority: "0.8", changefreq: "monthly" },
        { loc: "/privacy-policy", priority: "0.3", changefreq: "monthly" },
        { loc: "/terms-of-service", priority: "0.3", changefreq: "monthly" },
        { loc: "/ai-privacy", priority: "0.3", changefreq: "monthly" },
        { loc: "/delete-account", priority: "0.2", changefreq: "monthly" },
        { loc: "/delete-data", priority: "0.2", changefreq: "monthly" },
      ];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      for (const page of staticPages) {
        xml += `
  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
      }

      for (const post of posts) {
        const lastmod = post.updatedAt ? new Date(post.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        xml += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }

      xml += `
</urlset>`;

      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  return httpServer;
}
