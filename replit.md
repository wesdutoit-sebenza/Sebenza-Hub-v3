# Sebenza Hub - South African Recruiting Platform

## Overview
Sebenza Hub is a marketing website for a South African recruiting platform that aims to transform hiring through transparency, compliance, and a WhatsApp-first approach. It connects recruiters, businesses, and job seekers via dedicated landing pages. The platform is a full-stack TypeScript application using React and Express, focused on streamlining hiring, improving candidate experience, and establishing itself as a leading solution in South Africa.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Design System**: Charcoal/Amber color palette, Montserrat typography, custom theming, and mobile-first responsive design using shadcn/ui (Radix UI) and Tailwind CSS.
- **Accessibility & Performance**: Emphasis on ARIA labels, semantic HTML, keyboard navigation, code splitting, and lazy loading.
- **Mobile Dashboard Navigation**: Sticky headers with a hamburger menu for mobile sidebar toggle; sidebar functions as a modal overlay on mobile and displays alongside content on desktop with collapse/expand options.

### Technical Implementations
- **Frontend**: React with TypeScript (Vite), Wouter for routing, and TanStack React Query for state management.
    - **Recruiters Portal**: Job posting forms with WhatsApp integration, an AI Job Description Generator, and a status-based workflow (Draft, Live, Paused, Closed, Filled) with conditional validation. Unique `JOB-XXXXXX` reference numbers are assigned automatically.
        - **Job Import Feature** (October 2025): Recruiters can import job postings via document upload (PDF, DOCX, DOC, TXT) or text paste. Two-tab interface (Upload Document/Paste Text) with AI-powered extraction using GPT-4o to parse job details and populate the job posting form. Leverages existing document parsing infrastructure including OCR fallback for scanned documents. Endpoints: POST /api/jobs/import-parse (document parsing) and POST /api/jobs/import-extract (AI extraction).
    - **Individuals Portal**: Multiple CV management, profile management, competency test access, and an AI Interview Coach ("Jabu") with configurable interviews and real-time feedback. CVs receive unique `CV-XXXXXX` reference numbers, support photo uploads with AI-powered circular cropping, and offer PDF previews.
        - **Competency Test Dashboard**: Integrated test-taking section with two tabs: "Access Test" (enter reference number to start tests) and "My Attempts" (view in-progress and completed tests with status tracking, scores, and results). Seamlessly navigates to standalone test pages (TestAccess, TestTake, TestResults).
    - **ATS**: Candidate management featuring AI-powered resume ingestion and semantic search.
    - **Integrated Roles & Screening**: Management of hiring roles with configurable scoring and AI-evaluated candidate screening.
    - **Competency Test Agent** (November 2025): AI-powered assessment platform with unique `TEST-XXXXXX` reference numbers, supporting three creation methods (AI-generated from job description, manual authoring, pre-built template library). 
        - **AI Test Generation** (Completed): GPT-4o-powered blueprint generation from job descriptions with South African compliance (POPIA, Employment Equity, HPCSA). Generates structured tests with sections, items, weights, cut scores, and anti-cheat configurations. Tested successfully with "Warehouse Supervisor" role.
        - **User Authorization**: Supports both organization-based users (businesses/agencies) and individual recruiters. Tests scoped to organization if membership exists, otherwise scoped to creating user via `createdByUserId`.
        - **Test-Taking Portal** (Completed - October 2025): Full candidate test-taking experience with three public pages (TestAccess, TestTake, TestResults):
            - **Backend API**: 7 endpoints covering public test access, attempt management (creation, retrieval), answer submission, anti-cheat event recording, test submission with scoring, and results retrieval.
            - **Frontend**: Three-page standalone portal for candidates (no authentication required for taking tests via public reference number).
            - **Timer & Security**: Server-authoritative timer enforced via attempt.startedAt timestamp (prevents refresh exploits), hard cutoff on submission (durationMinutes*60 + 5s grace period), real-time anti-cheat tracking of fullscreen exits and tab switches recorded server-side.
            - **Scoring Engine**: Automated calculation of section scores, overall score, and pass/fail determination based on test configuration and correct answers.
            - **Proctoring Data**: IP address logging, fullscreen exits, tab switches, and timestamped events stored in database for recruiter review.
        - **Pending Features**: Multi-format questions (SJT, Likert, work samples - currently MCQ only), ATS integration where test scores automatically update candidate pipeline status, manual authoring UI, pre-built template library, analytics/reporting dashboard surfacing proctoring data.
    - **Organization Settings**: Multi-tenant configuration for teams, pipelines, and compliance.
    - **Location & Job Data**: Comprehensive South African city/town and job title systems with auto-fill.
- **Backend**: Express.js with TypeScript.
    - **API Endpoints**: Manages subscriptions, job postings, CVs, roles/screening, ATS, organization settings, competency testing, and interview coach interactions, including specific endpoints for job status management and conditional validation. CV endpoints include authorization checks.
    - **AI Integration**: Powers CV screening, resume ingestion, interview coaching, fraud detection, and competency test generation.
        - **Hybrid Document Parsing** (October-November 2025): Comprehensive text extraction supporting PDF (text + OCR fallback), DOCX (mammoth), DOC (word-extractor), and TXT formats:
            1. **Text-based PDFs**: Fast extraction via `pdf-parse` v2.x with proper buffer handling (`{ data: buffer }`)
            2. **Image-based/Scanned PDFs**: Automatic OCR fallback using `pdf-to-img` + OpenAI Vision API (GPT-4o)
                - Detects image-based PDFs when text extraction yields <100 characters
                - Converts each page to PNG (scale=2 for clarity)
                - GPT-4o Vision extracts text from images
                - Pages combined with `\n\n` separator
                - Shared OpenAI client with cleanup guarantees via try/finally
                - Processing time: ~10-30 seconds per page
            3. **DOCX files**: `mammoth` library for modern Word document text extraction
            4. **DOC files**: `word-extractor` library for legacy binary Word format support
            - Successfully tested with Wesly's CV (OCR, CV-SBHLQ5), Jabulani's CV (OCR, CV-D4K6WQ), Vuyo's CV (OCR, CV-RN272R)
    - **Background Job Processing**: BullMQ with Redis for asynchronous tasks like candidate screening.
    - **Authentication & Authorization**: Passwordless magic link authentication using Resend, Express-session with PostgreSQL store, and robust security features. Supports a single-role system (individual, business, recruiter, admin) with role-based access control.
    - **User Management**: Users identified by auto-incrementing `id` and unique `email`, with onboarding status and last login tracking.
    - **Admin Setup**: Secure admin creation system via `/api/admin/setup` endpoint protected by `ADMIN_SETUP_SECRET`, which locks after the first admin is created.
- **Data Storage**: PostgreSQL (Neon) with Drizzle ORM and pgvector extension, using UUID primary keys.
    - **Competency Testing Database**: Five-table schema (competency_tests, test_sections, test_items, test_attempts, test_responses) with JSONB for flexible configuration, anti-cheat event tracking, and ATS integration fields.

### System Design Choices
- **Monorepo Structure**: Organized into `client/`, `server/`, and `shared/` directories.
- **South African Context**: POPIA compliance and WhatsApp-first workflow.

## External Dependencies
- **UI & Styling**: Radix UI, shadcn/ui, Lucide React, Tailwind CSS, Google Fonts.
- **Form Handling**: React Hook Form, Zod.
- **Database**: Drizzle ORM, @neondatabase/serverless.
- **File Upload**: Multer, pdf-parse, pdf-to-img, mammoth, word-extractor.
- **Background Jobs**: BullMQ, ioredis.
- **AI**: OpenAI GPT-4o, OpenAI GPT-4o-mini, OpenAI text-embedding-3-small.
- **Email**: Resend.
- **Maps & Geolocation**: Google Maps JavaScript API.

## Database Configuration & Deployment

### Development vs Production Databases
Sebenza Hub uses **separate Neon PostgreSQL databases** for development and production:

**Development Database:**
- Used when running `npm run dev` in the Replit workspace
- Configured via `DATABASE_URL` in Secrets (🔒 icon)
- Connection string format: `postgresql://neondb_owner:...@ep-icy-band-...`

**Production Database:**
- Used by the published app at `.replit.app`
- Configured in deployment environment variables
- Connection string format: `postgresql://neondb_owner:...@ep-floral-bird-...`

### Setting Up Database Connections

**For Development:**
1. Click **🔒 Secrets** in the left sidebar
2. Find or add `DATABASE_URL`
3. Paste your development Neon connection string (without `psql` prefix)
4. Server auto-restarts with new connection

**For Production:**
1. Go to **Deployments** tab in Replit
2. Click on your deployment
3. Add environment variable: `DATABASE_URL`
4. Paste your production Neon connection string

### Running Database Migrations

**Development Migrations:**
```bash
# In the Shell tab at bottom of workspace
npm run db:push --force
```

This syncs your `shared/schema.ts` to the development database.

**Production Migrations:**

**Option 1: Manual Migration (One-Time Setup)**
1. Backup current `DATABASE_URL` secret
2. Temporarily change `DATABASE_URL` to production connection string
3. Run: `npm run db:push --force`
4. Restore `DATABASE_URL` to development connection string

**Option 2: Automated Deployment (Recommended)**
Use the `deploy.sh` script for deployments:
```bash
# This runs migrations + build in one command
./deploy.sh
```

**To enable automatic migrations on deployment:**
1. In Replit, go to your deployment settings
2. Under "Build command", change from `npm run build` to `sh deploy.sh`
3. This ensures migrations run automatically before each deployment

The `deploy.sh` script:
- Runs `npm run db:push --force` (syncs production schema)
- Runs `npm run build` (builds frontend & backend)
- Provides clear status updates during deployment

### Database Schema Management

**Important Rules:**
- ✅ Always update `shared/schema.ts` for schema changes
- ✅ Use `npm run db:push --force` to sync changes to database
- ✅ Run migrations on BOTH development and production after schema changes
- ❌ Never manually write SQL migrations
- ❌ Never change primary key ID column types (breaks existing data)

**Common Commands:**
```bash
# Sync schema to current database
npm run db:push --force

# Check TypeScript types
npm run check

# Run development server
npm run dev

# Build for production
npm run build
```

### Deployment Checklist
Before publishing updates:
- [ ] Test changes in development
- [ ] Update `shared/schema.ts` if database schema changed
- [ ] Run `npm run db:push --force` on development database
- [ ] Verify app works in development
- [ ] Update production `DATABASE_URL` in deployment settings (if not already set)
- [ ] Run migrations on production (Option 1 or 2 above)
- [ ] Publish deployment
- [ ] Test published app at `.replit.app`