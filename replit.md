# Sakred Health - Healthcare Portal & Preventative Wellness Platform

## Overview

Sakred Health is an all-in-one healthcare client portal and preventative wellness platform. It combines private healthcare access (policy search, coverage breakdowns, document access, dedicated agent support, callback scheduling) with preventative wellness features (guided routines, healthy habits, wearable integrations). The platform features a premium organic aesthetic with a warm vanilla cream color scheme.

The application is a marketing landing page that showcases the product's features, pricing, and value proposition, with links to the actual application hosted at `app.sakredhealth.com`.

**Positioning:** Healthcare portal as the primary value proposition, with preventative wellness as a complementary feature. The intersection of private healthcare access and foundational wellness.

**Core Features (from app screenshots):**
- Healthcare Portal: Policy search, coverage summaries, document uploads/access, dedicated agent, support/callback requests
- "Don't Have a Plan?" option: Free broker connection for users without coverage
- Wellness Routines: Guided 14-28 day programs (digestive stability, metabolic support, etc.)
- Healthy Habits: Individual wellness practices users can add to their day
- Wearable Integrations: Fitbit, WHOOP, Oura Ring, Garmin, Apple Health

**Compliance:** All alternative medicine/medical terminology banned. Use only: reset, protocol, stability, preventative wellness, metabolic support, circulation support, foundational wellness, guided routines. DELETED features (never reference): Terrain Theory Translator, AI Coach, Journal/Dream Diary, Cycle Tracker.

**Pricing:** Completely free. No paid tiers, no credit card required.

**Maintenance Banner:** 40px amber banner below nav announcing premium features under maintenance (1-2 week timeline).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **React 18** with TypeScript for the UI framework
- **Vite** as the build tool and development server
- **Wouter** for lightweight client-side routing
- **TanStack Query (React Query)** for server state management and data fetching
- **Framer Motion** for animations and page transitions
- **Tailwind CSS** for utility-first styling

**Component Structure:**
- Follows a component-based architecture with separation between pages and reusable components
- Landing page sections are modular components (Hero, Features, Pricing, FAQ, etc.)
- Uses shadcn/ui component library for consistent UI primitives
- Path aliases configured: `@/` for client/src, `@shared/` for shared code

**Design System:**
- Premium Organic aesthetic with warm vanilla cream backgrounds (#FDFBF7, #F6F4EF)
- Teal/cyan accent colors (#0891B2, #06B6D4) for CTAs and brand elements
- Stone color palette for typography (#1C1917 for headings, #44403C for body text)
- Glassmorphism effects using backdrop-blur and semi-transparent backgrounds
- Watercolor-like soft gradient orbs for atmospheric effects
- Card-based layouts with rounded corners (rounded-2xl) and subtle shadows

**State Management:**
- React Query for API data caching and synchronization
- Local component state with React hooks
- No global state management library (Redux/Zustand) as landing page needs are minimal

### Backend Architecture

**Technology Stack:**
- **Express.js** server for HTTP handling
- **TypeScript** throughout the codebase
- **Drizzle ORM** for database interactions
- **PostgreSQL** as the primary database (configured but may need provisioning)

**API Design:**
- RESTful API endpoints under `/api` prefix
- Blog posts API: `GET /api/blog-posts`, `GET /api/blog-posts/:slug`
- Admin Blog API: `GET /api/admin/blog-posts` (protected by ADMIN_SECRET env var)
- Demo videos API: `GET /api/demo-videos`
- Object Storage uploads: `POST /api/uploads/request-url` (presigned URL flow)
- Database integration via Drizzle ORM with PostgreSQL

**Blog CMS:**
- Admin routes at `/admin/blog` for blog post management
- TipTap rich text editor for content creation
- Draft/Published status workflow with preview tokens
- Auto-SEO generation (title, description, keywords, LLM summary)
- Image upload via Replit Object Storage with presigned URLs
- Basic admin protection via ADMIN_SECRET environment variable

**Server Architecture:**
- Single-file server entry point (`server/index.ts`)
- Middleware pipeline: JSON body parsing, URL encoding, request logging
- Separate static file serving for production builds
- Development mode uses Vite middleware for HMR (Hot Module Replacement)
- Production build bundles server code to single CJS file

### Data Storage

**Database Schema (Drizzle ORM):**
- **users table**: id, username, password (authentication ready but not currently used)
- **blog_posts table**: id, title, slug, excerpt, content, author, featuredImage, featuredImageAlt, tags, published, publishedAt, seoTitle, seoDescription, seoKeywords, canonicalUrl, ogImage, llmSummary, status, draftContent, previewToken, createdAt, updatedAt
- **media_assets table**: id, filename, originalName, mimeType, size, objectPath, url, alt, blogPostId, createdAt
- **demo_videos table**: id, title, description, videoUrl, thumbnailUrl, order

**Storage Abstraction:**
- `IStorage` interface defines storage contract
- `MemStorage` class provides in-memory implementation with sample blog posts
- Database configuration ready via `DATABASE_URL` environment variable
- Migration support configured through Drizzle Kit

**Data Access Pattern:**
- Repository-like pattern through storage interface
- Async/await for all database operations
- Type-safe queries using Drizzle ORM and Zod schemas

### Build & Deployment

**Development Workflow:**
- `npm run dev`: Runs development server with hot reloading
- `npm run build`: Builds both client (Vite) and server (esbuild)
- `npm start`: Production server serving pre-built static files

**Build Process:**
- Client: Vite builds React app to `dist/public`
- Server: esbuild bundles server code to `dist/index.cjs`
- Dependency bundling: Allowlist of specific packages bundled to reduce cold start times
- Static assets served from built public directory in production

**TypeScript Configuration:**
- Strict mode enabled for type safety
- ESNext module resolution with bundler mode
- Path mapping for clean imports
- Incremental compilation for faster builds

## External Dependencies

### UI Component Libraries
- **Radix UI**: Headless accessible components (accordion, dialog, dropdown, etc.)
- **shadcn/ui**: Pre-built component system built on Radix UI
- **Lucide React**: Icon library for consistent iconography

### Animation & Interaction
- **Framer Motion**: Declarative animations for page transitions and micro-interactions
- **Embla Carousel**: Carousel/slider functionality

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant management for components
- **clsx** + **tailwind-merge**: Conditional class name utilities

### Data Fetching & Validation
- **TanStack React Query**: Server state management and caching
- **Zod**: Runtime type validation and schema validation
- **Drizzle Zod**: Integration between Drizzle ORM and Zod schemas

### Database & ORM
- **Drizzle ORM**: Type-safe SQL query builder
- **PostgreSQL** (pg driver): Relational database
- **connect-pg-simple**: PostgreSQL session store for Express (prepared for authentication)

### Markdown & Content
- **react-markdown**: Render markdown content in blog posts
- **remark-gfm**: GitHub Flavored Markdown support

### Build Tools
- **Vite**: Fast build tool and dev server
- **esbuild**: Fast JavaScript bundler for server code
- **tsx**: TypeScript execution for development
- **PostCSS** + **Autoprefixer**: CSS processing

### Development Tools (Replit-specific)
- **@replit/vite-plugin-runtime-error-modal**: Error overlay for development
- **@replit/vite-plugin-cartographer**: Replit code navigation
- **@replit/vite-plugin-dev-banner**: Development environment banner

### Utilities
- **date-fns**: Date formatting and manipulation
- **nanoid**: Unique ID generation
- **wouter**: Lightweight routing library (alternative to React Router)

### External Services
- **Sakred App**: Main application hosted at `https://app.sakredhealth.com` (external)
- No third-party analytics, authentication providers, or payment processors currently integrated in the landing page