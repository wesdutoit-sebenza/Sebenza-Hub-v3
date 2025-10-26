# Sebenza Hub - South African Recruiting Platform

## Overview
Sebenza Hub is a marketing website for a South African recruiting platform focused on transparency, compliance, and WhatsApp-first hiring. It connects recruiters, businesses, and job seekers through distinct landing pages. The platform aims to streamline hiring processes, enhance candidate experience, and become a leading recruiting solution in South Africa. It is a full-stack TypeScript application with a React frontend and an Express backend, designed for performance, accessibility, and mobile-first responsiveness.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework & Tooling**: React with TypeScript (Vite), Wouter for routing, TanStack React Query for state management, shadcn/ui (Radix UI) for components, and Tailwind CSS for styling.
- **Design System**: Features a Charcoal/Amber color palette, Inter and Newsreader typography, custom theming, and mobile-first responsive design.
- **Key Features**:
    - **Recruiters Portal**: Job posting forms with WhatsApp integration, recruiter profiles, and job listings. Includes an AI Job Description Generator.
    - **Individuals Portal**: CV upload, profile management, and an AI Interview Coach ("Jabu") providing configurable interview types, personalized questions, and real-time feedback.
    - **ATS (Applicant Tracking System)**: Comprehensive candidate management with AI-powered resume ingestion and semantic search.
    - **Integrated Roles & Screening**: Management of hiring roles, configurable scoring weights, and AI-evaluated candidate screening.
    - **Organization Settings**: Multi-tenant configuration for recruiters and businesses, covering team management, pipeline, and compliance.
    - **Location & Job Data**: Comprehensive South African city/town and job title systems with auto-fill functionalities.

### Backend
- **Server Framework**: Express.js with TypeScript.
- **API Endpoints**: Manages subscriptions, job postings, CVs, roles/screening, ATS, organization settings, and interview coach interactions.
- **AI Integration**: Powers CV screening, resume ingestion, interview coaching, and fraud detection.
- **Fraud & Spam Detection**: Real-time AI-powered system using OpenAI GPT-4o-mini for scanning submissions, risk scoring, and flagging.
- **Background Job Processing**: BullMQ with Redis for asynchronous tasks like candidate screening and fraud detection.
- **Authentication & Authorization**: Hybrid authentication system supporting both session-based auth (web) and JWT token-based auth (mobile app).
  - **Session Auth (Web)**: Replit Auth (OpenID Connect) with email/password and social logins (Google, GitHub, X/Twitter, Apple)
  - **JWT Auth (Mobile)**: Token-based authentication with access tokens (15 min expiry) and refresh tokens (30 day expiry)
    - Refresh token rotation implemented for security
    - Tokens stored in database for revocation support
    - Endpoints: `/api/auth/token/register`, `/api/auth/token/login`, `/api/auth/token/refresh`, `/api/auth/token/logout`
  - **Hybrid Middleware**: All API endpoints support both session cookies and JWT Bearer tokens via Authorization header
  - **Multi-Role System**: `individual`, `business`, `recruiter`, `admin` with role-based access control and POPIA compliance
  - **Admin Role**: Platform administrators have access to comprehensive admin dashboard at `/api/admin/*` routes for managing users, recruiters, businesses, CVs, roles, screenings, and monitoring fraud detection
  - **Admin User**: First admin created with email `admin@sebenzahub.com` (ID: `admin-001`)
  - **Migration**: Legacy users automatically migrated from magic link auth to OIDC, preserving roles and onboarding status

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