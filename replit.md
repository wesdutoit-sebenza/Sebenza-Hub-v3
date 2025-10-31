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
    - **Organization Settings**: Multi-tenant configuration for teams, pipelines, and compliance.
    - **Location & Job Data**: Comprehensive South African city/town and job title systems with auto-fill.
- **Backend**: Express.js with TypeScript.
    - **API Endpoints**: Manages subscriptions, job postings, CVs, roles/screening, ATS, organization settings, and interview coach interactions, including specific endpoints for job status management and conditional validation. CV endpoints include authorization checks.
    - **AI Integration**: Powers CV screening, resume ingestion (using `pdf-parse` v2.x with proper buffer handling), interview coaching, and fraud detection. PDF text extraction fixed (October 2025) to use `{ data: buffer }` instead of `{ url: filePath }` for reliable text extraction from uploaded PDFs.
    - **Background Job Processing**: BullMQ with Redis for asynchronous tasks like candidate screening.
    - **Authentication & Authorization**: Passwordless magic link authentication using Resend, Express-session with PostgreSQL store, and robust security features. Supports a single-role system (individual, business, recruiter, admin) with role-based access control.
    - **User Management**: Users identified by auto-incrementing `id` and unique `email`, with onboarding status and last login tracking.
    - **Admin Setup**: Secure admin creation system via `/api/admin/setup` endpoint protected by `ADMIN_SETUP_SECRET`, which locks after the first admin is created.
- **Data Storage**: PostgreSQL (Neon) with Drizzle ORM and pgvector extension, using UUID primary keys.

### System Design Choices
- **Monorepo Structure**: Organized into `client/`, `server/`, and `shared/` directories.
- **South African Context**: POPIA compliance and WhatsApp-first workflow.

## External Dependencies
- **UI & Styling**: Radix UI, shadcn/ui, Lucide React, Tailwind CSS, Google Fonts.
- **Form Handling**: React Hook Form, Zod.
- **Database**: Drizzle ORM, @neondatabase/serverless.
- **File Upload**: Multer, pdf-parse.
- **Background Jobs**: BullMQ, ioredis.
- **AI**: OpenAI GPT-4o, OpenAI GPT-4o-mini, OpenAI text-embedding-3-small.
- **Email**: Resend.
- **Maps & Geolocation**: Google Maps JavaScript API.