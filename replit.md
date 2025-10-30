# Sebenza Hub - South African Recruiting Platform

## Overview
Sebenza Hub is a marketing website for a South African recruiting platform aiming to revolutionize hiring through transparency, compliance, and a WhatsApp-first approach. It connects recruiters, businesses, and job seekers via distinct landing pages. The platform, a full-stack TypeScript application with React and Express, focuses on streamlining hiring, enhancing candidate experience, and becoming a leading solution in South Africa.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Design System**: Charcoal/Amber color palette, Montserrat typography (Google Fonts), custom theming, and mobile-first responsive design using shadcn/ui (Radix UI) and Tailwind CSS.
- **Accessibility & Performance**: Emphasis on ARIA labels, semantic HTML, keyboard navigation, code splitting, and lazy loading.
- **Mobile Dashboard Navigation**: All three dashboard layouts (Individual, Recruiter, Admin) include sticky headers with SidebarTrigger (hamburger menu button) enabling mobile sidebar toggle. On mobile viewports (<768px), sidebar opens as modal overlay; clicking toggle closes it to reveal main content. Desktop viewports (>=768px) display sidebar alongside content with optional collapse/expand functionality.

### Technical Implementations
- **Frontend**: React with TypeScript (Vite), Wouter for routing, and TanStack React Query for state management.
    - **Recruiters Portal**: Job posting forms with WhatsApp integration, AI Job Description Generator, and a status-based workflow (Draft, Live, Paused, Closed, Filled) with conditional validation.
    - **Individuals Portal**: Multiple CV management, profile management, and an AI Interview Coach ("Jabu") offering configurable interviews and real-time feedback.
        - **CV Management**: Users can upload multiple CVs via file upload or manual creation. Each CV is stored with AI-extracted information (personal info, work experience, skills, education) and can be viewed in detail. CVs are stored separately from job seeker profiles.
            - **CV Photo Upload**: Professional photo upload with AI-powered circular cropping using Sharp library. Photos are processed to 400x400px circular format with transparent backgrounds. Users can toggle photo inclusion via switch control. Photos display in CV preview, PDF preview, and detail view with responsive sizing (h-32 w-32 mobile, h-40 w-40 desktop, positioned right-aligned next to contact information).
            - **PDF Preview**: Users can preview their CV in the final formatted layout (matching the creation preview) directly from the CV list via "PDF Preview" button. Preview shows complete CV structure including photo (if enabled), personal info, work experience, education, and skills in the export-ready format.
    - **ATS**: Candidate management with AI-powered resume ingestion and semantic search.
    - **Integrated Roles & Screening**: Management of hiring roles with configurable scoring and AI-evaluated candidate screening.
    - **Organization Settings**: Multi-tenant configuration for teams, pipelines, and compliance.
    - **Location & Job Data**: Comprehensive South African city/town and job title systems with auto-fill.
- **Backend**: Express.js with TypeScript.
    - **API Endpoints**: Manages subscriptions, job postings, CVs, roles/screening, ATS, organization settings, and interview coach interactions. Includes specific endpoints for job status management and conditional validation.
        - **CV Endpoints**: `GET /api/cvs` (list user's CVs), `GET /api/cvs/:id` (get specific CV), `DELETE /api/cvs/:id` (delete CV), `POST /api/individuals/resume/upload` (upload PDF/file), `POST /api/individuals/resume/parse` (paste text). All CV endpoints include authorization checks to ensure users can only access their own CVs.
    - **AI Integration**: Powers CV screening, resume ingestion, interview coaching, and fraud detection (currently paused).
        - **CV Resume Ingestion**: Uses pdf-parse for PDF text extraction, with token limiting (110k token cap) to prevent OpenAI context length errors. Extracts text from PDFs and truncates if needed before sending to GPT-4o for parsing. Parsed data is saved to the `cvs` table with structured fields for personal info, work experience, skills, and education.
    - **Background Job Processing**: BullMQ with Redis for asynchronous tasks like candidate screening.
    - **Authentication & Authorization**: Passwordless magic link authentication using Resend, Express-session with PostgreSQL store, and robust security features (rate limiting, session fixation prevention). Includes an admin setup endpoint and a single-role system for users (individual, business, recruiter, admin) with role-based access control.
    - **User Management**: Users are identified by auto-incrementing `id` and unique `email`, with onboarding status and last login tracking.
    - **Admin Setup**: Secure admin creation system using `/api/admin/setup` endpoint with `ADMIN_SETUP_SECRET` protection. The endpoint automatically locks after the first admin is created for security. Current admins: wes.dutoit@sebenzahub.co.za, jabulani.mkhwanazi@sebenzahub.co.za.
        - **Promoting Future Admins**: After the first admin is created, use authenticated admin routes (`/api/admin/users/:id/role`) or update the database directly via SQL: `UPDATE users SET role = 'admin' WHERE email = 'new-admin@example.com';`
        - **Security Notes**: ADMIN_SETUP_SECRET must be stored in workspace secrets (development) and deployment environment variables (production). Never commit secrets to the repository.
- **Data Storage**: PostgreSQL (Neon) with Drizzle ORM and pgvector extension, using UUID primary keys.

### System Design Choices
- **Monorepo Structure**: Organized into `client/`, `server/`, and `shared/` directories.
- **South African Context**: POPIA compliance and WhatsApp-first workflow.

## External Dependencies
- **UI & Styling**: Radix UI, shadcn/ui, Lucide React, Tailwind CSS, Google 1s.
- **Form Handling**: React Hook Form, Zod.
- **Database**: Drizzle ORM, @neondatabase/serverless.
- **File Upload**: Multer, pdf-parse (PDF text extraction).
- **Background Jobs**: BullMQ, ioredis.
- **AI**: OpenAI GPT-4o, OpenAI GPT-4o-mini, OpenAI text-embedding-3-small.
- **Email**: Resend.
- **Maps & Geolocation**: Google Maps JavaScript API.

## Production Deployment Guide

### CRITICAL: Fix .replit File for Autoscale Deployment

**Issue**: Autoscale deployments only support ONE external port, but the `.replit` file currently has 15 different ports configured.

**Required Fix** (MUST be done manually before deploying):

1. Open the `.replit` file in your Replit workspace
2. Find the `[[ports]]` section (around line 14)
3. Delete ALL port configurations EXCEPT the first one
4. Keep only this single port configuration:
   ```
   [[ports]]
   localPort = 5000
   externalPort = 80
   ```
5. Delete all other `[[ports]]` blocks (there are currently 14 extra ones)
6. Save the file

**What to Delete**: Remove all these port configurations:
- `localPort = 33501` → `externalPort = 8080`
- `localPort = 35775` → `externalPort = 3001`
- `localPort = 36143` → `externalPort = 8081`
- `localPort = 36877` → `externalPort = 5173`
- `localPort = 37355` → `externalPort = 6000`
- `localPort = 37657` → `externalPort = 8008`
- `localPort = 38553` → `externalPort = 4200`
- `localPort = 40355` → `externalPort = 3002`
- `localPort = 40487` → `externalPort = 8099`
- `localPort = 40539` → `externalPort = 3003`
- `localPort = 41075` → `externalPort = 5000`
- `localPort = 43685` → `externalPort = 9000`
- `localPort = 43871` → `externalPort = 6800`
- `localPort = 45079` → `externalPort = 3000`
- `localPort = 45425` → `externalPort = 8000`

**After the fix**, your `[[ports]]` section should look like this:
```
[[ports]]
localPort = 5000
externalPort = 80

[env]
PORT = "5000"
```

**Why This Matters**: Autoscale (Cloud Run) deployments fail if multiple external ports are configured. The deployment error will say: "requires exactly one external port exposed, but .replit has 15 different ports configured with externalPort values"

### Required Environment Variables for Production

When deploying to production, you MUST manually add these environment variables to your deployment. Workspace secrets are NOT automatically copied to deployments.

**How to Add Environment Variables to Production**:
1. Open your Replit workspace
2. Click **Deploy** tool in left sidebar
3. Click on your published deployment (sebenzahub)
4. Go to **Settings** tab
5. Scroll to **Environment Variables** section
6. Add each variable below

**Required Variables**:

1. **DATABASE_URL** (Production Database)
   - Get from: Database pane → Click your database → Settings → Copy connection string
   - Format: `postgresql://user:pass@host/database?sslmode=require`
   - **Important**: Use the PRODUCTION database URL, not development

2. **SESSION_SECRET** (Session Encryption)
   - Generate a secure random key:
     ```bash
     openssl rand -base64 32
     ```
   - Example output: `jgaIfWvTULs+W/2wUUEUONEwEsI2lChhojiStubNfo4=`
   - Paste this value into the SESSION_SECRET environment variable

3. **REDIS_URL** (Background Jobs)
   - Required for BullMQ background job processing (CV screening, etc.)
   - Get from your Redis provider (Upstash, Redis Cloud, etc.)
   - Format: `redis://username:password@host:port`
   - **Note**: Application will start without Redis, but background jobs won't process

4. **RESEND_API_KEY** (Email Service)
   - Option A: Enable Resend connector in deployment settings
   - Option B: Get from https://resend.com/api-keys
   - Format: `re_xxxxxxxxxx`

**Optional Variables**:

5. **PUBLIC_URL** (Custom Domain Override)
   - Only needed if using a custom domain
   - Default: `https://sebenzahub.replit.app`
   - Example: `https://sebenzahub.co.za`

6. **ADMIN_SETUP_SECRET** (Admin User Creation)
   - Only needed if you want to use the `/api/admin/setup` endpoint in production
   - Generate a secure random key (same method as SESSION_SECRET)
   - **Security**: Remove after first admin is created to prevent unauthorized admin creation

### Quick Deployment Checklist

Before deploying to production:

- [ ] **CRITICAL**: Fix `.replit` file - remove all port configurations except `localPort 5000 → externalPort 80`
- [ ] Add `DATABASE_URL` to deployment environment variables (production database)
- [ ] Add `SESSION_SECRET` to deployment environment variables (generate with openssl)
- [ ] Add `REDIS_URL` to deployment environment variables (for background jobs)
- [ ] Enable Resend connector in deployment OR add `RESEND_API_KEY`
- [ ] Verify build command: `npm run build`
- [ ] Verify start command: `npm run start`
- [ ] Set health check path to `/healthz`
- [ ] Deploy and check logs for errors

### Testing Production After Deployment

1. **Check Health**: Visit `https://sebenzahub.replit.app/healthz` → should return "ok"
2. **Check System Status**: Visit `https://sebenzahub.replit.app/api/health/production` → should return JSON with all checks passing
3. **Test Magic Link**: 
   - Go to `https://sebenzahub.replit.app`
   - Request magic link with your email
   - Check email (including spam folder)
   - Click magic link (should have `.replit.app` in URL, not `.replit.dev`)
   - Should redirect and log you in successfully

### Common Production Issues

#### Issue: "Unable to Wake Up" - Deployment Won't Start

See full troubleshooting guide above in "Common Production Issues" section.

#### Issue: Magic Link Has Wrong URL (localhost or workspace.replit.app)

**Symptoms**: Email contains `http://localhost:5000` or `https://workspace.replit.app` instead of `https://sebenzahub.replit.app`

**Cause**: Application is using wrong environment variables to construct URLs

**Solution**: 
- The code now defaults to `https://sebenzahub.replit.app` for production
- Optionally set `PUBLIC_URL=https://sebenzahub.replit.app` in deployment environment variables

#### Issue: "Not Found" when clicking magic link

**Symptoms**: Clicking magic link shows plain "Not Found" page

**Cause**: 
1. Frontend build files not being served correctly
2. Missing static file serving in production
3. Build step didn't complete

**Solution**:
1. Check deployment logs for build errors
2. Verify `npm run build` completed successfully
3. Ensure start command is `npm run start` (not `npm run dev`)
4. Redeploy after fixing any build issues

### Environment-Specific Behavior

**Development (.replit.dev)**:
- Uses development database
- Magic links use `.replit.dev` domain
- All debug logging enabled
- Can access via workspace preview
- Environment variable: `REPLIT_DEV_DOMAIN` is set

**Production (.replit.app)**:
- Uses production database (completely separate from dev)
- Magic links use `.replit.app` domain (e.g., `https://sebenzahub.replit.app`)
- Production logging (less verbose)
- Public-facing URL
- Environment variables: `REPLIT_DEPLOYMENT=1`

**How Magic Link URLs Work**:
The system automatically detects the environment and generates the correct magic link URL:
- **Production**: `https://sebenzahub.replit.app/auth/verify?token=...` (hardcoded, can override with PUBLIC_URL)
- **Development**: `https://${REPLIT_DEV_DOMAIN}/auth/verify?token=...`
- **Local**: `http://localhost:5000/auth/verify?token=...`

**Important**: Magic links are environment-specific and won't work cross-environment:
- Dev links (`.replit.dev`) only work in the development database
- Production links (`.replit.app`) only work in the production database
- Never share dev magic links with production users!