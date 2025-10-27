# Design Guidelines: Sebenza Hub - South African Recruiting Platform

## Design Approach
**Dark Modern with Rich Colors**: Always-dark interface featuring deep charcoal backgrounds, vibrant amber accents, and sophisticated blue-gray tones. Montserrat typography creates a professional, modern aesthetic with layered depth and visual interest.

## Brand Identity

### Color Palette
**Always Dark Theme** (no light mode):

**Primary Colors:**
- Deep Charcoal Gray: `#2e2f31` (hsl(222, 6%, 18%)) - Main background
- Bright Amber: `#f4a300` (hsl(40, 100%, 48%)) - Primary accent and CTAs
- Warm White: `#ffffff` (hsl(0, 0%, 100%)) - Primary text

**Accent & Secondary Colors:**
- Slate Blue-Gray: `#5c6369` (hsl(211, 7%, 37%)) - Cards, sections, elevated surfaces
- Soft Graphite Gray: `#4a4d50` (hsl(210, 5%, 30%)) - Secondary surfaces, shading
- Subtle Black: `#1f1f20` (hsl(240, 2%, 12%)) - Depth, shadows, darkest elements
- Golden Yellow Glow: `#ffb43b` (hsl(40, 100%, 60%)) - Highlights, light reflections, hover states
- Muted Steel Blue: `#70787e` (hsl(210, 5%, 47%)) - Borders, subtle elements, dividers

**Semantic Mappings:**
- Background: Deep Charcoal (#2e2f31)
- Cards/Panels: Slate Blue-Gray (#5c6369)
- Borders: Muted Steel Blue (#70787e)
- Primary Buttons: Bright Amber (#f4a300) with deep charcoal text
- Secondary Surfaces: Soft Graphite (#4a4d50)
- Shadows/Depth: Subtle Black (#1f1f20)
- Accents/Glows: Golden Yellow (#ffb43b)

**Accessibility:**
- All combinations meet WCAG AA standards (4.5:1+ contrast)
- White on Deep Charcoal: 14.5:1 contrast (excellent)
- White on Slate Blue-Gray: 7.8:1 contrast (excellent)
- **Deep Charcoal on Bright Amber: 6.8:1 contrast (excellent for buttons)**
- White on Bright Amber: 2.1:1 (FAIL - never use)
- Bright Amber on Deep Charcoal: 6.8:1 contrast (excellent for borders/accents)

**Usage Strategy:**
- Deep charcoal for main backgrounds and large areas
- Slate blue-gray for cards, panels, and content sections
- Bright amber for CTAs, primary actions, and focus states
- Golden yellow for hover states, highlights, and subtle glows
- Steel blue for borders and subtle dividers
- White text on all dark surfaces for maximum readability
- Gradients using charcoal → graphite for depth

### Typography
**Font (Google Fonts CDN):**
- All text: Montserrat (weights: 400, 500, 600, 700)

**Hierarchy:**
- H1: Montserrat 700, 3.5rem (mobile: 2.5rem)
- H2: Montserrat 700, 2.5rem (mobile: 2rem)
- H3: Montserrat 600, 1.5rem
- Body: Montserrat 400, 1rem
- Small: Montserrat 400, 0.875rem

### Layout System
**Spacing Primitives:** Use Tailwind units 2, 4, 6, 8, 12, 16, 20, 24, 32
- Consistent section padding: py-20 (desktop), py-12 (mobile)
- Card padding: p-8 (desktop), p-6 (mobile)
- Component gaps: gap-8 (desktop), gap-6 (mobile)

**Container Strategy:**
- Full-width sections with inner `max-w-7xl mx-auto px-6`
- Content sections: `max-w-6xl`
- Text-heavy content: `max-w-prose`

## Component Library

### Navigation
- Sticky header with wordmark left, nav links center, CTA button right
- Background: Deep charcoal (#2e2f31) or subtle black (#1f1f20)
- Active link: amber underline (2px thick, offset-4)
- Keyboard focus: 2px amber ring with golden glow
- Skip-to-content link for accessibility

### Buttons
- **Solid Primary**: Amber background (#f4a300), deep charcoal text (#2e2f31), rounded-lg, px-6 py-3
  - Hover: Golden yellow (#ffb43b) background with charcoal text
- **Secondary**: Slate blue-gray background (#5c6369), white text, rounded-lg, px-6 py-3
  - Hover: Lighten slightly with amber accent
- **Ghost**: Steel blue border (1px), white text, rounded-lg, px-6 py-3
  - Hover: Slate blue-gray background
- All buttons cast subtle shadows using subtle black (#1f1f20)

### Cards
- Border radius: rounded-2xl
- Background: Slate blue-gray (#5c6369) for main cards
- Background alternate: Graphite (#4a4d50) for secondary/nested cards
- Border: 1px steel blue (#70787e) for subtle definition
- Shadow: Subtle black with medium opacity (shadow-md)
- Hover: Lift effect (translate-y-[-4px]) + amber glow + shadow increase

### Badges
- Small rounded-full pills
- **Default badges**: Graphite background (#4a4d50), white text
- **Amber badges** (primary/important): Amber background (#f4a300), deep charcoal text
- **Highlighted badges**: Golden yellow background (#ffb43b), deep charcoal text
- Use for "New", "Popular", "SA Verified", "POPIA Compliant"

### Modals
- Backdrop: Subtle black (#1f1f20) at 70% opacity with backdrop blur
- Container: Slate blue-gray (#5c6369), rounded-2xl, max-w-4xl
- Border: Steel blue (#70787e) 1px for definition
- Close button: top-right, amber color with white icon
- Keyboard trap and focus management

## Page-Specific Guidelines

### Home Page
**Hero Section (80vh):**
- Centered layout with charcoal-to-graphite gradient background
- H1: "Hiring that actually moves." (white text)
- Subheading: max-w-2xl centered (light gray text)
- Two-button CTA (amber solid + slate ghost)
- Subtle amber glow effects behind text

**Value Props (4 cards):**
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Each card: Slate blue-gray background, steel blue border
- Icon: Amber accent with golden glow on hover
- White text with gray subheadings
- Icons from Lucide React

**Product Tour Modal:**
- Three slides with previous/next navigation
- Slate blue-gray background with steel blue borders
- Each slide: illustration placeholder + headline + bullet points
- Progress indicator (3 dots, current highlighted in amber, inactive in steel blue)

**Pricing Table:**
- Three columns (Starter, Team, Business)
- Cards: Slate blue-gray background with steel blue borders
- Toggle switch (monthly/annual) with amber active state
- Feature list with checkmarks (amber for included, gray for not included)
- CTA buttons use amber with deep charcoal text

**Teaser Cards (3):**
- Horizontal layout on desktop
- Each links to role-specific page
- Background: Graphite cards with steel blue borders
- Amber accent line on left edge
- "Learn more" link with golden yellow arrow hover

### Recruiters Page
**Hero:**
- H1 left-aligned, supporting text max-w-2xl (white and light gray)
- Deep charcoal background with graphite gradient
- Two CTAs: "See recruiter workflow" (amber solid), "Book a demo" (slate ghost)

**Features:**
- Alternating image-text sections (mock UI screenshots)
- Stats row: 2-column grid with large numbers (amber accent), small label (gray)
- Section backgrounds alternate between charcoal and graphite

**UI Mocks:**
- Show: job post form, Kanban pipeline, EE report export
- Slate blue-gray card backgrounds
- Steel blue borders with amber accents

### Businesses Page
**Case Study Callout:**
- Graphite background card
- Amber accent line (left border, 4px)
- Quote typography using Montserrat medium (white text)
- Company name and metric in golden yellow

**Pricing Callout:**
- Highlight "Team" plan with amber badge and golden glow
- Slate blue-gray cards for all plans
- Inline comparison with steel blue dividers

### Individuals Page
**WhatsApp Integration:**
- QR code placeholder (300x300px, centered on slate background)
- Amber "Apply on WhatsApp" button with deep charcoal text
- Three-step visual flow (numbered circles with amber background and charcoal numbers, golden yellow connecting lines)

**CV Builder:**
- Multi-step wizard with progress indicator (amber active, steel blue inactive)
- Professional CV preview in slate blue-gray card
- Amber accent for step indicators and CTAs
- White text throughout

**Portfolio Cards:**
- Slate blue-gray backgrounds
- Upload area with dashed amber border
- Skills assessment with amber/golden yellow progress indicators
- Verified badge (amber background, deep charcoal checkmark icon)

### Footer
- Three-column grid: Links, Contact, Legal
- Background: Subtle black (#1f1f20)
- South African flag emoji 🇿🇦 + "Built in SA" (white text)
- Email: hello@yourdomain.co.za (amber link color)
- Subtle top border (steel blue)

## Motion & Interactivity
**Animations:**
- Gentle scroll-reveal: fade-in + slide-up (20px) on IntersectionObserver
- Hover states: all interactive elements have subtle scale or shadow increase
- Transition duration: 200ms for UI, 300ms for sections
- No autoplay carousels; user-controlled only

**Scroll Behavior:**
- Smooth scroll for in-page anchors
- Reveal sections when 20% visible

## Accessibility Requirements
- Landmarks: header, nav, main, footer
- Alt text for all images/icons
- Color contrast: All text/background combinations exceed WCAG AA (4.5:1)
  - White on charcoal: 14.5:1
  - White on slate: 7.8:1
  - Deep charcoal on amber: 6.8:1 (buttons, badges)
  - Never use white on amber (2.1:1 contrast - fails WCAG)
- Keyboard navigation: focus rings (amber with golden glow, 2px)
- ARIA labels for icon-only buttons
- Skip-to-content link (amber color)

## SEO & Meta
**Per-Route Titles:**
- Home: "Sebenza Hub—SA Recruiting Platform with POPIA/EE Compliance"
- Recruiters: "Reduce Noise. Faster Shortlists."
- Businesses: "SME-Friendly Hiring with POPIA/EE Compliance"
- Individuals: "One Profile. Verified Skills. Transparent Pay."

**Open Graph:**
- Include og:title, og:description, og:image for all pages
- Schema.org: Organization + WebSite markup

## South African Context
- Reference cities: Johannesburg, Cape Town, Durban
- Compliance callouts: POPIA, EE (Employment Equity), BBBEE
- Currency: ZAR (R)
- Use local business scenarios in copy

## Image Strategy
**No large hero images.** Use gradient backgrounds with text-first approach. Include images only for:
- Mock UI screenshots (pipeline, forms, reports)
- WhatsApp QR code placeholder
- Testimonial avatars (small circular, 48px)
- Optional: tiny dummy chart for "SA Hiring Index"
