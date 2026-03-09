# Sakred Health Design Guidelines - Premium Organic Aesthetic

## Design Philosophy
"Premium Organic" - A wellness experience built around natural paper, calmness, and clarity. The interface evokes sunlit spaces with watercolor-like softness while maintaining premium digital quality.

## Color System

**Backgrounds (Vanilla Foundation):**
- Main BG: `#FDFBF7` (Warm Vanilla/Cream) - primary page background
- Secondary BG: `#F6F4EF` (Stone/Paper) - distinct sections
- Never use stark white `#ffffff` as page background

**Typography Colors (Accessible Contrast):**
- Headings: `#1C1917` (Warm Black/Stone 900)
- Body Text: `#44403C` (Stone 700) - softer, readable on cream
- Links/Accents: `#0E7490` (Deep Teal) - ensures accessibility on cream

**Brand Accents:**
- Primary Actions/Buttons: `#0891B2` (Teal 600)
- Gradient Highlights: Teal 600 to Cyan 500 for text emphasis
- Decorative Glows: `#67E8F9` (Cyan 300) - background blurs/gradients only, never text
- Success States: `#14B8A6` (Teal 500)

## Layout & Spacing
Use Tailwind spacing units: 4, 8, 12, 16, 20, 24, 32 for consistent rhythm. Generous whitespace with section padding: `py-20` desktop, `py-12` mobile.

## Typography Hierarchy
- **Headings:** Tight tracking (`-0.02em`), bold weight, warm black color
- **Body:** Regular weight, stone color, comfortable line-height (1.7)
- **Accents:** Deep teal for emphasis and links

## Component Design Language

**Cards (Features, Benefits, Steps):**
- White background sitting on cream base
- Rounded corners: `rounded-2xl` (24px)
- Shadows: Warm, diffused `shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]`
- Hover: Scale lift `scale-[1.02]` with enhanced shadow
- Borders: Subtle organic `border-stone-200` or `border-stone-900/5`
- Icons: Thin elegant strokes in `#0891B2`

**Frosted Ice Glassmorphism:**
- `bg-white/60 backdrop-blur-md border border-white/40 shadow-sm`
- Use for overlays, navigation, modals

**Buttons:**
- Primary: Solid `#0891B2` background, white text, `rounded-full`, soft shadow `shadow-cyan-900/20`
- Secondary: Border `#0891B2`, text `#0891B2`, white/50 background
- Hover: Gentle lift `-translate-y-0.5`, no color changes

## Page Structure & Sections

**Navigation:**
- Semi-transparent vanilla background with blur
- Logo: "Sakred" (dark), "Health" (teal)
- Links in warm black, active states in deep teal
- CTA button: Solid teal, rounded-full

**Hero Section:**
- Clean, airy, sunlit atmosphere
- Watercolor Orb animations: Absolute positioned divs with `bg-cyan-200/40` and `bg-teal-200/40`, heavily blurred `blur-3xl`, floating with Framer Motion
- Headline in warm black, gradient phrase from teal-600 to cyan-500
- Primary CTA: Teal background, secondary outlined
- Include hero image showcasing app interface in elegant device mockup

**Demo Video Showcase:**
- White card containers with warm shadows
- Video players with subtle rounded corners
- Descriptive captions in stone color

**Life Transformation Sections:**
- Focus on results and lifestyle changes, not features
- Use testimonial-style layouts with authentic imagery
- Before/after visual comparisons where appropriate

**Features Grid:**
- 3-column desktop, 2-column tablet, 1-column mobile
- White cards with hover lift effects
- Icons in teal, descriptions in stone

**Pricing:**
- Side-by-side comparison cards
- Highlight "Premium" with subtle teal accent border
- Feature lists with checkmarks in teal

**Blog:**
- Article cards in grid layout
- Featured images with soft rounded corners
- Tags in teal, metadata in stone color
- Search/filter bar with frosted ice glassmorphism

**Footer (Inverted Section):**
- Dark background `#15202B` to ground the page
- Vanilla text `#FDFBF7`
- Creates visual rhythm and closure

## Motion Design
- Framer Motion for entrance animations: staggered fade-ins from `y: 20, opacity: 0` to `y: 0, opacity: 1`
- Watercolor orbs: slow floating motion with gentle scale/position changes
- Card hovers: smooth scale and shadow transitions `duration-300`
- Button interactions: gentle lifts, no abrupt color changes

## Imagery Strategy
- Hero: App mockup in elegant device frame against watercolor orb background
- Life transformation sections: Authentic lifestyle photography showing wellness activities
- Blog: High-quality featured images for each post
- Avoid stock photos; prefer custom illustrations or authentic user photography

## Accessibility & Contrast
All text maintains WCAG AA standards against cream backgrounds. Deep teal provides sufficient contrast for interactive elements. Never use light cyan for text.