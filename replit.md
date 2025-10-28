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
- **Fraud & Spam Detection**: Real-time AI-powered system using OpenAI GPT-4o-mini for scanning submissions, risk scoring, and flagging. **Currently paused** (October 2025).
- **Background Job Processing**: BullMQ with Redis for asynchronous tasks.
  - **Screening Worker**: Active - processes candidate screening for roles
  - **Fraud Detection Worker**: Paused - will be enabled later
- **Authentication & Authorization**: Passwordless magic link authentication using Resend email service (migrated from Firebase October 2025).
  - **Magic Link Authentication**: Email-only passwordless authentication
    - User enters email → receives magic link → clicks link → auto-logged in
    - Magic link tokens: Hashed (SHA-256), single-use, 15-minute expiry
    - Stored in `magicLinkTokens` table with email, token, expiresAt, consumedAt, userId, requestIp
  - **Session Management**: Express-session with PostgreSQL session store (connect-pg-simple)
    - Session cookie: httpOnly, secure (production), sameSite=lax
    - Session regeneration on login (prevents session fixation)
    - Session stored server-side in PostgreSQL
  - **Security Features**:
    - Rate limiting: 5 requests per email per hour, 10 requests per IP per hour
    - Duplicate user prevention: checks by email before creating new accounts
    - Email normalization: all emails converted to lowercase
    - Session fixation prevention: regenerates session ID on login
  - **Authentication Endpoints**:
    - `POST /api/auth/magic-link`: Request magic link (rate limited)
    - `GET /auth/verify?token=...`: Verify token, create session, redirect to dashboard
    - `GET /api/auth/user`: Get current logged-in user
    - `POST /api/auth/logout`: Destroy session and log out
  - **Middleware**: `authenticateSession` middleware verifies session and attaches user to `req.user`
    - All protected routes use session-based authentication
    - `requireRole()` middleware enforces role-based access control
    - `authenticateSessionOptional` for routes that work with or without auth
  - **Admin Setup**: Special `/api/admin/setup` endpoint creates first admin user if none exists
    - Frontend page at `/admin/setup` for initial admin account creation
    - Admin role required for `/api/admin/*` routes
  - **Single-Role System**: Users can only have ONE role at a time (`individual`, `business`, `recruiter`, or `admin`)
    - Single `role` field (not array) in users table
    - Role switching replaces previous role and resets onboarding status
    - Role-based access control with `requireRole()` middleware
    - POPIA compliance enforced per role
  - **User Database**: Users identified by auto-incrementing `id` and unique `email`
    - Auto-created on first magic link verification with default "individual" role
    - Single role and profile data stored in PostgreSQL
    - `onboardingComplete` is binary flag (0 or 1)
    - `lastLoginAt` timestamp tracks last login
  - **Onboarding Completion**: Both Individual and Recruiter profile creation endpoints set `onboardingComplete = 1` (October 2025)
  - **Authentication Flow**:
    - New users: Magic link → Auto-create account → Redirect to /onboarding → Complete profile → Dashboard
    - Existing users: Magic link → Verify session → Redirect to role-based dashboard

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

## Production Deployment Guide

### Overview
- **Production URL**: https://sebenzahub.replit.app
- **Development URL**: *.replit.dev (workspace preview)
- **Database Separation**: Production and development use **completely separate databases**
- **Magic Links**: Environment-specific - dev links don't work in production and vice versa

### Production Verification Checklist

Use the health check endpoint to verify production configuration:
```
https://sebenzahub.replit.app/api/health/production
```

#### 1. Verify Resend Email Configuration

**Check:** Can production send emails?
- Go to https://sebenzahub.replit.app/api/health/production
- Look for `checks.resend.status: "configured"`
- Verify `checks.resend.fromEmail` shows correct email

**If Failed:**
1. Open **Replit Publishing** tool in workspace
2. Click **"Edit Commands and Secrets"**
3. Verify Resend connector is enabled for production
4. Ensure `RESEND_API_KEY` is set (should start with `re_`)
5. Verify domain `sebenzahub.co.za` is verified at https://resend.com/domains

#### 2. Verify Production Database

**Check:** Are all required tables present?
- Health check should show `checks.database.allTablesExist: true`
- Tables needed: `users`, `magic_link_tokens`, `sessions`

**If Failed:**
1. Database schema migrations should happen automatically during publish
2. If tables are missing, check Publishing logs for migration errors
3. May need to republish with latest schema changes

#### 3. Verify Session Management

**Check:** Are sessions working?
- Health check should show `checks.session.status: "available"`
- Verify `checks.session.hasSessionSecret: true`

**If Failed:**
1. Open **Publishing** tool → **Edit Commands and Secrets**
2. Ensure `SESSION_SECRET` is set in production
3. Republish if needed

#### 4. Verify Environment Detection

**Check:** Is production properly detected?
- Health check should show `isProduction: true`
- `environment` should be `"production"` or `"production"`
- `REPLIT_DEPLOYMENT` should be `true`

### Testing Production Magic Link Authentication

**Step-by-Step Test:**

1. **Open Production Site**: https://sebenzahub.replit.app

2. **Request Magic Link**:
   - Enter a real email address
   - Click "Send magic link"
   - Should see success message

3. **Check Email**:
   - Open email inbox
   - Look for email from `wes.dutoit@sebenzahub.co.za`
   - Check spam folder if not in inbox

4. **Click Magic Link**:
   - Link should be: `https://sebenzahub.replit.app/auth/verify?token=...`
   - Should redirect to `/onboarding` (new users) or dashboard (existing users)
   - Should be logged in

5. **Verify Session**:
   - Visit https://sebenzahub.replit.app/api/auth/user
   - Should return user data (not "Unauthorized")

### Common Production Issues

#### Issue: "Unable to Wake Up" - Deployment Won't Start

**Symptoms**: Production shows "Unable to Wake Up - internal error" screen

**Cause**: The deployment is failing to boot. This is NOT a magic-link issue - the server isn't starting.

**Solution Steps:**

1. **Check Deployment Logs**:
   - Open Replit workspace
   - Go to **Deploy** tab in left sidebar
   - Click on your deployment
   - Check **Logs** section for error messages
   - Look for: module not found, database connection errors, syntax errors, port binding errors

2. **Verify Environment Variables in Production**:
   - Go to **Deploy** → Click your deployment → **Settings**
   - Ensure ALL required secrets are added:
     - `DATABASE_URL` (must be production database URL)
     - `SESSION_SECRET` (required for sessions)
     - `RESEND_API_KEY` (for magic link emails)
     - `JWT_SECRET` (if using JWT)
     - `JWT_REFRESH_SECRET` (if using JWT refresh)
   
   **Important**: Workspace secrets are NOT automatically copied to deployments!

3. **Verify Build & Start Commands**:
   - Build command should be: `npm run build`
   - Start command should be: `npm run start`
   - These are configured in `.replit` file under `[deployment]`

4. **Configure Health Check**:
   - Go to **Deploy** → Settings → **Health Check**
   - Set health check path to: `/healthz`
   - This is a lightweight endpoint that returns 200 OK

5. **Check Database Connection**:
   - Ensure production `DATABASE_URL` points to production database
   - Verify database is accessible from deployment
   - Schema migrations should run automatically during build

6. **Force Redeploy**:
   - After fixing environment variables, click **Deploy** again
   - Watch the build logs for any errors
   - Deployment should show "Live" status when successful

7. **Test After Deployment**:
   - Visit https://sebenzahub.replit.app/healthz (should return "ok")
   - Visit https://sebenzahub.replit.app/api/health/production (should return JSON health status)
   - If both work, try the login flow

**Common Deployment Errors:**

- **"Cannot find module"**: Build step didn't complete - check build logs
- **"EADDRINUSE"**: Port conflict - should not happen with Autoscale
- **"connect ECONNREFUSED"**: Database not accessible - check DATABASE_URL
- **"SESSION_SECRET required"**: Missing env var - add to deployment settings
- **Silent crash**: Check if worker startup is failing - Redis might be unavailable

#### Issue: "Magic link expired or invalid"
**Cause**: User clicked an old link or dev link in production
**Solution**: User must request a new magic link from production site

#### Issue: "Unable to send email"
**Cause**: Resend not configured for production or domain not verified
**Solution**: 
1. Verify Resend connector in Publishing settings
2. Check domain verification at https://resend.com/domains
3. Verify API key is correct (starts with `re_`)

#### Issue: "Session not persisting"
**Cause**: `SESSION_SECRET` not set in production
**Solution**: Add `SESSION_SECRET` in Publishing → Edit Commands and Secrets

#### Issue: "Database tables not found"
**Cause**: Schema migration didn't run during publish
**Solution**: Check Publishing logs, may need to republish

### Environment-Specific Behavior

**Development (.replit.dev)**:
- Uses development database
- Magic links generated here only work in dev
- All debug logging enabled
- Can access via workspace preview

**Production (.replit.app)**:
- Uses production database (separate from dev)
- Magic links generated here only work in prod
- Production logging (less verbose)
- Public-facing URL

**Important**: Never share dev magic links with production users - they won't work!