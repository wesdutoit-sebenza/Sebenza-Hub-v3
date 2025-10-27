# Sebenza Hub - South African Recruiting Platform

## Overview
Sebenza Hub is a marketing website for a South African recruiting platform focused on transparency, compliance, and WhatsApp-first hiring. It connects recruiters, businesses, and job seekers through distinct landing pages. The platform aims to streamline hiring processes, enhance candidate experience, and become a leading recruiting solution in South Africa. It is a full-stack TypeScript application with a React frontend and an Express backend, designed for performance, accessibility, and mobile-first responsiveness.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework & Tooling**: React with TypeScript (Vite), Wouter for routing, TanStack React Query for state management, shadcn/ui (Radix UI) for components, and Tailwind CSS for styling.
- **Design System**: Minimalist monochrome palette (black/white/grays) with amber (#f4a300) as the only color accent. Montserrat typography, custom theming, mobile-first responsive design, and full WCAG AA accessibility compliance.
- **Key Features**:
    - **Recruiters Portal**: Job posting forms with WhatsApp integration, recruiter profiles, and job listings. Includes an AI Job Description Generator and status-based workflow.
      - **Status-Based Publishing**: Jobs saved as drafts with lenient validation, published by changing status to Live via action buttons on job cards.
      - **Status Transitions**: Draft → Live → Paused → Live or Closed → Live. Filled status is display-only.
      - **Conditional Validation**: Draft allows partial data; Live/Paused/Closed/Filled require complete fields.
    - **Individuals Portal**: CV upload, profile management, and an AI Interview Coach ("Jabu") providing configurable interview types, personalized questions, and real-time feedback.
    - **ATS (Applicant Tracking System)**: Comprehensive candidate management with AI-powered resume ingestion and semantic search.
    - **Integrated Roles & Screening**: Management of hiring roles, configurable scoring weights, and AI-evaluated candidate screening.
    - **Organization Settings**: Multi-tenant configuration for recruiters and businesses, covering team management, pipeline, and compliance.
    - **Location & Job Data**: Comprehensive South African city/town and job title systems with auto-fill functionalities.

### Backend
- **Server Framework**: Express.js with TypeScript.
- **API Endpoints**: Manages subscriptions, job postings, CVs, roles/screening, ATS, organization settings, and interview coach interactions.
  - **Job Status Management**: PATCH `/api/jobs/:id/status` updates job status with proper admin field merging to preserve metadata (jobId, pipeline, etc.).
  - **Conditional Job Validation**: POST `/api/jobs` applies strict validation for Live/Paused/Closed/Filled status, lenient validation for Draft status.
- **AI Integration**: Powers CV screening, resume ingestion, interview coaching, and fraud detection.
- **Fraud & Spam Detection**: Real-time AI-powered system using OpenAI GPT-4o-mini for scanning submissions, risk scoring, and flagging.
- **Background Job Processing**: BullMQ with Redis for asynchronous tasks like candidate screening and fraud detection.
- **Authentication & Authorization**: Firebase Authentication for all users (web and mobile).
  - **Firebase Auth**: Supports email/password authentication and Google OAuth
    - Client-side: Firebase SDK handles authentication state and token management
    - Server-side: Firebase Admin SDK verifies ID tokens sent in Authorization header
    - Tokens automatically refreshed by Firebase SDK
  - **Middleware**: `authenticateFirebase` middleware verifies Firebase ID tokens and attaches user to `req.user`
    - All protected routes use Firebase authentication
    - `requireRole()` middleware enforces role-based access control
  - **Admin Setup**: Special `/api/admin/setup` endpoint creates first admin user if none exists
    - Frontend page at `/admin/setup` for initial admin account creation
    - Admin role required for `/api/admin/*` routes
  - **Single-Role System**: Users can only have ONE role at a time (`individual`, `business`, `recruiter`, or `admin`)
    - Changed from array-based `roles` to single `role` field (October 2025)
    - Role switching replaces previous role and resets onboarding status
    - Role-based access control with `requireRole()` middleware
    - POPIA compliance enforced per role
  - **User Database**: Users linked to Firebase via `firebaseUid` field
    - Auto-created on first login with default "individual" role
    - Single role and profile data stored in PostgreSQL
    - `onboardingComplete` is binary flag (0 or 1)

### Data Storage
- **Database**: PostgreSQL (Neon) with Drizzle ORM and pgvector extension.
- **Schema Design**: Core tables for users, organizations, candidates, and recruiters, with dedicated tables for ATS modules, organization settings, and fraud detections. Uses UUID primary keys.

### Key Architectural Decisions
- **Monorepo Structure**: Organized into `client/`, `server/`, and `shared/` directories.
- **Accessibility & Performance**: Emphasis on ARIA labels, semantic HTML, keyboard navigation, code splitting, and lazy loading.
- **South African Context**: POPIA compliance and WhatsApp-first workflow.

## External Dependencies
- **UI & Styling**: Radix UI, shadcn/ui, Lucide React, Tailwind CSS, Google Fonts.
- **Form Handling**: React Hook Form, Zod.
- **Database**: Drizzle ORM, @neondatabase/serverless.
- **File Upload**: Multer.
- **Background Jobs**: BullMQ, ioredis.
- **AI**: OpenAI GPT-4o, OpenAI GPT-4o-mini, OpenAI text-embedding-3-small.
- **Email**: Resend.
- **Maps & Geolocation**: Google Maps JavaScript API.