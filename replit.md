# HireMove - South African Recruiting Platform

## Overview

HireMove is a marketing website for a South African recruiting platform that emphasizes transparency, compliance, and WhatsApp-first hiring workflows. The platform serves three distinct audiences: recruiters, businesses, and job seekers (individuals). It features a modern, minimal design with strategic color accents, built with a focus on performance, accessibility, and mobile-first responsiveness.

The application is a full-stack TypeScript solution with a React frontend and Express backend, designed to capture early-access subscribers and showcase the platform's value propositions through distinct landing pages for each user segment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- Vite-powered React application with TypeScript
- Wouter for client-side routing (lightweight React Router alternative)
- TanStack React Query for server state management
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom design system

**Design System:**
- Color palette: Base colors (ink `#0B1220`, off-white `#F8FAFC`) with strategic accent colors (violet, cyan, green, amber)
- Typography: Inter for UI/body text, Newsreader for headlines (Google Fonts)
- Component-driven architecture using shadcn/ui with custom theming
- Mobile-first responsive design targeting Lighthouse 95+ scores
- Custom CSS variables for theming with light/dark mode support

**Routing Structure:**
- `/` - Home page with hero, value propositions, product tour modal, pricing table, testimonials, and FAQ
- `/recruiters` - Dedicated page for recruiting professionals with job posting functionality
- `/businesses` - SME-focused hiring solutions
- `/individuals` - Job seeker profile with job search, filtering, and CV builder wizard
- 404 handling for unmatched routes

**Key Features:**

**Recruiters Page:**
- Job posting form with validation
- Numeric salary range inputs (min/max with validation)
- WhatsApp contact integration
- Employment type and industry categorization

**Individuals Page:**
- Job search and filtering system
  - Dynamic filters generated from actual job data (location, industry, employment type)
  - Real-time search across job titles, companies, and descriptions
  - Clear filters functionality
  - Job count display
- Multi-step CV builder wizard (7 steps)
  - Step 1: Personal Information (name, contact, demographics)
  - Step 2: Work Experience (positions, responsibilities, embedded references)
  - Step 3: Skills (soft skills, technical skills, languages)
  - Step 4: Education (qualifications, institutions, periods)
  - Step 5: Professional References (standalone references with contact details)
  - Step 6: About Me (professional summary)
  - Step 7: Preview (professional formatted CV preview)
- All forms use react-hook-form with Zod validation
- Required field enforcement at schema level
- Professional CV preview matching South African CV format standards
- Toggle between CV builder and job browsing

**State Management:**
- React Query for API calls and caching
- Local component state with React hooks
- Toast notifications for user feedback

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- Custom Vite middleware integration for development
- Static file serving for production builds

**API Endpoints:**
- `POST /api/subscribe` - Email subscription for early access waitlist
- `GET /api/subscribers` - Retrieve all subscribers (admin endpoint)
- `POST /api/jobs` - Create new job posting (recruiter endpoint)
- `GET /api/jobs` - Retrieve all job postings with count
- `POST /api/cvs` - Create new CV (job seeker endpoint)
- `GET /api/cvs/:id` - Retrieve specific CV by ID
- `PUT /api/cvs/:id` - Update existing CV

**Request/Response Flow:**
- JSON body parsing with raw body preservation for webhook support
- Custom logging middleware for API request tracking
- Error handling with structured JSON responses

**Development vs Production:**
- Development: Vite dev server with HMR, middleware mode
- Production: Pre-built static assets served by Express
- Replit-specific plugins for runtime error overlay and development banners

### Data Storage

**Current Implementation:**
- In-memory storage (`MemStorage` class) for development/demo purposes
- Interface-based storage abstraction (`IStorage`) for future database integration

**Schema Design (Drizzle ORM):**
- PostgreSQL dialect configuration
- Five primary tables:
  - `users`: Basic authentication (id, username, password)
  - `subscribers`: Email waitlist (id, email, createdAt)
  - `jobs`: Job postings (id, title, company, location, salaryMin, salaryMax, description, requirements, whatsappContact, employmentType, industry, createdAt)
  - `cvs`: CV/Resume data (id, userId, personalInfo, workExperience, skills, education, references, aboutMe, createdAt, updatedAt)
- UUID primary keys with database-level generation
- Zod schema validation for type-safe inserts with required field enforcement
- Complex nested JSON structures for CV sections (work experience, skills, education, references)

**Future Database Integration:**
- Configured for PostgreSQL via Drizzle ORM
- Neon Database serverless driver specified in dependencies
- Migration directory: `./migrations`
- Ready for `drizzle-kit push` deployment

### Authentication & Authorization

**Current State:**
- User schema defined but authentication not yet implemented
- Subscriber endpoints are publicly accessible
- No session management or auth middleware currently active

**Prepared Infrastructure:**
- `connect-pg-simple` included for PostgreSQL session storage
- User password storage schema ready (note: hashing should be implemented before production)

### External Dependencies

**UI Component Library:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui configuration for component theming
- Lucide React for iconography

**Styling & Design:**
- Tailwind CSS with custom configuration
- PostCSS with autoprefixer
- Google Fonts API (Inter, Newsreader)

**Development Tools:**
- Replit-specific plugins:
  - `@replit/vite-plugin-runtime-error-modal` - Error overlay
  - `@replit/vite-plugin-cartographer` - Code navigation
  - `@replit/vite-plugin-dev-banner` - Development indicator
- ESBuild for server-side bundling in production

**Form Handling:**
- React Hook Form with Zod resolvers for type-safe validation
- Integration with shadcn/ui form components

**Database (Configured but not connected):**
- Drizzle ORM for type-safe database queries
- @neondatabase/serverless for serverless PostgreSQL
- Environment variable `DATABASE_URL` required for activation

**Utilities:**
- date-fns for date manipulation
- clsx and tailwind-merge for conditional className handling
- class-variance-authority for variant-based component styling

### Key Architectural Decisions

**Monorepo Structure:**
- `client/` - Frontend React application
- `server/` - Express backend
- `shared/` - Shared TypeScript types and schemas
- Path aliases configured: `@/` (client), `@shared/` (shared), `@assets/` (static assets)

**Build Strategy:**
- Client: Vite builds to `dist/public`
- Server: ESBuild bundles to `dist/index.js` with external packages
- Single production startup command runs bundled server

**Accessibility Focus:**
- Skip-to-content link on all pages
- ARIA labels and semantic HTML
- Keyboard navigation support in modals and interactive components
- Focus management in dialogs and overlays

**Performance Optimizations:**
- Code splitting via Vite
- Lazy loading for routes
- Optimized font loading with preconnect
- Static asset caching strategy

**South African Context:**
- POPIA (Protection of Personal Information Act) compliance features
- Employment Equity (EE) reporting capabilities
- Integration placeholders for SA job boards (Pnet, CareerJunction, Adzuna)
- WhatsApp-first application workflow