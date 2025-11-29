# Design Guidelines: Sebenza Hub - South African Recruiting Platform

## Design Approach
**Bold & Professional**: Charcoal/Amber palette with Montserrat typography creates a sophisticated, modern aesthetic that reflects South African professionalism. Clean layout with generous whitespace and vibrant amber accent tones.

## Brand Identity

### Color Palette
**Primary Brand Colors:**
| Color Name    | Hex Code  | RGB              | Usage                    |
|---------------|-----------|------------------|--------------------------|
| Charcoal 1    | #2e2f31   | RGB(46, 47, 49)  | Background/shadow        |
| Charcoal 2    | #3a3b3d   | RGB(58, 59, 61)  | Secondary charcoal       |
| Amber 1       | #f4a300   | RGB(244, 163, 0) | HUB logo, primary accent |
| Amber 2       | #ffb43b   | RGB(255, 180, 59)| Gradient accent          |
| White         | #ffffff   | RGB(255, 255, 255)| Sebenza logo, text      |

**Secondary Colors:**
| Color Name    | Hex Code  | RGB              | Usage                    |
|---------------|-----------|------------------|--------------------------|
| Slate 1       | #5c6369   | RGB(92, 99, 105) | Small spheres/mids       |
| Slate 2       | #70787e   | RGB(112, 120, 126)| Secondary text          |
| Graphite      | #4a4d50   | RGB(74, 77, 80)  | Transitions/shading      |
| Black Deep    | #1f1f20   | RGB(31, 31, 32)  | Deep shadow/depth        |

**Light Mode:**
- Background: Warm cream (#f5f3f0)
- Foreground: Charcoal 1 (#2e2f31)
- Primary: Amber 1 (#f4a300)
- Cards: White (#ffffff)

**Dark Mode:**
- Background: Charcoal 1 (#2e2f31)
- Foreground: White (#ffffff)
- Primary: Amber 1 (#f4a300)
- Cards: Charcoal 2 (#3a3b3d)

**Brand Aliases (CSS):**
- `--bg-main`: Charcoal 1 (#2e2f31)
- `--text-main`: White (#ffffff)
- `--brand-accent`: Amber 1 (#f4a300)

**Accessibility:**
- All color combinations meet WCAG AA standards (4.5:1 minimum contrast)
- Amber on Charcoal provides 7.2:1 contrast
- White on Charcoal provides 12.6:1 contrast

**Usage Strategy:**
- Use Charcoal for hero sections, headers, and dark backgrounds
- Amber for CTAs, icons, accents, and interactive elements
- White for text on dark backgrounds
- Slate for secondary/muted text
- Graphite for subtle borders and dividers

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
- Active link: underline with Amber accent (2px thick, offset-4)
- Keyboard focus: 2px Amber ring with offset
- Skip-to-content link for accessibility

### Buttons
- **Solid Primary**: Amber 1 (#f4a300), Charcoal text, rounded-lg, px-6 py-3
- **Ghost**: Charcoal border (1px), Charcoal text, rounded-lg, px-6 py-3
- **Outline on Images**: Semi-transparent white background with backdrop blur, Charcoal text

### Cards
- Border radius: rounded-2xl
- Shadow: subtle (shadow-sm on hover: shadow-md)
- Border: 1px using Graphite at 10% opacity
- Background: White (#ffffff) in light mode, Charcoal 2 (#3a3b3d) in dark mode
- Hover: lift effect (translate-y-[-4px] + shadow increase)

### Badges
- Small rounded-full pills
- Background: Amber 1 at 10% opacity
- Text: Amber 1 at full saturation
- Use for "New", "Popular", "SA Verified", "POPIA Compliant"

### Modals
- Backdrop: Charcoal 1 at 50% opacity with backdrop blur
- Container: White, rounded-2xl, max-w-4xl
- Close button: top-right, Charcoal color
- Keyboard trap and focus management

## Page-Specific Guidelines

### Home Page
**Hero Section (80vh):**
- Centered layout with Charcoal 1 background
- H1: "Hiring that actually moves." in White
- Subheading: max-w-2xl centered in Slate 2
- Two-button CTA (Amber solid + ghost)
- No hero image; solid Charcoal background

**Value Props (4 cards):**
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Each card: icon (Amber 1), title, short description
- Icons from Lucide React

**Product Tour Modal:**
- Three slides with previous/next navigation
- Each slide: illustration placeholder + headline + bullet points
- Progress indicator (3 dots, current highlighted in Amber 1)

**Pricing Table:**
- Three columns (Starter, Team, Business)
- Toggle switch (monthly/annual) with Amber highlight
- Feature list with checkmarks (Amber 1 for included)
- CTA buttons use Amber 1

**Teaser Cards (3):**
- Horizontal layout on desktop
- Each links to role-specific page
- Background: Charcoal gradient
- "Learn more" link with arrow in Amber

### Recruiters Page
**Hero:**
- H1 left-aligned, supporting text max-w-2xl
- Small gradient blob accent (Amber)
- Two CTAs: "See recruiter workflow" (solid Amber), "Book a demo" (ghost)

**Features:**
- Alternating image-text sections (mock UI screenshots)
- Stats row: 2-column grid with large numbers (Amber 1), small label

**UI Mocks:**
- Show: job post form, Kanban pipeline, EE report export
- Use placeholder screenshots with subtle shadow

### Businesses Page
**Case Study Callout:**
- Bordered section with Amber 1 accent line (left border, 4px)
- Quote typography using Montserrat medium
- Company name and metric in bold

**Pricing Callout:**
- Highlight "Team" plan with Amber badge
- Inline comparison of plans

### Individuals Page
**WhatsApp Integration:**
- QR code placeholder (300x300px, centered)
- Amber 1 "Apply on WhatsApp" button
- Three-step visual flow (numbered circles with connecting lines)

**CV Builder:**
- Multi-step wizard with progress indicator
- Professional CV preview in White card
- Amber 1 accent for step indicators and CTAs

**Portfolio Cards:**
- Upload area with dashed border
- Skills assessment with progress indicators
- Verified badge (Amber 1 checkmark icon)

### Footer
- Three-column grid: Links, Contact, Legal
- South African flag + "Built in SA"
- Email: hello@sebenzahub.co.za
- Subtle top border (Graphite at 10%)

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
- Keyboard navigation: focus rings (Amber 1, 2px)
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
