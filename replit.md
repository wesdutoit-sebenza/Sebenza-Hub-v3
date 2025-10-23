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
- PostgreSQL database actively connected and running (Neon)
- Hybrid storage: Jobs/CVs/Subscribers using in-memory storage, Auth tables using PostgreSQL
- Database schema managed via Drizzle ORM with `npm run db:push`

**Schema Design (Drizzle ORM):**
- PostgreSQL dialect with UUID primary keys (database-generated via `gen_random_uuid()`)
- **Authentication Tables (PostgreSQL):**
  - `users` - Core user accounts (id, email, roles[], onboardingComplete{}, createdAt)
  - `magic_tokens` - Passwordless auth tokens (id, token, email, expiresAt, createdAt)
  - `organizations` - Business/Agency entities (id, name, type, province, city, industry, size, logoUrl, isVerified, plan, jobPostLimit, createdAt)
  - `memberships` - User-to-organization relationships (id, userId, organizationId, role, createdAt)
  - `candidate_profiles` - Job seeker profiles (id, userId, fullName, province, city, jobTitle, experienceLevel, skills[], cvUrl, isPublic, popiaConsentGiven, popiaConsentDate, createdAt, updatedAt)
  - `recruiter_profiles` - Recruiter/agency profiles (id, userId, sectors[], proofUrl, verificationStatus, createdAt, updatedAt)
- **Legacy Tables (In-Memory):**
  - `subscribers` - Email waitlist (migrating to database soon)
  - `jobs` - Job postings (will be linked to organizations after full auth rollout)
  - `cvs` - CV builder data (will be linked to candidate_profiles)
- Zod schema validation for type-safe inserts with required field enforcement

**Database Operations:**
- Schema changes: `npm run db:push` (or `--force` for data-loss warnings)
- Database access: `db` object from `server/db.ts` (Drizzle client)
- Environment variable: `DATABASE_URL` configured automatically by Replit

### Authentication & Authorization

**Current Implementation (October 2025):**

**Passwordless Magic Link Authentication:**
- No passwords stored - users sign in via email magic links (10-minute expiry)
- JWT tokens in httpOnly cookies (7-day expiry, SESSION_SECRET required)
- Email delivery via Resend integration (configured connector)

**Multi-Role User System:**
- Single users table with roles array: `['individual', 'business', 'recruiter']`
- Users can hold multiple roles simultaneously
- Role-specific onboarding tracked via `onboardingComplete` JSONB field

**Auth Endpoints:**
- `POST /auth/magic/start` - Request magic link email
- `GET /auth/verify?token=...` - Verify token, create/login user, redirect to `/onboarding`
- `POST /auth/logout` - Clear session cookie
- `GET /api/me` - Get authenticated user (requires auth)
- `POST /api/me/role` - Add role to user (requires auth)

**Protected Endpoints:**
- `POST /api/profile/candidate` - Create job seeker profile (requires 'individual' role + POPIA consent)
- `POST /api/organizations` - Create company/agency (requires auth)
- `POST /api/profile/recruiter` - Create recruiter profile (requires 'recruiter' role)

**Middleware:**
- `requireAuth` - Verifies JWT cookie, populates `req.user`
- `requireRole(...roles)` - Checks user has one of the specified roles
- `optionalAuth` - Populates `req.user` if token exists, doesn't block if missing

**Onboarding Flow:**
1. User enters email at `/login`
2. Magic link sent to email
3. User clicks link → verified → redirected to `/onboarding`
4. Role selection screen (Individual/Business/Recruiter)
5. Role-specific onboarding form:
   - **Individual** (`/onboarding/individual`) - COMPLETE: Name, location, job title, experience, skills, visibility, POPIA consent
   - **Business** (`/onboarding/business`) - STUB: Placeholder "coming soon" page
   - **Recruiter** (`/onboarding/recruiter`) - STUB: Placeholder "coming soon" page
6. After onboarding → redirect to relevant dashboard

**POPIA Compliance:**
- Candidate profiles require explicit data consent (checkbox + server validation)
- Consent tracked with `popiaConsentGiven` flag and `popiaConsentDate` timestamp
- Backend validates consent before creating profiles (400 error if not provided)

**Security Notes:**
- `SESSION_SECRET` environment variable REQUIRED (app fails fast if missing)
- Cookies: httpOnly, Secure in production, SameSite: lax
- Magic tokens auto-deleted after verification or expiry
- No user passwords stored anywhere

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