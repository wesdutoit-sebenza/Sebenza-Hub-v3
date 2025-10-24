# Sebenza Hub - South African Recruiting Platform

## Overview
Sebenza Hub is a marketing website for a South African recruiting platform focused on transparency, compliance, and WhatsApp-first hiring. It targets recruiters, businesses, and job seekers with distinct landing pages. The platform aims to capture early-access subscribers and showcases a modern, minimal design. It is a full-stack TypeScript application utilizing a React frontend and an Express backend, built for performance, accessibility, and mobile-first responsiveness. The project's ambition is to become a leading recruiting solution in South Africa, streamlining hiring processes and enhancing candidate experience.

## Recent Changes (October 24, 2025)
- **CRITICAL BUG FIX - Profile Table Mismatch (Complete)**: Fixed critical architectural issue where onboarding created profiles in `candidateProfiles` table but dashboard queried from `candidates` table (ATS system). Updated `/api/individuals/profile` GET and PUT endpoints to correctly query/update `candidateProfiles` table. Completely rewrote Profile.tsx page to match actual schema fields (removed non-existent fields like headline, summary, workAuthorization, links). Profile now correctly displays after onboarding completion.
- **Individuals Dashboard (Complete)**: Created comprehensive dashboard at `/dashboard/individual/*` with sidebar navigation (similar to Admin Dashboard). Five sections: (1) Profile - view/edit with all contact fields and country code selector; (2) CVs - list/view/delete CVs with CV Builder integration; (3) Job Searches - placeholder for future job tracking; (4) Billing - placeholder for payment management; (5) Settings - job preferences, notifications, privacy controls. Onboarding redirects to `/dashboard/individual/profile`. Public marketing page remains at `/individuals`. Individual Settings removed from Header dropdown (now in dashboard Settings section).
- **Contact Information System (Complete)**: Implemented comprehensive contact information handling across ALL website forms with consistent country code selector and automatic leading-0 removal. Created shared/countries.ts (195+ countries, South Africa default) and shared/countryCodes.ts (195+ country calling codes, +27 South Africa default). Email auto-populates from authenticated user's sign-in email. Telephone/WhatsApp fields feature country code selector (+27 default) combined with phone number input. Leading 0 automatically removed from all phone numbers before database save (e.g., user enters "082 123 4567", saved as "+27 82 123 4567"). **Updated Forms**: (1) Individual Onboarding - postalCode, country, email, telephone with code selector; (2) CV Builder Personal Info Step - same fields with country code selector; (3) Individual Profile Edit - phone field with country code selector; (4) Recruiters Job Posting - WhatsApp number with country code selector. Province field dynamically switches between SA provinces dropdown and text input based on selected country. Database: candidateProfiles table includes postalCode (nullable), country (default 'South Africa'), email (nullable), telephone (nullable). All forms tested and working consistently across the entire platform.
- **Skills Multi-Select System**: Implemented centralized skills management with 146 predefined skills organized into 11 categories (Agriculture, Business, Digital & Technical, Education, Engineering & Manufacturing, Finance & Accounting, Healthcare, Marketing & Sales, Public Service & Safety, Trades & Construction, Soft Skills). Created reusable SkillsMultiSelect component with checkboxes, category headers, search functionality, 10-skill limit enforcement, and visual feedback. Updated all skill selection points: individual onboarding, CV builder (SkillsStep), and recruiter job posting (roles.tsx). NO "Other" option for skills to ensure consistency. Implemented backward compatibility with migration utilities for legacy nested skill format.
- **Job Titles System**: 398 unique SA job titles in shared/jobTitles.ts with "Other" option that reveals custom text input. Used across individual onboarding and recruiter forms.
- **Admin Dashboard Integration**: Complete admin dashboard with navigation integration. Admin users see "Admin Dashboard" link (with shield icon, highlighted in amber) in the Header dropdown menu.
- **Critical Bug Fix**: Fixed `/api/me` endpoint that was incorrectly wrapping user data in `{ user: ... }` instead of returning user object directly. This was preventing role-based features from working correctly in the frontend.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework & Tooling**: Vite-powered React with TypeScript, Wouter for routing, TanStack React Query for state management, shadcn/ui (Radix UI) for components, and Tailwind CSS for styling.
- **Design System**: Features a base color palette with strategic accents (Charcoal/Amber), Inter and Newsreader typography, custom theming, and mobile-first responsive design.
- **Key Features**:
    - **Recruiters Page**: Job posting form with WhatsApp integration, employment type, and industry categorization.
    - **Individuals Page**: Unified CV upload with AI resume parsing (OpenAI GPT-4o), profile viewing/editing, and an AI Interview Coach ("Jabu") offering configurable interview types, personalized questions, real-time feedback, and scoring.
    - **Integrated Roles & Screening**: Create/manage hiring roles, define configurable scoring weights, and screen existing ATS candidates with ranked, AI-evaluated results.
    - **ATS (Applicant Tracking System)**: Comprehensive candidate management with a normalized database, AI-powered resume ingestion (GPT-4o), file upload support (PDF, DOCX, TXT), semantic search (OpenAI text-embedding-3-small), and full candidate lifecycle management.
    - **Organization Settings**: Comprehensive configuration system for recruiters and businesses with multi-tenant support for team management, pipeline, interview operations, compliance, job templates, and vendor management.

### Backend
- **Server Framework**: Express.js with TypeScript, integrated with Vite middleware.
- **API Endpoints**: Handles subscriptions, job postings, CV management, integrated roles/screening, ATS candidate management, organization settings, individual CV management, interview coach interactions, and fraud detection administration.
- **AI Integration**: Four separate AI systems: CV screening, resume ingestion, interview coaching, and fraud detection.
- **Fraud & Spam Detection**: Real-time AI-powered detection system using OpenAI GPT-4o-mini scanning all submissions (job postings, CVs, profiles) with risk scoring, categorization, flagging, AI reasoning, and an admin dashboard for review and actions. Processing is asynchronous and non-blocking.
- **Background Job Processing**: BullMQ with Redis for asynchronous screening and fraud detection jobs. Includes auto-screening of new candidates against active roles, AI evaluation (GPT-4o-mini), semantic search for candidate relevance, and fraud detection processing.
- **Authentication & Authorization**: Passwordless magic link authentication via email (Resend), JWT tokens. Multi-role system (`individual`, `business`, `recruiter`) with role-specific authorization. POPIA compliance for candidate data.

### Data Storage
- **Database**: PostgreSQL (Neon) with Drizzle ORM and pgvector extension.
- **Schema Design**: Core tables for users, organizations, candidates, recruiters. Dedicated tables for integrated roles, screenings, ATS modules (10 tables), organization settings (8 tables), and fraud detections. All tables use UUID primary keys and foreign key constraints.
- **Hybrid Storage**: PostgreSQL for core data; legacy features use in-memory storage with migration plans.

### Key Architectural Decisions
- **Monorepo Structure**: Organized into `client/`, `server/`, and `shared/` directories.
- **Build Strategy**: Client (Vite) builds to `dist/public`, Server (ESBuild) bundles to `dist/index.js`.
- **Accessibility & Performance**: Focus on ARIA labels, semantic HTML, keyboard navigation, code splitting, lazy loading, and optimized font loading.
- **South African Context**: Includes POPIA compliance and WhatsApp-first workflow.

## External Dependencies
- **UI & Styling**: Radix UI, shadcn/ui, Lucide React, Tailwind CSS, PostCSS, Google Fonts.
- **Form Handling**: React Hook Form, Zod.
- **Database**: Drizzle ORM, @neondatabase/serverless.
- **File Upload**: Multer.
- **Background Jobs**: BullMQ, ioredis.
- **Utilities**: date-fns, clsx, tailwind-merge, class-variance-authority.
- **AI**: OpenAI GPT-4o, OpenAI GPT-4o-mini, OpenAI text-embedding-3-small.
- **Email**: Resend.