# Design Guidelines: South African Recruiting Platform Marketing Site

## Design Approach
**Reference-Based**: Inspired by modern SaaS marketing sites (Linear, Stripe, Vercel) with South African cultural context. Minimal layout with strategic color accents and generous whitespace.

## Brand Identity

### Color Palette
**Base Colors:**
- Primary: `#0B1220` (deep ink) - 216 76% 6%
- Background: `#F8FAFC` (off-white) - 210 40% 98%

**Accent Colors:**
- Violet: `#8B5CF6` - 258 90% 66%
- Cyan: `#0EA5E9` - 199 89% 48%
- Green: `#10B981` - 160 84% 39%
- Amber: `#F59E0B` - 38 92% 50%

**Usage Strategy:**
- Use base colors for 85% of the design (ink on off-white)
- Accent colors as strategic pops (CTAs, badges, hover states, section dividers)
- Primary CTA gradient: cyan→violet
- Never use all four accents on one page; rotate them purposefully
- Cards: 1px border using ink at 10% opacity

### Typography
**Fonts (Google Fonts CDN):**
- UI/Body: Inter (weights: 400, 500, 600, 700)
- Headlines: Newsreader (weights: 400, 600)

**Hierarchy:**
- H1: Newsreader 600, 3.5rem (mobile: 2.5rem)
- H2: Newsreader 600, 2.5rem (mobile: 2rem)
- H3: Inter 600, 1.5rem
- Body: Inter 400, 1rem
- Small: Inter 400, 0.875rem

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
- Active link: underline with violet accent (2px thick, offset-4)
- Keyboard focus: 2px cyan ring with offset
- Skip-to-content link for accessibility

### Buttons
- **Solid Primary**: Gradient cyan→violet, white text, rounded-lg, px-6 py-3
- **Ghost**: Ink border (1px), ink text, rounded-lg, px-6 py-3
- **Outline on Images**: Semi-transparent white background with backdrop blur, white text

### Cards
- Border radius: rounded-2xl
- Shadow: subtle (shadow-sm on hover: shadow-md)
- Border: 1px using ink at 10% opacity
- Background: white
- Hover: lift effect (translate-y-[-4px] + shadow increase)

### Badges
- Small rounded-full pills
- Background: accent color at 10% opacity
- Text: matching accent at full saturation
- Use for "New", "Popular", "SA Verified", "POPIA Compliant"

### Modals
- Backdrop: ink at 50% opacity with backdrop blur
- Container: white, rounded-2xl, max-w-4xl
- Close button: top-right, ink color
- Keyboard trap and focus management

## Page-Specific Guidelines

### Home Page
**Hero Section (80vh):**
- Centered layout with GradientBlob background (subtle violet→cyan gradient)
- H1: "Hiring that actually moves."
- Subheading: max-w-2xl centered
- Two-button CTA (primary solid + ghost)
- No hero image; gradient background only

**Value Props (4 cards):**
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Each card: icon (accent color), title, short description
- Icons from Heroicons (solid variant)

**Product Tour Modal:**
- Three slides with previous/next navigation
- Each slide: illustration placeholder + headline + bullet points
- Progress indicator (3 dots, current highlighted in violet)

**Pricing Table:**
- Three columns (Starter, Team, Business)
- Toggle switch (monthly/annual) with green highlight
- Feature list with checkmarks (green for included)
- CTA buttons use different accents per tier

**Teaser Cards (3):**
- Horizontal layout on desktop
- Each links to role-specific page
- Background: subtle gradient matching target page accent
- "Learn more" link with arrow

### Recruiters Page
**Hero:**
- H1 left-aligned, supporting text max-w-2xl
- Small gradient blob accent (cyan)
- Two CTAs: "See recruiter workflow" (solid), "Book a demo" (ghost)

**Features:**
- Alternating image-text sections (mock UI screenshots)
- Stats row: 2-column grid with large numbers (violet), small label

**UI Mocks:**
- Show: job post form, Kanban pipeline, EE report export
- Use placeholder screenshots with subtle shadow

### Businesses Page
**Case Study Callout:**
- Bordered section with amber accent line (left border, 4px)
- Quote typography using Newsreader italic
- Company name and metric in bold

**Pricing Callout:**
- Highlight "Team" plan with green badge
- Inline comparison of plans

### Individuals Page
**WhatsApp Integration:**
- QR code placeholder (300x300px, centered)
- Green "Apply on WhatsApp" button
- Three-step visual flow (numbered circles with connecting lines)

**Portfolio Cards:**
- Upload area with dashed border
- Skills assessment with progress indicators
- Verified badge (green checkmark icon)

### Footer
- Three-column grid: Links, Contact, Legal
- South African flag emoji 🇿🇦 + "Built in SA"
- Email: hello@yourdomain.co.za
- Subtle top border (ink at 10%)

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
- Color contrast: minimum 4.5:1 for text
- Keyboard navigation: focus rings (cyan, 2px)
- ARIA labels for icon-only buttons
- Skip-to-content link

## SEO & Meta
**Per-Route Titles:**
- Home: "SA Recruiting Platform—Trust Layer, WhatsApp-First, Compliance"
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
**No large hero images.** Use gradient backgrounds (GradientBlob component) with text-first approach. Include images only for:
- Mock UI screenshots (pipeline, forms, reports)
- WhatsApp QR code placeholder
- Testimonial avatars (small circular, 48px)
- Optional: tiny dummy chart for "SA Hiring Index"