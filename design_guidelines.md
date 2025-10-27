# Design Guidelines: Sebenza Hub - South African Recruiting Platform

## Design Approach
**Minimalist Monochrome with Amber Accent**: Ultra-clean grayscale palette with amber (#f4a300) as the only color accent. High-contrast black and white with Montserrat typography creates a striking, modern, tech-forward aesthetic.

## Brand Identity

### Color Palette
**Light Mode (Default):**
- Background: `#fafafa` (near-white) - hsl(0, 0%, 98%)
- Foreground: `#000000` (true black) - hsl(0, 0%, 0%)
- Card Background: `#ffffff` (pure white) - hsl(0, 0%, 100%)
- Borders: `#e0e0e0` (light gray) - hsl(0, 0%, 88%)
- Muted Text: `#666666` (medium gray) - hsl(0, 0%, 40%)

**Dark Mode:**
- Background: `#1a1a1b` (near-black) - hsl(240, 3%, 10%)
- Foreground: `#ffffff` (true white) - hsl(0, 0%, 100%)
- Card Background: `#2a2a2b` (dark gray) - hsl(240, 2%, 17%)
- Borders: `#404040` (medium gray) - hsl(0, 0%, 25%)
- Muted Text: `#a6a6a6` (light gray) - hsl(0, 0%, 65%)

**Accent Color (Only Color in Palette):**
- Primary: `#f4a300` (amber) - hsl(40, 100%, 48%)
- Primary Foreground: Black `#000000` - hsl(0, 0%, 0%)
- Used exclusively for: CTAs, links, focus rings, active states, and key interactive elements

**Grayscale Chart Colors:**
- Chart 1: Amber `#f4a300` (primary data)
- Chart 2-5: Varying shades of gray for secondary data

**Accessibility:**
- All combinations meet WCAG AA standards (4.5:1+ contrast)
- Light mode: Background/foreground 21:1 (maximum contrast)
- Dark mode: Background/foreground 19.5:1 (maximum contrast)
- Amber buttons: Black text on amber (#f4a300) provides 8.9:1 contrast (excellent)
- **Important**: Amber on light backgrounds has low contrast (~2.0:1) - only use amber for:
  - Button/badge backgrounds with black text
  - Thick borders (2px+) where shape provides recognition
  - Focus rings and accents where context is clear
  - Never use amber text on light backgrounds

**Usage Strategy:**
- Monochrome base: 95% of design uses pure blacks, whites, and grays
- Amber accent: 5% usage for CTAs, links, and critical interactive elements only
- No other colors used anywhere in the application
- Borders and dividers: subtle gray tones
- Shadows: black with low opacity

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
- Active link: underline with amber accent (2px thick, offset-4)
- Keyboard focus: 2px amber ring with offset
- Skip-to-content link for accessibility

### Buttons
- **Solid Primary**: Amber background (#f4a300), black text, rounded-lg, px-6 py-3
- **Ghost**: Black/white border (1px), black/white text, rounded-lg, px-6 py-3
- **Outline on Images**: Semi-transparent white/black background with backdrop blur
- Hover: Amber buttons slightly darken, ghost buttons show subtle gray background

### Cards
- Border radius: rounded-2xl
- Shadow: subtle (shadow-sm on hover: shadow-md)
- Border: 1px using gray (#e0e0e0 light, #404040 dark)
- Background: Pure white (light mode), dark gray (dark mode)
- Hover: lift effect (translate-y-[-4px] + shadow increase)

### Badges
- Small rounded-full pills
- **Default badges**: Light gray background (light mode), dark gray background (dark mode), black/white text
- **Amber badges** (for primary/important items): Amber background (#f4a300), black text
- Never use white text on amber - always black text
- Use for "New", "Popular", "SA Verified", "POPIA Compliant"

### Modals
- Backdrop: Black at 50% opacity with backdrop blur
- Container: White (light mode), dark gray (dark mode), rounded-2xl, max-w-4xl
- Close button: top-right, black/white color
- Keyboard trap and focus management

## Page-Specific Guidelines

### Home Page
**Hero Section (80vh):**
- Centered layout with subtle gradient background (light gray to white)
- H1: "Hiring that actually moves."
- Subheading: max-w-2xl centered
- Two-button CTA (amber solid + ghost)
- No hero image; minimal gradient background only

**Value Props (4 cards):**
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Each card: icon (amber accent), title, short description
- Icons from Lucide React

**Product Tour Modal:**
- Three slides with previous/next navigation
- Each slide: illustration placeholder + headline + bullet points
- Progress indicator (3 dots, current highlighted in amber)

**Pricing Table:**
- Three columns (Starter, Team, Business)
- Toggle switch (monthly/annual) with amber highlight
- Feature list with checkmarks (amber for included)
- CTA buttons use amber

**Teaser Cards (3):**
- Horizontal layout on desktop
- Each links to role-specific page
- Background: white cards with subtle gray borders
- "Learn more" link with amber arrow

### Recruiters Page
**Hero:**
- H1 left-aligned, supporting text max-w-2xl
- Minimal design with clean white/black backgrounds
- Two CTAs: "See recruiter workflow" (amber solid), "Book a demo" (ghost)

**Features:**
- Alternating image-text sections (mock UI screenshots)
- Stats row: 2-column grid with large numbers (amber accent), small label

**UI Mocks:**
- Show: job post form, Kanban pipeline, EE report export
- Use placeholder screenshots with subtle shadow

### Businesses Page
**Case Study Callout:**
- Bordered section with amber accent line (left border, 4px)
- Quote typography using Montserrat medium
- Company name and metric in bold

**Pricing Callout:**
- Highlight "Team" plan with amber badge
- Inline comparison of plans

### Individuals Page
**WhatsApp Integration:**
- QR code placeholder (300x300px, centered)
- Amber "Apply on WhatsApp" button
- Three-step visual flow (numbered circles with amber connecting lines)

**CV Builder:**
- Multi-step wizard with progress indicator
- Professional CV preview in white/dark gray card
- Amber accent for step indicators and CTAs

**Portfolio Cards:**
- Upload area with dashed gray border
- Skills assessment with amber progress indicators
- Verified badge (amber checkmark icon)

### Footer
- Three-column grid: Links, Contact, Legal
- South African flag emoji 🇿🇦 + "Built in SA"
- Email: hello@yourdomain.co.za
- Subtle top border (light gray in light mode, dark gray in dark mode)

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
- Color contrast: minimum 4.5:1 for text (exceeded with black/white monochrome)
- Keyboard navigation: focus rings (amber, 2px)
- ARIA labels for icon-only buttons
- Skip-to-content link

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
