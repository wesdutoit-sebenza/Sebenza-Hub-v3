# Sebenza Hub - South African Recruiting Platform

## Overview
Sebenza Hub is a marketing website for a South African recruiting platform designed to revolutionize hiring by emphasizing transparency, compliance, and a WhatsApp-first approach. It connects recruiters, businesses, and job seekers through dedicated landing pages. The platform is a full-stack TypeScript application utilizing React and Express, focused on streamlining the hiring process, enhancing candidate experience, and aiming to become a leading recruitment solution in South Africa.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Design System**: Utilizes a Charcoal/Amber color palette, Montserrat typography, custom theming, and mobile-first responsive design built with shadcn/ui (Radix UI) and Tailwind CSS.
- **Accessibility & Performance**: Prioritizes ARIA labels, semantic HTML, keyboard navigation, code splitting, and lazy loading.
- **Mobile Dashboard Navigation**: Features sticky headers with a hamburger menu for mobile sidebar toggling; the sidebar acts as a modal overlay on mobile and appears alongside content on desktop with collapse/expand options.

### Technical Implementations
- **Frontend**: Developed with React and TypeScript (Vite), using Wouter for routing and TanStack React Query for state management.
    - **Recruiters Portal**: Includes job posting forms with WhatsApp integration, an AI Job Description Generator, and a status-based workflow (Draft, Live, Paused, Closed, Filled) with conditional validation. Features interactive sticky form navigation, enhanced skills structure with level/priority attributes, a job import feature (document upload/text paste with AI extraction), an AI Company Description Assistant, PDF export and preview functionality, automatic "Days Left" calculator for job closing dates, and **Interview Scheduling** (November 2025) with multi-provider calendar integration (Google Calendar/Meet, Microsoft Teams/Outlook, Zoom) for managing candidate interviews with automatic video meeting links.
    - **Individuals Portal**: Supports multiple CV management (with AI-powered circular cropping for photos and PDF previews), profile management, competency test access, **Interview Booking** capability, and an AI Interview Coach.
        - **Job Searches Collapsible Tree** (November 2025): Reorganized Job Searches section into a collapsible sidebar tree structure with four sub-sections:
            - **All Jobs** (`/dashboard/individual/jobs/all`): Comprehensive search and filter interface with search bar, location/industry/type filters. Shows all job postings (any status) with total count and full metadata. Includes client-side filtering for refined results
            - **Auto Job Search** (`/dashboard/individual/jobs/auto`): AI-powered automatic job matching where users configure preferences (job titles, locations, industries, employment type, minimum salary) for automatic notifications when jobs match their criteria
            - **Manual Job Search** (`/dashboard/individual/jobs/manual`): Simplified view showing only Live jobs without filters. Displays job cards with transparent salary ranges and WhatsApp application capability. No search/filter interface - just browse active opportunities
            - **Saved Job Searches** (`/dashboard/individual/jobs/saved`): Quick access to frequently used search criteria with indicators showing number of new matching jobs
        - Uses Radix UI Collapsible component for expandable sidebar menu. Chevron icon rotates 90° when expanded, active state highlights selected sub-item.
    - **ATS**: Manages candidates with AI-powered resume ingestion and semantic search.
    - **Integrated Roles & Screening**: Facilitates management of hiring roles with configurable scoring and AI-evaluated candidate screening.
    - **Competency Test Agent**: An AI-powered assessment platform supporting AI-generated tests from job descriptions, manual authoring, and a pre-built template library. It includes a full candidate test-taking portal with server-authoritative timers, real-time anti-cheat tracking, automated scoring, and proctoring data collection.
    - **Organization Settings**: Provides multi-tenant configuration for teams, pipelines, and compliance.
    - **Location & Job Data**: Incorporates comprehensive South African city/town and job title systems with auto-fill capabilities.
- **Backend**: Built with Express.js and TypeScript.
    - **API Endpoints**: Manages subscriptions, job postings, CVs, roles/screening, ATS, organization settings, competency testing, interview scheduling (OAuth flows for Google/Microsoft/Zoom, availability checking, interview booking/rescheduling/canceling), and interview coach interactions, including specific endpoints for job status management and conditional validation. CV endpoints include authorization checks.
    - **AI Integration**: Powers CV screening, resume ingestion, interview coaching, fraud detection, and competency test generation. It includes hybrid document parsing for PDF (text + OCR fallback), DOCX, DOC, and TXT formats using various libraries and OpenAI Vision API (GPT-4o) for OCR.
    - **Background Job Processing**: Uses BullMQ with Redis for asynchronous tasks like candidate screening.
    - **Authentication & Authorization**: Implements passwordless magic link authentication via Resend, Express-session with a PostgreSQL store, and a single-role system with role-based access control.
    - **User Management**: Users are identified by auto-incrementing `id` and unique `email`, with onboarding status and last login tracking.
    - **Admin Setup**: Features a secure admin creation system via an endpoint protected by `ADMIN_SETUP_SECRET`.
- **Data Storage**: Utilizes PostgreSQL (Neon) with Drizzle ORM and the pgvector extension, employing UUID primary keys.
    - **Competency Testing Database**: Features a five-table schema (`competency_tests`, `test_sections`, `test_items`, `test_attempts`, `test_responses`) with JSONB for flexible configuration and anti-cheat event tracking.
    - **Interview Scheduling Database** (November 2025): Five-table schema (`connected_accounts`, `interview_pools`, `pool_members`, `interviews`, `holds`) supporting per-recruiter OAuth for Google Calendar, Microsoft Teams/Outlook, and Zoom. Features multi-provider support with automatic video meeting link generation (Google Meet, Teams, or Zoom), availability management across providers, interview booking with provider selection, and calendar synchronization.

### System Design Choices
- **Monorepo Structure**: Organized into `client/`, `server/`, and `shared/` directories.
- **South African Context**: Designed with POPIA compliance and a WhatsApp-first workflow.

## External Dependencies
- **UI & Styling**: Radix UI, shadcn/ui, Lucide React, Tailwind CSS, Google Fonts.
- **Form Handling**: React Hook Form, Zod.
- **Database**: Drizzle ORM, @neondatabase/serverless.
- **File Upload**: Multer, pdf-parse, pdf-to-img, mammoth, word-extractor.
- **Background Jobs**: BullMQ, ioredis.
- **AI**: OpenAI GPT-4o, OpenAI GPT-4o-mini, OpenAI text-embedding-3-small.
- **Email**: Resend.
- **Maps & Geolocation**: Google Maps JavaScript API.
- **Calendar & Video Conferencing**: Google Calendar API, Microsoft Graph API (Teams/Outlook), Zoom API.