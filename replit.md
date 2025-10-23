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
    - **CV Screening Page**: AI-powered candidate evaluation using OpenAI GPT-5. Includes job creation with configurable scoring weights, text file CV processing, and detailed results display with ranking, AI reasoning, and knockout warnings. Supports Draft, Processing, and Completed/Failed states.

### Backend
- **Server Framework**: Express.js with TypeScript, integrated with Vite middleware for development and static file serving for production.
- **API Endpoints**: Handles subscriptions, job postings, CV management, and AI screening job creation/processing.
- **Request/Response**: JSON body parsing, custom logging, and structured JSON error responses.

### Data Storage
- **Database**: PostgreSQL (Neon) with Drizzle ORM for schema management.
- **Schema Design**: Includes tables for users, magic tokens, organizations, memberships, candidate profiles, recruiter profiles, and dedicated tables for AI screening jobs, candidates, and evaluations. Uses UUID primary keys.
- **Hybrid Storage**: Authentication, profiles, and screening data use PostgreSQL, while legacy features (subscribers, jobs, CVs) are currently in-memory, with plans for migration.

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
- **Utilities**: date-fns, clsx, tailwind-merge, class-variance-authority.
- **AI**: OpenAI GPT-5 (for CV screening).
- **Email**: Resend (for magic link delivery).
- **Replit Plugins**: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`.