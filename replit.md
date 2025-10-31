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
    - **Individuals Portal**: Multiple CV management, profile management, and an AI Interview Coach ("Jabu") with configurable interviews and real-time feedback. CVs receive unique `CV-XXXXXX` reference numbers, support photo uploads with AI-powered circular cropping, and offer PDF previews.
    - **ATS**: Candidate management featuring AI-powered resume ingestion and semantic search.
    - **Integrated Roles & Screening**: Management of hiring roles with configurable scoring and AI-evaluated candidate screening.
    - **Competency Test Agent** (November 2025): AI-powered assessment platform with unique `TEST-XXXXXX` reference numbers, supporting three creation methods (AI-generated from job description, manual authoring, pre-built template library). 
        - **AI Test Generation** (Completed): GPT-4o-powered blueprint generation from job descriptions with South African compliance (POPIA, Employment Equity, HPCSA). Generates structured tests with sections, items, weights, cut scores, and anti-cheat configurations. Tested successfully with "Warehouse Supervisor" role.
        - **User Authorization**: Supports both organization-based users (businesses/agencies) and individual recruiters. Tests scoped to organization if membership exists, otherwise scoped to creating user via `createdByUserId`.
        - **Test-Taking API** (In Progress - October 2025): Complete candidate test-taking backend with endpoints for public test access, attempt creation, answer submission, scoring, and results retrieval.
        - **Pending Features**: Candidate test portal UI with timer and progress tracking, multi-format questions (MCQ, SJT, Likert, work samples), advanced anti-cheat features, ATS integration where test scores automatically update candidate pipeline status, manual authoring UI, pre-built template library.
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