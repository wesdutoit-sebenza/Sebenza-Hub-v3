# Sebenza Hub - South African Recruiting Platform

## Overview
Sebenza Hub is a marketing website for a South African recruiting platform aiming to revolutionize hiring through transparency, compliance, and a WhatsApp-first approach. It connects recruiters, businesses, and job seekers via distinct landing pages. The platform, a full-stack TypeScript application with React and Express, focuses on streamlining hiring, enhancing candidate experience, and becoming a leading solution in South Africa.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Design System**: Charcoal/Amber color palette, Inter and Newsreader typography, custom theming, and mobile-first responsive design using shadcn/ui (Radix UI) and Tailwind CSS.
- **Accessibility & Performance**: Emphasis on ARIA labels, semantic HTML, keyboard navigation, code splitting, and lazy loading.

### Technical Implementations
- **Frontend**: React with TypeScript (Vite), Wouter for routing, and TanStack React Query for state management.
    - **Recruiters Portal**: Job posting forms with WhatsApp integration, AI Job Description Generator, and a status-based workflow (Draft, Live, Paused, Closed, Filled) with conditional validation.
    - **Individuals Portal**: CV upload, profile management, and an AI Interview Coach ("Jabu") offering configurable interviews and real-time feedback.
    - **ATS**: Candidate management with AI-powered resume ingestion and semantic search.
    - **Integrated Roles & Screening**: Management of hiring roles with configurable scoring and AI-evaluated candidate screening.
    - **Organization Settings**: Multi-tenant configuration for teams, pipelines, and compliance.
    - **Location & Job Data**: Comprehensive South African city/town and job title systems with auto-fill.
- **Backend**: Express.js with TypeScript.
    - **API Endpoints**: Manages subscriptions, job postings, CVs, roles/screening, ATS, organization settings, and interview coach interactions. Includes specific endpoints for job status management and conditional validation.
    - **AI Integration**: Powers CV screening, resume ingestion, interview coaching, and fraud detection (currently paused).
    - **Background Job Processing**: BullMQ with Redis for asynchronous tasks like candidate screening.
    - **Authentication & Authorization**: Passwordless magic link authentication using Resend, Express-session with PostgreSQL store, and robust security features (rate limiting, session fixation prevention). Includes an admin setup endpoint and a single-role system for users (individual, business, recruiter, admin) with role-based access control.
    - **User Management**: Users are identified by auto-incrementing `id` and unique `email`, with onboarding status and last login tracking.
- **Data Storage**: PostgreSQL (Neon) with Drizzle ORM and pgvector extension, using UUID primary keys.

### System Design Choices
- **Monorepo Structure**: Organized into `client/`, `server/`, and `shared/` directories.
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