# Sebenza Hub - South African Recruiting Platform

## Overview
Sebenza Hub is a marketing website for a South African recruiting platform focused on transparency, compliance, and WhatsApp-first hiring. It targets recruiters, businesses, and job seekers with distinct landing pages. The platform aims to capture early-access subscribers and showcases a modern, minimal design with strategic color accents, built for performance, accessibility, and mobile-first responsiveness. It is a full-stack TypeScript application utilizing a React frontend and an Express backend. The project's ambition is to become a leading recruiting solution in South Africa, streamlining hiring processes and enhancing candidate experience.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework & Tooling**: Vite-powered React with TypeScript, Wouter for routing, TanStack React Query for state management, shadcn/ui (Radix UI) for components, and Tailwind CSS for styling.
- **Design System**: Features a base color palette with strategic accents, Inter and Newsreader typography, custom theming with light/dark mode, and mobile-first responsive design.
- **Key Features**:
    - **Recruiters Page**: Job posting form, numeric salary inputs, WhatsApp integration, employment type, and industry categorization.
    - **Individuals Page**: Job search and filtering, multi-step CV builder wizard (7 steps) with professional CV preview, and `react-hook-form` with Zod validation.
    - **CV Screening Page (Legacy)**: AI-powered candidate evaluation using OpenAI GPT-5. Includes job creation with configurable scoring weights, text file CV processing, and detailed results display with ranking, AI reasoning, and knockout warnings. Supports Draft, Processing, and Completed/Failed states.
    - **Integrated Roles & Screening**: Modern screening system that bridges ATS and AI evaluation:
        - **Role Management**: Create, edit, and manage hiring roles with job details, required skills, salary ranges, location requirements, and custom knockout criteria
        - **Configurable Scoring**: Define custom scoring weights across six dimensions (skills, experience, achievements, education, location/auth, salary/availability)
        - **Candidate Screening**: Screen existing ATS candidates against roles with one-click batch evaluation
        - **Ranked Results**: View AI-evaluated candidates sorted by total score with detailed breakdowns, must-haves analysis, missing skills, and knockout warnings
        - **Re-screening Support**: Upsert logic allows re-evaluating candidates against the same role, updating previous scores
        - **Foreign Key Integration**: Direct database links between roles and ATS candidates ensure data integrity
    - **ATS (Applicant Tracking System)**: Comprehensive candidate management system with normalized database, AI-powered resume parsing, and full candidate lifecycle management. Features include:
        - Candidate database with search and filtering
        - **File Upload Support**: Resume upload via multer middleware supporting PDF, DOCX, DOC, and TXT formats (max 10MB)
        - **Dual Upload Methods**: File upload with FormData or text paste for flexibility
        - AI resume ingestion using OpenAI GPT-4o with automatic data extraction
        - Full candidate profiles with experiences, education, skills, certifications, projects, and awards
        - Normalized data model for efficient querying
        - **Security**: Strict MIME type validation, file size limits, automatic file cleanup after processing
        - **Semantic Search**: Automatic embedding generation using OpenAI text-embedding-3-small, comprehensive text representation (headline, summary, location, skills, experiences, education, projects), stored in candidate_embeddings table for future vector search

### Backend
- **Server Framework**: Express.js with TypeScript, integrated with Vite middleware for development and static file serving for production.
- **API Endpoints**: Handles subscriptions, job postings, CV management, legacy AI screening, integrated roles/screening system (CRUD + evaluation), and comprehensive ATS candidate management (30+ endpoints total for candidates, resumes, experiences, education, skills, certifications, projects, awards, roles, and screenings).
- **Request/Response**: JSON body parsing, custom logging, and structured JSON error responses.
- **AI Integration**: Two separate AI systems - CV screening for job-specific evaluation and resume ingestion for structured data extraction.
- **Background Job Processing**: BullMQ with Redis for asynchronous screening jobs:
    - **Auto-Screening**: Automatically screens new candidates against all active roles when they're added via any endpoint (direct creation, file upload, or text parsing)
    - **Worker Process**: Separate worker (server/worker.ts) processes screening jobs with configurable concurrency (5 concurrent jobs)
    - **Graceful Degradation**: System continues to function without Redis - auto-screening is disabled with console warnings when REDIS_URL is not configured
    - **Upsert Logic**: Re-screening the same candidate for the same role updates existing results rather than creating duplicates
    - **Non-Blocking**: Candidate creation never fails due to screening errors - failures are logged and jobs can be retried

### Data Storage
- **Database**: PostgreSQL (Neon) with Drizzle ORM for schema management, pgvector extension for semantic search capabilities.
- **Schema Design**: 
    - **Core Tables**: users, magic tokens, organizations, memberships, candidate profiles, recruiter profiles
    - **Legacy CV Screening**: Dedicated tables for AI screening jobs, screening candidates, and evaluations (maintained for backward compatibility)
    - **Integrated Roles & Screening**: roles table (job definitions with must-have skills, knockouts, weights) and screenings table (evaluation results with foreign keys to roles and ATS candidates)
    - **ATS Module**: Normalized schema with 10 tables (ats_candidates, ats_resumes, ats_experiences, ats_education, ats_certifications, ats_projects, ats_awards, ats_skills, ats_candidate_skills, ats_candidate_embeddings)
    - All tables use UUID primary keys for scalability
    - Foreign key constraints enforce referential integrity between roles, screenings, and candidates
- **Hybrid Storage**: Authentication, profiles, screening data, and ATS use PostgreSQL, while legacy features (subscribers, jobs, CVs) are currently in-memory, with plans for migration.

### Authentication & Authorization
- **Authentication**: Passwordless magic link authentication via email (Resend integration), JWT tokens in httpOnly cookies. Magic links are logged to console in development.
- **Multi-Role System**: Users can have multiple roles (`individual`, `business`, `recruiter`), with role-specific onboarding flows.
- **Authorization**: Middleware for requiring authentication (`requireAuth`) and specific roles (`requireRole`).
- **POPIA Compliance**: Explicit consent required for candidate profiles, tracked and validated by the backend.

### Key Architectural Decisions
- **Monorepo Structure**: Organized into `client/`, `server/`, and `shared/` directories.
- **Build Strategy**: Client (Vite) builds to `dist/public`, Server (ESBuild) bundles to `dist/index.js`.
- **Accessibility & Performance**: Focus on ARIA labels, semantic HTML, keyboard navigation, code splitting, lazy loading, and optimized font loading.
- **South African Context**: Includes POPIA compliance, employment equity considerations, and WhatsApp-first workflow.

## External Dependencies
- **UI & Styling**: Radix UI, shadcn/ui, Lucide React (icons), Tailwind CSS, PostCSS, Google Fonts.
- **Form Handling**: React Hook Form, Zod.
- **Database**: Drizzle ORM, @neondatabase/serverless.
- **File Upload**: Multer (multipart/form-data middleware with file validation).
- **Background Jobs**: BullMQ (job queue), ioredis (Redis client for queue management).
- **Utilities**: date-fns, clsx, tailwind-merge, class-variance-authority.
- **AI**: OpenAI GPT-4o (for ATS resume parsing), OpenAI GPT-5 (for CV screening), OpenAI text-embedding-3-small (for semantic search embeddings).
- **Email**: Resend (for magic link delivery).
- **Replit Plugins**: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`.