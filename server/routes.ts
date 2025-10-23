import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubscriberSchema, insertJobSchema, insertCVSchema, insertMagicTokenSchema, insertCandidateProfileSchema, insertOrganizationSchema, insertRecruiterProfileSchema, insertScreeningJobSchema, insertScreeningCandidateSchema, insertScreeningEvaluationSchema, insertCandidateSchema, insertExperienceSchema, insertEducationSchema, insertCertificationSchema, insertProjectSchema, insertAwardSchema, insertSkillSchema, insertRoleSchema, insertScreeningSchema, type User } from "@shared/schema";
import { db } from "./db";
import { users, magicTokens, candidateProfiles, organizations, recruiterProfiles, memberships, screeningJobs, screeningCandidates, screeningEvaluations, candidates, experiences, education, certifications, projects, awards, skills, candidateSkills, resumes, roles, screenings } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { randomBytes } from "crypto";
import { sendMagicLinkEmail } from "./resend";
import { requireAuth, requireRole, optionalAuth, generateToken, type AuthRequest } from "./auth";
import { screeningQueue, isQueueAvailable } from "./queue";
import pg from "pg";
import { z } from "zod";

// Create pg pool for raw SQL queries (used by queue system)
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Helper function to enqueue screening jobs for all active roles
async function enqueueScreeningsForCandidate(candidateId: string) {
  if (!isQueueAvailable()) {
    console.log(`[Auto-Screen] Queue not available, skipping auto-screening for candidate ${candidateId}`);
    return;
  }

  try {
    const { rows: activeRoles } = await pool.query(
      "SELECT id FROM roles WHERE is_active = TRUE OR is_active = 1"
    );
    
    if (activeRoles.length === 0) {
      console.log(`[Auto-Screen] No active roles found, skipping screening for candidate ${candidateId}`);
      return;
    }

    for (const role of activeRoles) {
      await screeningQueue!.add("screen", { 
        roleId: role.id, 
        candidateId 
      });
    }
    
    console.log(`[Auto-Screen] Enqueued ${activeRoles.length} screening job(s) for candidate ${candidateId}`);
  } catch (error) {
    console.error(`[Auto-Screen] Failed to enqueue screenings for candidate ${candidateId}:`, error);
  }
}
import { parseCVWithAI, evaluateCandidateWithAI, isAIConfigured } from "./ai-screening";
import { parseCVWithAI as parseResumeWithAI, isAIConfigured as isAIConfiguredForCV } from "./ai-cv-ingestion";
import multer from "multer";
import { promises as fs } from "fs";
import path from "path";
import shortlistRoutes from "./shortlist.routes";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/subscribe", async (req, res) => {
    try {
      const validatedData = insertSubscriberSchema.parse(req.body);
      const subscriber = await storage.createSubscriber(validatedData);
      
      console.log(`New subscriber: ${subscriber.email} at ${subscriber.createdAt}`);
      
      res.json({
        success: true,
        message: "Successfully subscribed to early access!",
        subscriber: {
          id: subscriber.id,
          email: subscriber.email,
        },
      });
    } catch (error: any) {
      if (error.message === "Email already subscribed") {
        res.status(400).json({
          success: false,
          message: "This email is already on the waitlist.",
        });
      } else {
        console.error("Subscription error:", error);
        res.status(400).json({
          success: false,
          message: "Invalid email address.",
        });
      }
    }
  });

  app.get("/api/subscribers", async (_req, res) => {
    try {
      const subscribers = await storage.getAllSubscribers();
      res.json({
        success: true,
        count: subscribers.length,
        subscribers: subscribers.map(s => ({
          id: s.id,
          email: s.email,
          createdAt: s.createdAt,
        })),
      });
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching subscribers.",
      });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const validatedData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(validatedData);
      
      console.log(`New job posted: ${job.title} at ${job.company}`);
      
      res.json({
        success: true,
        message: "Job posted successfully!",
        job,
      });
    } catch (error: any) {
      console.error("Job posting error:", error);
      res.status(400).json({
        success: false,
        message: error.errors ? "Invalid job data." : "Error posting job.",
      });
    }
  });

  app.get("/api/jobs", async (_req, res) => {
    try {
      const jobs = await storage.getAllJobs();
      res.json({
        success: true,
        count: jobs.length,
        jobs,
      });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching jobs.",
      });
    }
  });

  app.post("/api/cvs", async (req, res) => {
    try {
      const validatedData = insertCVSchema.parse(req.body);
      const cv = await storage.createCV(validatedData);
      
      console.log(`New CV created: ${cv.id}`);
      
      res.json({
        success: true,
        message: "CV created successfully!",
        cv,
      });
    } catch (error: any) {
      console.error("CV creation error:", error);
      res.status(400).json({
        success: false,
        message: error.errors ? "Invalid CV data." : "Error creating CV.",
        errors: error.errors,
      });
    }
  });

  app.get("/api/cvs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const cv = await storage.getCV(id);
      
      if (!cv) {
        res.status(404).json({
          success: false,
          message: "CV not found.",
        });
        return;
      }

      res.json({
        success: true,
        cv,
      });
    } catch (error) {
      console.error("Error fetching CV:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching CV.",
      });
    }
  });

  app.put("/api/cvs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertCVSchema.partial().parse(req.body);
      const cv = await storage.updateCV(id, validatedData);
      
      if (!cv) {
        res.status(404).json({
          success: false,
          message: "CV not found.",
        });
        return;
      }

      console.log(`CV updated: ${cv.id}`);
      
      res.json({
        success: true,
        message: "CV updated successfully!",
        cv,
      });
    } catch (error: any) {
      console.error("CV update error:", error);
      res.status(400).json({
        success: false,
        message: error.errors ? "Invalid CV data." : "Error updating CV.",
        errors: error.errors,
      });
    }
  });

  app.get("/api/cvs", async (_req, res) => {
    try {
      const cvs = await storage.getAllCVs();
      res.json({
        success: true,
        count: cvs.length,
        cvs,
      });
    } catch (error) {
      console.error("Error fetching CVs:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching CVs.",
      });
    }
  });

  // Auth routes
  app.post("/auth/magic/start", async (req, res) => {
    try {
      console.log("[AUTH] Magic link request received for:", req.body.email);
      
      const { email } = z.object({
        email: z.string().email(),
      }).parse(req.body);

      console.log("[AUTH] Generating token for:", email);
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      console.log("[AUTH] Deleting old tokens for:", email);
      await db.delete(magicTokens).where(eq(magicTokens.email, email));

      console.log("[AUTH] Inserting new token");
      await db.insert(magicTokens).values({
        token,
        email,
        expiresAt,
      });

      console.log("[AUTH] Sending magic link email to:", email);
      await sendMagicLinkEmail(email, token);

      console.log("[AUTH] Magic link sent successfully to:", email);
      res.json({
        success: true,
        message: "Magic link sent to your email!",
      });
    } catch (error: any) {
      console.error("[AUTH] Magic link error:", error);
      console.error("[AUTH] Error stack:", error.stack);
      res.status(400).json({
        success: false,
        message: "Failed to send magic link. Please check your email address.",
      });
    }
  });

  app.get("/auth/verify", async (req, res) => {
    try {
      const { token } = z.object({
        token: z.string(),
      }).parse(req.query);

      const [magicToken] = await db.select()
        .from(magicTokens)
        .where(eq(magicTokens.token, token));

      if (!magicToken) {
        return res.redirect('/?error=invalid_token');
      }

      if (new Date() > magicToken.expiresAt) {
        await db.delete(magicTokens).where(eq(magicTokens.id, magicToken.id));
        return res.redirect('/?error=expired_token');
      }

      let [user] = await db.select()
        .from(users)
        .where(eq(users.email, magicToken.email));

      if (!user) {
        [user] = await db.insert(users)
          .values({
            email: magicToken.email,
            roles: [],
            onboardingComplete: {},
          })
          .returning();
      }

      await db.delete(magicTokens).where(eq(magicTokens.id, magicToken.id));

      const authToken = generateToken(user.id);
      res.cookie('auth_token', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax',
      });

      res.redirect('/onboarding');
    } catch (error: any) {
      console.error("Verification error:", error);
      res.redirect('/?error=verification_failed');
    }
  });

  app.post("/auth/logout", (req, res) => {
    res.clearCookie('auth_token');
    res.json({ success: true, message: "Logged out successfully" });
  });

  app.get("/api/me", requireAuth, async (req: AuthRequest, res) => {
    res.json({ user: req.user });
  });

  app.post("/api/me/role", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { role } = z.object({
        role: z.enum(['individual', 'business', 'recruiter']),
      }).parse(req.body);

      const currentRoles = req.user!.roles || [];
      if (!currentRoles.includes(role)) {
        currentRoles.push(role);
      }

      await db.update(users)
        .set({ roles: currentRoles })
        .where(eq(users.id, req.user!.id));

      res.json({ success: true, message: "Role added successfully" });
    } catch (error: any) {
      console.error("Role update error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to update role",
      });
    }
  });

  app.post("/api/profile/candidate", requireAuth, requireRole('individual'), async (req: AuthRequest, res) => {
    try {
      const validatedData = insertCandidateProfileSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      if (!validatedData.popiaConsentGiven || validatedData.popiaConsentGiven !== 1) {
        return res.status(400).json({
          success: false,
          message: "POPIA consent is required to create a profile",
        });
      }

      const [existing] = await db.select()
        .from(candidateProfiles)
        .where(eq(candidateProfiles.userId, req.user!.id));

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Candidate profile already exists",
        });
      }

      const [profile] = await db.insert(candidateProfiles)
        .values(validatedData)
        .returning();

      const onboardingComplete = req.user!.onboardingComplete as any || {};
      onboardingComplete.individual = true;

      await db.update(users)
        .set({ onboardingComplete })
        .where(eq(users.id, req.user!.id));

      res.json({
        success: true,
        message: "Candidate profile created successfully",
        profile,
      });
    } catch (error: any) {
      console.error("Candidate profile error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to create candidate profile",
      });
    }
  });

  app.post("/api/organizations", requireAuth, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertOrganizationSchema.parse(req.body);

      const [organization] = await db.insert(organizations)
        .values(validatedData)
        .returning();

      await db.insert(memberships).values({
        userId: req.user!.id,
        organizationId: organization.id,
        role: 'owner',
      });

      const roleType = organization.type === 'employer' ? 'business' : 'recruiter';
      const onboardingComplete = req.user!.onboardingComplete as any || {};
      onboardingComplete[roleType] = true;

      await db.update(users)
        .set({ onboardingComplete })
        .where(eq(users.id, req.user!.id));

      res.json({
        success: true,
        message: "Organization created successfully",
        organization,
      });
    } catch (error: any) {
      console.error("Organization creation error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to create organization",
      });
    }
  });

  app.post("/api/profile/recruiter", requireAuth, requireRole('recruiter'), async (req: AuthRequest, res) => {
    try {
      const validatedData = insertRecruiterProfileSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      const [existing] = await db.select()
        .from(recruiterProfiles)
        .where(eq(recruiterProfiles.userId, req.user!.id));

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Recruiter profile already exists",
        });
      }

      const [profile] = await db.insert(recruiterProfiles)
        .values(validatedData)
        .returning();

      res.json({
        success: true,
        message: "Recruiter profile created successfully",
        profile,
      });
    } catch (error: any) {
      console.error("Recruiter profile error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to create recruiter profile",
      });
    }
  });

  // === CV SCREENING ENDPOINTS ===
  
  // Create a new screening job
  app.post("/api/screening/jobs", requireAuth, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertScreeningJobSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      const [job] = await db.insert(screeningJobs)
        .values(validatedData)
        .returning();

      res.json({
        success: true,
        message: "Screening job created successfully",
        job,
      });
    } catch (error: any) {
      console.error("Screening job creation error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to create screening job",
      });
    }
  });

  // Get screening jobs for user
  app.get("/api/screening/jobs", requireAuth, async (req: AuthRequest, res) => {
    try {
      const jobs = await db.select()
        .from(screeningJobs)
        .where(eq(screeningJobs.userId, req.user!.id))
        .orderBy(desc(screeningJobs.createdAt));

      res.json({
        success: true,
        jobs,
      });
    } catch (error) {
      console.error("Error fetching screening jobs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch screening jobs",
      });
    }
  });

  // Get a specific screening job with results
  app.get("/api/screening/jobs/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const [job] = await db.select()
        .from(screeningJobs)
        .where(and(
          eq(screeningJobs.id, req.params.id),
          eq(screeningJobs.userId, req.user!.id)
        ));

      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Screening job not found",
        });
      }

      // Get candidates and evaluations for this job
      const candidates = await db.select()
        .from(screeningCandidates)
        .where(eq(screeningCandidates.screeningJobId, job.id));

      const evaluations = await db.select()
        .from(screeningEvaluations)
        .where(eq(screeningEvaluations.screeningJobId, job.id))
        .orderBy(desc(screeningEvaluations.scoreTotal));

      res.json({
        success: true,
        job,
        candidates,
        evaluations,
      });
    } catch (error) {
      console.error("Error fetching screening job:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch screening job",
      });
    }
  });

  // Upload and process CVs for a screening job
  app.post("/api/screening/jobs/:id/process", requireAuth, async (req: AuthRequest, res) => {
    try {
      // Check if AI integration is configured
      if (!isAIConfigured()) {
        return res.status(503).json({
          success: false,
          message: "AI screening service is not configured. Please contact support.",
          error: "OpenAI integration not set up",
        });
      }

      const jobId = req.params.id;
      const { cvTexts } = req.body as { cvTexts: string[] };

      if (!cvTexts || !Array.isArray(cvTexts) || cvTexts.length === 0) {
        return res.status(400).json({
          success: false,
          message: "CV texts array is required",
        });
      }

      // Get the screening job
      const [job] = await db.select()
        .from(screeningJobs)
        .where(and(
          eq(screeningJobs.id, jobId),
          eq(screeningJobs.userId, req.user!.id)
        ));

      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Screening job not found",
        });
      }

      // Update job status to processing
      await db.update(screeningJobs)
        .set({ status: 'processing' })
        .where(eq(screeningJobs.id, jobId));

      const processedCandidates: Array<{ candidateId: string; evaluation: any }> = [];

      // Process each CV
      for (const cvText of cvTexts) {
        try {
          // Parse CV with AI
          const parsedCandidate = await parseCVWithAI(cvText);

          // Store candidate
          const [candidate] = await db.insert(screeningCandidates)
            .values({
              screeningJobId: jobId,
              fullName: parsedCandidate.full_name,
              contact: parsedCandidate.contact,
              headline: parsedCandidate.headline,
              skills: parsedCandidate.skills,
              experience: parsedCandidate.experience,
              education: parsedCandidate.education,
              certifications: parsedCandidate.certifications,
              achievements: parsedCandidate.achievements,
              links: parsedCandidate.links,
              workAuthorization: parsedCandidate.work_authorization,
              salaryExpectation: parsedCandidate.salary_expectation,
              availability: parsedCandidate.availability,
              rawCvText: cvText,
            })
            .returning();

          // Evaluate candidate against criteria
          const evaluation = await evaluateCandidateWithAI(parsedCandidate, {
            job_title: job.jobTitle,
            job_description: job.jobDescription,
            seniority: job.seniority || undefined,
            employment_type: job.employmentType || undefined,
            location: job.location as any,
            must_have_skills: job.mustHaveSkills,
            nice_to_have_skills: job.niceToHaveSkills,
            salary_range: job.salaryRange as any,
            knockouts: job.knockouts,
            weights: job.weights as any,
          });

          // Store evaluation
          const [storedEvaluation] = await db.insert(screeningEvaluations)
            .values({
              screeningJobId: jobId,
              candidateId: candidate.id,
              scoreTotal: evaluation.score_total,
              scoreBreakdown: evaluation.score_breakdown,
              mustHavesSatisfied: evaluation.must_haves_satisfied,
              missingMustHaves: evaluation.missing_must_haves,
              knockout: evaluation.knockout,
              reasons: evaluation.reasons,
              flags: evaluation.flags,
            })
            .returning();

          processedCandidates.push({
            candidateId: candidate.id,
            evaluation: storedEvaluation,
          });
        } catch (error) {
          console.error("Error processing CV:", error);
          // Continue with other CVs even if one fails
        }
      }

      // Calculate rankings
      const allEvaluations = await db.select()
        .from(screeningEvaluations)
        .where(eq(screeningEvaluations.screeningJobId, jobId))
        .orderBy(desc(screeningEvaluations.scoreTotal));

      // Update ranks
      for (let i = 0; i < allEvaluations.length; i++) {
        await db.update(screeningEvaluations)
          .set({ rank: i + 1 })
          .where(eq(screeningEvaluations.id, allEvaluations[i].id));
      }

      // Update job status to completed
      await db.update(screeningJobs)
        .set({ status: 'completed' })
        .where(eq(screeningJobs.id, jobId));

      res.json({
        success: true,
        message: `Processed ${processedCandidates.length} candidates`,
        processedCount: processedCandidates.length,
      });
    } catch (error: any) {
      console.error("CV processing error:", error);
      
      // Update job status to failed
      try {
        await db.update(screeningJobs)
          .set({ status: 'failed' })
          .where(eq(screeningJobs.id, req.params.id));
      } catch (e) {
        console.error("Error updating job status:", e);
      }

      res.status(500).json({
        success: false,
        message: "Failed to process CVs",
        error: error.message,
      });
    }
  });

  // Export screening results as JSON
  app.get("/api/screening/jobs/:id/export", requireAuth, async (req: AuthRequest, res) => {
    try {
      const [job] = await db.select()
        .from(screeningJobs)
        .where(and(
          eq(screeningJobs.id, req.params.id),
          eq(screeningJobs.userId, req.user!.id)
        ));

      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Screening job not found",
        });
      }

      // Get candidates and evaluations
      const candidates = await db.select()
        .from(screeningCandidates)
        .where(eq(screeningCandidates.screeningJobId, job.id));

      const evaluations = await db.select()
        .from(screeningEvaluations)
        .where(eq(screeningEvaluations.screeningJobId, job.id))
        .orderBy(desc(screeningEvaluations.scoreTotal));

      // Merge data
      const rankedCandidates = evaluations.map((evaluation) => {
        const candidate = candidates.find((c) => c.id === evaluation.candidateId);
        return { ...evaluation, candidate };
      });

      const exportData = {
        job,
        candidates,
        evaluations: rankedCandidates,
        exportedAt: new Date().toISOString(),
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="screening-results-${job.id}.json"`);
      res.json(exportData);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to export results",
      });
    }
  });

  // ============================================================================
  // ATS (Applicant Tracking System) - Candidate Management API
  // ============================================================================

  // Create new candidate
  app.post("/api/ats/candidates", requireAuth, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertCandidateSchema.parse(req.body);
      const [candidate] = await db.insert(candidates)
        .values(validatedData)
        .returning();

      // Auto-enqueue screening jobs for all active roles
      enqueueScreeningsForCandidate(candidate.id).catch(err => {
        console.error(`[Auto-Screen] Failed to enqueue screenings:`, err);
      });

      res.json({
        success: true,
        message: "Candidate created successfully",
        candidate,
      });
    } catch (error: any) {
      console.error("Create candidate error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to create candidate",
        errors: error.errors,
      });
    }
  });

  // List all candidates with optional search/filter
  app.get("/api/ats/candidates", requireAuth, async (req: AuthRequest, res) => {
    try {
      const searchQuery = req.query.search as string || '';
      const city = req.query.city as string || '';
      const country = req.query.country as string || '';
      
      // For now, get all candidates (pagination and filtering can be added later)
      const allCandidates = await db.select().from(candidates);
      
      // Simple filtering
      let filtered = allCandidates;
      if (searchQuery) {
        filtered = filtered.filter(c => 
          c.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.headline?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (city) {
        filtered = filtered.filter(c => c.city?.toLowerCase() === city.toLowerCase());
      }
      if (country) {
        filtered = filtered.filter(c => c.country?.toLowerCase() === country.toLowerCase());
      }

      res.json({
        success: true,
        count: filtered.length,
        candidates: filtered,
      });
    } catch (error) {
      console.error("List candidates error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch candidates",
      });
    }
  });

  // Get single candidate with all related data
  app.get("/api/ats/candidates/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const candidateId = req.params.id;

      const [candidate] = await db.select()
        .from(candidates)
        .where(eq(candidates.id, candidateId));

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      // Get all related data
      const candidateExperiences = await db.select()
        .from(experiences)
        .where(eq(experiences.candidateId, candidateId));

      const candidateEducation = await db.select()
        .from(education)
        .where(eq(education.candidateId, candidateId));

      const candidateCertifications = await db.select()
        .from(certifications)
        .where(eq(certifications.candidateId, candidateId));

      const candidateProjects = await db.select()
        .from(projects)
        .where(eq(projects.candidateId, candidateId));

      const candidateAwards = await db.select()
        .from(awards)
        .where(eq(awards.candidateId, candidateId));

      // Get skills with names
      const candidateSkillsData = await db.select({
        skillId: candidateSkills.skillId,
        skillName: skills.name,
        kind: candidateSkills.kind,
      })
        .from(candidateSkills)
        .innerJoin(skills, eq(candidateSkills.skillId, skills.id))
        .where(eq(candidateSkills.candidateId, candidateId));

      const candidateResumes = await db.select()
        .from(resumes)
        .where(eq(resumes.candidateId, candidateId));

      res.json({
        success: true,
        candidate: {
          ...candidate,
          experiences: candidateExperiences,
          education: candidateEducation,
          certifications: candidateCertifications,
          projects: candidateProjects,
          awards: candidateAwards,
          skills: candidateSkillsData,
          resumes: candidateResumes,
        },
      });
    } catch (error) {
      console.error("Get candidate error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch candidate",
      });
    }
  });

  // Update candidate
  app.put("/api/ats/candidates/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const candidateId = req.params.id;
      const validatedData = insertCandidateSchema.partial().parse(req.body);

      const [updated] = await db.update(candidates)
        .set(validatedData)
        .where(eq(candidates.id, candidateId))
        .returning();

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      res.json({
        success: true,
        message: "Candidate updated successfully",
        candidate: updated,
      });
    } catch (error: any) {
      console.error("Update candidate error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to update candidate",
        errors: error.errors,
      });
    }
  });

  // Delete candidate (cascades to all related records)
  app.delete("/api/ats/candidates/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const candidateId = req.params.id;

      const [deleted] = await db.delete(candidates)
        .where(eq(candidates.id, candidateId))
        .returning();

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      res.json({
        success: true,
        message: "Candidate deleted successfully",
      });
    } catch (error) {
      console.error("Delete candidate error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete candidate",
      });
    }
  });

  // ============================================================================
  // ATS - Experiences Management
  // ============================================================================

  app.post("/api/ats/candidates/:candidateId/experiences", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { candidateId } = req.params;
      const validatedData = insertExperienceSchema.parse({
        ...req.body,
        candidateId,
      });

      const [experience] = await db.insert(experiences)
        .values(validatedData)
        .returning();

      res.json({
        success: true,
        message: "Experience added successfully",
        experience,
      });
    } catch (error: any) {
      console.error("Add experience error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to add experience",
        errors: error.errors,
      });
    }
  });

  app.put("/api/ats/experiences/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertExperienceSchema.partial().parse(req.body);

      const [updated] = await db.update(experiences)
        .set(validatedData)
        .where(eq(experiences.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Experience not found",
        });
      }

      res.json({
        success: true,
        message: "Experience updated successfully",
        experience: updated,
      });
    } catch (error: any) {
      console.error("Update experience error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to update experience",
        errors: error.errors,
      });
    }
  });

  app.delete("/api/ats/experiences/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      const [deleted] = await db.delete(experiences)
        .where(eq(experiences.id, id))
        .returning();

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Experience not found",
        });
      }

      res.json({
        success: true,
        message: "Experience deleted successfully",
      });
    } catch (error) {
      console.error("Delete experience error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete experience",
      });
    }
  });

  // ============================================================================
  // ATS - Education Management
  // ============================================================================

  app.post("/api/ats/candidates/:candidateId/education", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { candidateId } = req.params;
      const validatedData = insertEducationSchema.parse({
        ...req.body,
        candidateId,
      });

      const [edu] = await db.insert(education)
        .values(validatedData)
        .returning();

      res.json({
        success: true,
        message: "Education added successfully",
        education: edu,
      });
    } catch (error: any) {
      console.error("Add education error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to add education",
        errors: error.errors,
      });
    }
  });

  app.put("/api/ats/education/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertEducationSchema.partial().parse(req.body);

      const [updated] = await db.update(education)
        .set(validatedData)
        .where(eq(education.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Education not found",
        });
      }

      res.json({
        success: true,
        message: "Education updated successfully",
        education: updated,
      });
    } catch (error: any) {
      console.error("Update education error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to update education",
        errors: error.errors,
      });
    }
  });

  app.delete("/api/ats/education/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      const [deleted] = await db.delete(education)
        .where(eq(education.id, id))
        .returning();

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Education not found",
        });
      }

      res.json({
        success: true,
        message: "Education deleted successfully",
      });
    } catch (error) {
      console.error("Delete education error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete education",
      });
    }
  });

  // ============================================================================
  // ATS - Certifications, Projects, Awards Management
  // ============================================================================

  app.post("/api/ats/candidates/:candidateId/certifications", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { candidateId } = req.params;
      const validatedData = insertCertificationSchema.parse({
        ...req.body,
        candidateId,
      });

      const [cert] = await db.insert(certifications)
        .values(validatedData)
        .returning();

      res.json({
        success: true,
        message: "Certification added successfully",
        certification: cert,
      });
    } catch (error: any) {
      console.error("Add certification error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to add certification",
        errors: error.errors,
      });
    }
  });

  app.delete("/api/ats/certifications/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await db.delete(certifications).where(eq(certifications.id, id));
      res.json({ success: true, message: "Certification deleted" });
    } catch (error) {
      console.error("Delete certification error:", error);
      res.status(500).json({ success: false, message: "Failed to delete certification" });
    }
  });

  app.post("/api/ats/candidates/:candidateId/projects", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { candidateId } = req.params;
      const validatedData = insertProjectSchema.parse({
        ...req.body,
        candidateId,
      });

      const [project] = await db.insert(projects)
        .values(validatedData)
        .returning();

      res.json({
        success: true,
        message: "Project added successfully",
        project,
      });
    } catch (error: any) {
      console.error("Add project error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to add project",
        errors: error.errors,
      });
    }
  });

  app.delete("/api/ats/projects/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await db.delete(projects).where(eq(projects.id, id));
      res.json({ success: true, message: "Project deleted" });
    } catch (error) {
      console.error("Delete project error:", error);
      res.status(500).json({ success: false, message: "Failed to delete project" });
    }
  });

  app.post("/api/ats/candidates/:candidateId/awards", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { candidateId } = req.params;
      const validatedData = insertAwardSchema.parse({
        ...req.body,
        candidateId,
      });

      const [award] = await db.insert(awards)
        .values(validatedData)
        .returning();

      res.json({
        success: true,
        message: "Award added successfully",
        award,
      });
    } catch (error: any) {
      console.error("Add award error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to add award",
        errors: error.errors,
      });
    }
  });

  app.delete("/api/ats/awards/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await db.delete(awards).where(eq(awards.id, id));
      res.json({ success: true, message: "Award deleted" });
    } catch (error) {
      console.error("Delete award error:", error);
      res.status(500).json({ success: false, message: "Failed to delete award" });
    }
  });

  // ============================================================================
  // ATS - Skills Management
  // ============================================================================

  app.post("/api/ats/candidates/:candidateId/skills", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { candidateId } = req.params;
      const { skillName, kind } = req.body;

      if (!skillName || !kind) {
        return res.status(400).json({
          success: false,
          message: "Skill name and kind are required",
        });
      }

      // Find or create skill
      let [skill] = await db.select()
        .from(skills)
        .where(eq(skills.name, skillName.trim()));

      if (!skill) {
        [skill] = await db.insert(skills)
          .values({ name: skillName.trim() })
          .returning();
      }

      // Link skill to candidate
      await db.insert(candidateSkills)
        .values({
          candidateId,
          skillId: skill.id,
          kind,
        })
        .onConflictDoNothing();

      res.json({
        success: true,
        message: "Skill added successfully",
        skill: {
          skillId: skill.id,
          skillName: skill.name,
          kind,
        },
      });
    } catch (error: any) {
      console.error("Add skill error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to add skill",
      });
    }
  });

  app.delete("/api/ats/candidates/:candidateId/skills/:skillId", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { candidateId, skillId } = req.params;

      await db.delete(candidateSkills)
        .where(and(
          eq(candidateSkills.candidateId, candidateId),
          eq(candidateSkills.skillId, skillId)
        ));

      res.json({
        success: true,
        message: "Skill removed successfully",
      });
    } catch (error) {
      console.error("Remove skill error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove skill",
      });
    }
  });

  // ============================================================================
  // ATS - Resume Upload and AI Parsing
  // ============================================================================

  // Configure multer for file uploads
  const uploadDir = path.join(process.cwd(), 'uploads');
  
  // Ensure upload directory exists
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create upload directory:', err);
  }

  const upload = multer({
    dest: uploadDir,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: (_req, file, cb) => {
      const allowedMimes = [
        'text/plain',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only TXT, PDF, and DOCX files are allowed.'));
      }
    },
  });

  // Enhanced endpoint: Upload actual file (PDF/DOCX/TXT)
  app.post("/api/ats/resumes/upload", requireAuth, upload.single('file'), async (req: AuthRequest, res) => {
    const uploadedFile = req.file;

    try {
      // Check if AI is configured
      if (!isAIConfiguredForCV()) {
        return res.status(503).json({
          success: false,
          message: "AI integration is not configured. Please set up OpenAI integration.",
        });
      }

      if (!uploadedFile) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      console.log(`[ATS] Processing uploaded file: ${uploadedFile.originalname} (${uploadedFile.size} bytes)`);

      // Read file content
      let fileContent: string;
      
      if (uploadedFile.mimetype === 'text/plain') {
        // For text files, read directly
        fileContent = await fs.readFile(uploadedFile.path, 'utf-8');
      } else {
        // For PDF/DOCX, we'll send the file to OpenAI's API which can handle binary formats
        // Read as base64 for now (OpenAI can process this)
        const fileBuffer = await fs.readFile(uploadedFile.path);
        fileContent = fileBuffer.toString('base64');
      }

      // Parse CV with AI
      const parsedResult = await parseResumeWithAI(
        fileContent,
        uploadedFile.originalname,
        uploadedFile.size
      );

      const { candidate: parsedCandidate } = parsedResult;

      // Create candidate and all related records in transaction
      const [newCandidate] = await db.insert(candidates)
        .values({
          fullName: parsedCandidate.full_name || null,
          headline: parsedCandidate.headline || null,
          email: parsedCandidate.contact?.email || null,
          phone: parsedCandidate.contact?.phone || null,
          city: parsedCandidate.contact?.city || null,
          country: parsedCandidate.contact?.country || null,
          links: parsedCandidate.links || {},
          summary: parsedCandidate.summary || null,
          workAuthorization: parsedCandidate.work_authorization || null,
          availability: parsedCandidate.availability || null,
          salaryExpectation: parsedCandidate.salary_expectation || null,
          notes: parsedCandidate.notes || null,
        })
        .returning();

      const candidateId = newCandidate.id;

      // Create resume record
      await db.insert(resumes).values({
        candidateId,
        filename: uploadedFile.originalname,
        filesizeBytes: uploadedFile.size,
        parsedOk: parsedResult.source_meta.parsed_ok ? 1 : 0,
        parseNotes: parsedResult.source_meta.parse_notes,
        rawText: uploadedFile.mimetype === 'text/plain' ? fileContent : null,
      });

      // Create experiences
      if (parsedCandidate.experience && parsedCandidate.experience.length > 0) {
        for (const exp of parsedCandidate.experience) {
          await db.insert(experiences).values({
            candidateId,
            title: exp.title || null,
            company: exp.company || null,
            industry: exp.industry || null,
            location: exp.location || null,
            startDate: exp.start_date || null,
            endDate: exp.end_date || null,
            isCurrent: exp.is_current ? 1 : 0,
            bullets: exp.bullets || [],
          });
        }
      }

      // Create education
      if (parsedCandidate.education && parsedCandidate.education.length > 0) {
        for (const edu of parsedCandidate.education) {
          await db.insert(education).values({
            candidateId,
            institution: edu.institution || null,
            qualification: edu.qualification || null,
            location: edu.location || null,
            gradDate: edu.grad_date || null,
          });
        }
      }

      // Create certifications
      if (parsedCandidate.certifications && parsedCandidate.certifications.length > 0) {
        for (const cert of parsedCandidate.certifications) {
          await db.insert(certifications).values({
            candidateId,
            name: cert.name || null,
            issuer: cert.issuer || null,
            year: cert.year || null,
          });
        }
      }

      // Create projects
      if (parsedCandidate.projects && parsedCandidate.projects.length > 0) {
        for (const proj of parsedCandidate.projects) {
          await db.insert(projects).values({
            candidateId,
            name: proj.name || null,
            what: proj.what || null,
            impact: proj.impact || null,
            link: proj.link || null,
          });
        }
      }

      // Create awards
      if (parsedCandidate.awards && parsedCandidate.awards.length > 0) {
        for (const award of parsedCandidate.awards) {
          await db.insert(awards).values({
            candidateId,
            name: award.name || null,
            byWhom: award.by || null,
            year: award.year || null,
            note: award.note || null,
          });
        }
      }

      // Create skills
      if (parsedCandidate.skills) {
        const allSkills: Array<{ name: string; kind: string }> = [];

        if (parsedCandidate.skills.technical) {
          allSkills.push(...parsedCandidate.skills.technical.map(s => ({ name: s, kind: 'technical' })));
        }
        if (parsedCandidate.skills.tools) {
          allSkills.push(...parsedCandidate.skills.tools.map(s => ({ name: s, kind: 'tools' })));
        }
        if (parsedCandidate.skills.soft) {
          allSkills.push(...parsedCandidate.skills.soft.map(s => ({ name: s, kind: 'soft' })));
        }

        for (const { name, kind } of allSkills) {
          if (!name?.trim()) continue;

          // Find or create skill
          let [skill] = await db.select()
            .from(skills)
            .where(eq(skills.name, name.trim()));

          if (!skill) {
            [skill] = await db.insert(skills)
              .values({ name: name.trim() })
              .returning();
          }

          // Link to candidate
          await db.insert(candidateSkills)
            .values({
              candidateId,
              skillId: skill.id,
              kind,
            })
            .onConflictDoNothing();
        }
      }

      console.log(`[ATS] Successfully created candidate: ${newCandidate.fullName} (${candidateId})`);

      // Generate embeddings asynchronously (non-blocking)
      const { indexCandidate, isEmbeddingsConfigured } = await import("./embeddings");
      if (isEmbeddingsConfigured()) {
        indexCandidate(candidateId).catch(err => {
          console.error(`[ATS] Failed to generate embedding for candidate ${candidateId}:`, err);
        });
      } else {
        console.log(`[ATS] Embeddings not configured, skipping embedding generation`);
      }

      // Auto-enqueue screening jobs for all active roles
      enqueueScreeningsForCandidate(candidateId).catch(err => {
        console.error(`[Auto-Screen] Failed to enqueue screenings:`, err);
      });

      res.json({
        success: true,
        message: "Resume uploaded and parsed successfully",
        candidateId: candidateId,
        candidate: newCandidate,
      });
    } catch (error: any) {
      console.error("[ATS] Resume upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process resume",
        error: error.message,
      });
    } finally {
      // Clean up uploaded file
      if (uploadedFile) {
        try {
          await fs.unlink(uploadedFile.path);
          console.log(`[ATS] Cleaned up temporary file: ${uploadedFile.path}`);
        } catch (err) {
          console.error(`[ATS] Failed to delete temporary file: ${uploadedFile.path}`, err);
        }
      }
    }
  });

  // Legacy endpoint: Parse resume from raw text (keep for backwards compatibility)
  app.post("/api/ats/resumes/parse", requireAuth, async (req: AuthRequest, res) => {
    try {
      // Check if AI is configured
      if (!isAIConfiguredForCV()) {
        return res.status(503).json({
          success: false,
          message: "AI integration is not configured. Please set up OpenAI integration.",
        });
      }

      const { filename, rawText, createCandidate } = req.body;

      if (!filename || !rawText) {
        return res.status(400).json({
          success: false,
          message: "Filename and raw text are required",
        });
      }

      // Parse CV with AI
      const parsedResult = await parseResumeWithAI(
        rawText,
        filename,
        Buffer.byteLength(rawText, 'utf8')
      );

      // If createCandidate=true, create the candidate and all related records
      if (createCandidate) {
        const { candidate: parsedCandidate } = parsedResult;

        // Create candidate
        const [newCandidate] = await db.insert(candidates)
          .values({
            fullName: parsedCandidate.full_name || null,
            headline: parsedCandidate.headline || null,
            email: parsedCandidate.contact?.email || null,
            phone: parsedCandidate.contact?.phone || null,
            city: parsedCandidate.contact?.city || null,
            country: parsedCandidate.contact?.country || null,
            links: parsedCandidate.links || {},
            summary: parsedCandidate.summary || null,
            workAuthorization: parsedCandidate.work_authorization || null,
            availability: parsedCandidate.availability || null,
            salaryExpectation: parsedCandidate.salary_expectation || null,
            notes: parsedCandidate.notes || null,
          })
          .returning();

        const candidateId = newCandidate.id;

        // Create resume record
        await db.insert(resumes).values({
          candidateId,
          filename: parsedResult.source_meta.filename,
          filesizeBytes: parsedResult.source_meta.filesize_bytes,
          parsedOk: parsedResult.source_meta.parsed_ok ? 1 : 0,
          parseNotes: parsedResult.source_meta.parse_notes,
          rawText,
        });

        // Create experiences
        if (parsedCandidate.experience && parsedCandidate.experience.length > 0) {
          for (const exp of parsedCandidate.experience) {
            await db.insert(experiences).values({
              candidateId,
              title: exp.title || null,
              company: exp.company || null,
              industry: exp.industry || null,
              location: exp.location || null,
              startDate: exp.start_date || null,
              endDate: exp.end_date || null,
              isCurrent: exp.is_current ? 1 : 0,
              bullets: exp.bullets || [],
            });
          }
        }

        // Create education
        if (parsedCandidate.education && parsedCandidate.education.length > 0) {
          for (const edu of parsedCandidate.education) {
            await db.insert(education).values({
              candidateId,
              institution: edu.institution || null,
              qualification: edu.qualification || null,
              location: edu.location || null,
              gradDate: edu.grad_date || null,
            });
          }
        }

        // Create certifications
        if (parsedCandidate.certifications && parsedCandidate.certifications.length > 0) {
          for (const cert of parsedCandidate.certifications) {
            await db.insert(certifications).values({
              candidateId,
              name: cert.name || null,
              issuer: cert.issuer || null,
              year: cert.year || null,
            });
          }
        }

        // Create projects
        if (parsedCandidate.projects && parsedCandidate.projects.length > 0) {
          for (const proj of parsedCandidate.projects) {
            await db.insert(projects).values({
              candidateId,
              name: proj.name || null,
              what: proj.what || null,
              impact: proj.impact || null,
              link: proj.link || null,
            });
          }
        }

        // Create awards
        if (parsedCandidate.awards && parsedCandidate.awards.length > 0) {
          for (const award of parsedCandidate.awards) {
            await db.insert(awards).values({
              candidateId,
              name: award.name || null,
              byWhom: award.by || null,
              year: award.year || null,
              note: award.note || null,
            });
          }
        }

        // Create skills
        if (parsedCandidate.skills) {
          const allSkills: Array<{ name: string; kind: string }> = [];

          if (parsedCandidate.skills.technical) {
            allSkills.push(...parsedCandidate.skills.technical.map(s => ({ name: s, kind: 'technical' })));
          }
          if (parsedCandidate.skills.tools) {
            allSkills.push(...parsedCandidate.skills.tools.map(s => ({ name: s, kind: 'tools' })));
          }
          if (parsedCandidate.skills.soft) {
            allSkills.push(...parsedCandidate.skills.soft.map(s => ({ name: s, kind: 'soft' })));
          }

          for (const { name, kind } of allSkills) {
            // Find or create skill
            let [skill] = await db.select()
              .from(skills)
              .where(eq(skills.name, name.trim()));

            if (!skill) {
              [skill] = await db.insert(skills)
                .values({ name: name.trim() })
                .returning();
            }

            // Link to candidate
            await db.insert(candidateSkills)
              .values({
                candidateId,
                skillId: skill.id,
                kind,
              })
              .onConflictDoNothing();
          }
        }

        // Generate embeddings asynchronously (non-blocking)
        const { indexCandidate, isEmbeddingsConfigured } = await import("./embeddings");
        if (isEmbeddingsConfigured()) {
          indexCandidate(candidateId).catch(err => {
            console.error(`[ATS] Failed to generate embedding for candidate ${candidateId}:`, err);
          });
        }

        // Auto-enqueue screening jobs for all active roles
        enqueueScreeningsForCandidate(candidateId).catch(err => {
          console.error(`[Auto-Screen] Failed to enqueue screenings:`, err);
        });

        res.json({
          success: true,
          message: "CV parsed and candidate created successfully",
          candidate: newCandidate,
          parsed: parsedResult,
        });
      } else {
        // Just return parsed data without creating candidate
        res.json({
          success: true,
          message: "CV parsed successfully",
          parsed: parsedResult,
        });
      }
    } catch (error: any) {
      console.error("Resume parse error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to parse resume",
        error: error.message,
      });
    }
  });

  // ============================================================================
  // Integrated Roles & Screenings - Links roles directly to ATS candidates
  // ============================================================================

  // Create a new role
  app.post("/api/roles", requireAuth, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertRoleSchema.parse(req.body);
      
      const [role] = await db.insert(roles)
        .values({
          ...validatedData,
          createdBy: req.user!.id,
        })
        .returning();

      res.json({
        success: true,
        message: "Role created successfully",
        role,
      });
    } catch (error: any) {
      console.error("Create role error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to create role",
        errors: error.errors,
      });
    }
  });

  // List all roles with optional filtering
  app.get("/api/roles", requireAuth, async (req: AuthRequest, res) => {
    try {
      const isActiveFilter = req.query.isActive;
      const createdBy = req.query.createdBy as string;

      let query = db.select().from(roles);
      
      // Build filters
      const filters = [];
      if (isActiveFilter !== undefined) {
        filters.push(eq(roles.isActive, isActiveFilter === 'true' ? 1 : 0));
      }
      if (createdBy) {
        filters.push(eq(roles.createdBy, createdBy));
      }

      const allRoles = filters.length > 0 
        ? await query.where(and(...filters)).orderBy(desc(roles.createdAt))
        : await query.orderBy(desc(roles.createdAt));

      res.json({
        success: true,
        count: allRoles.length,
        roles: allRoles,
      });
    } catch (error) {
      console.error("List roles error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch roles",
      });
    }
  });

  // Get a single role by ID
  app.get("/api/roles/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const roleId = req.params.id;

      const [role] = await db.select()
        .from(roles)
        .where(eq(roles.id, roleId));

      if (!role) {
        return res.status(404).json({
          success: false,
          message: "Role not found",
        });
      }

      res.json({
        success: true,
        role,
      });
    } catch (error) {
      console.error("Get role error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch role",
      });
    }
  });

  // Update a role
  app.patch("/api/roles/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const roleId = req.params.id;
      const updates = req.body;

      // Don't allow updating id, createdBy, or createdAt
      delete updates.id;
      delete updates.createdBy;
      delete updates.createdAt;

      const [updatedRole] = await db.update(roles)
        .set(updates)
        .where(eq(roles.id, roleId))
        .returning();

      if (!updatedRole) {
        return res.status(404).json({
          success: false,
          message: "Role not found",
        });
      }

      res.json({
        success: true,
        message: "Role updated successfully",
        role: updatedRole,
      });
    } catch (error: any) {
      console.error("Update role error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to update role",
        errors: error.errors,
      });
    }
  });

  // Soft delete a role (set isActive = 0)
  app.delete("/api/roles/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const roleId = req.params.id;

      const [deactivatedRole] = await db.update(roles)
        .set({ isActive: 0 })
        .where(eq(roles.id, roleId))
        .returning();

      if (!deactivatedRole) {
        return res.status(404).json({
          success: false,
          message: "Role not found",
        });
      }

      res.json({
        success: true,
        message: "Role deactivated successfully",
        role: deactivatedRole,
      });
    } catch (error) {
      console.error("Delete role error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to deactivate role",
      });
    }
  });

  // Screen ATS candidates against a role
  app.post("/api/roles/:roleId/screen", requireAuth, async (req: AuthRequest, res) => {
    try {
      const roleId = req.params.roleId;
      const { candidateIds } = req.body; // Array of candidate IDs to screen

      if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "candidateIds array is required",
        });
      }

      // Check if AI is configured
      if (!isAIConfigured()) {
        return res.status(503).json({
          success: false,
          message: "AI integration is not configured. Please set up OpenAI integration.",
        });
      }

      // Fetch the role
      const [role] = await db.select()
        .from(roles)
        .where(eq(roles.id, roleId));

      if (!role) {
        return res.status(404).json({
          success: false,
          message: "Role not found",
        });
      }

      const screeningResults = [];

      // Screen each candidate
      for (const candidateId of candidateIds) {
        // Fetch candidate with all related data
        const [candidate] = await db.select()
          .from(candidates)
          .where(eq(candidates.id, candidateId));

        if (!candidate) {
          console.warn(`Candidate ${candidateId} not found, skipping`);
          continue;
        }

        // Get related data
        const candidateExperiences = await db.select()
          .from(experiences)
          .where(eq(experiences.candidateId, candidateId));

        const candidateEducation = await db.select()
          .from(education)
          .where(eq(education.candidateId, candidateId));

        const candidateCertifications = await db.select()
          .from(certifications)
          .where(eq(certifications.candidateId, candidateId));

        const candidateSkillsData = await db.select({
          skillId: candidateSkills.skillId,
          skillName: skills.name,
          kind: candidateSkills.kind,
        })
          .from(candidateSkills)
          .innerJoin(skills, eq(candidateSkills.skillId, skills.id))
          .where(eq(candidateSkills.candidateId, candidateId));

        // Transform to format expected by AI evaluation
        const candidateForEvaluation = {
          full_name: candidate.fullName || '',
          contact: {
            email: candidate.email ?? undefined,
            phone: candidate.phone ?? undefined,
            city: candidate.city ?? undefined,
            country: candidate.country ?? undefined,
          },
          headline: candidate.headline ?? undefined,
          skills: candidateSkillsData.map(s => s.skillName || ''),
          experience: candidateExperiences.map(exp => ({
            title: exp.title || '',
            company: exp.company || '',
            industry: exp.industry ?? undefined,
            location: exp.location ?? undefined,
            start_date: exp.startDate ?? undefined,
            end_date: exp.endDate ?? undefined,
            is_current: exp.isCurrent === 1,
            bullets: exp.bullets || [],
          })),
          education: candidateEducation.map(edu => ({
            institution: edu.institution || '',
            qualification: edu.qualification || '',
            location: edu.location ?? undefined,
            grad_date: edu.gradDate ?? undefined,
          })),
          certifications: candidateCertifications.map(cert => ({
            name: cert.name || '',
            issuer: cert.issuer ?? undefined,
            year: cert.year ?? undefined,
          })),
          projects: [],
          awards: [],
          achievements: [],
          work_authorization: candidate.workAuthorization ?? undefined,
          salary_expectation: candidate.salaryExpectation ?? undefined,
          availability: candidate.availability ?? undefined,
          summary: candidate.summary ?? undefined,
          links: candidate.links || {},
        };

        // Evaluate candidate against role
        const evaluation = await evaluateCandidateWithAI(
          candidateForEvaluation,
          {
            job_title: role.jobTitle,
            job_description: role.jobDescription,
            seniority: role.seniority ?? undefined,
            employment_type: role.employmentType ?? undefined,
            location: {
              city: role.locationCity ?? undefined,
              country: role.locationCountry ?? undefined,
              work_type: role.workType ?? undefined,
            },
            must_have_skills: role.mustHaveSkills,
            nice_to_have_skills: role.niceToHaveSkills,
            salary_range: {
              min: role.salaryMin ?? undefined,
              max: role.salaryMax ?? undefined,
              currency: role.salaryCurrency ?? undefined,
            },
            knockouts: role.knockouts,
            weights: role.weights as any,
          }
        );

        // Store screening result (upsert to handle re-screening)
        const [screening] = await db.insert(screenings)
          .values({
            roleId,
            candidateId,
            scoreTotal: evaluation.score_total,
            scoreBreakdown: evaluation.score_breakdown,
            mustHavesSatisfied: evaluation.must_haves_satisfied,
            missingMustHaves: evaluation.missing_must_haves,
            knockout: evaluation.knockout,
            reasons: evaluation.reasons,
            flags: evaluation.flags,
          })
          .onConflictDoUpdate({
            target: [screenings.roleId, screenings.candidateId],
            set: {
              scoreTotal: evaluation.score_total,
              scoreBreakdown: evaluation.score_breakdown,
              mustHavesSatisfied: evaluation.must_haves_satisfied,
              missingMustHaves: evaluation.missing_must_haves,
              knockout: evaluation.knockout,
              reasons: evaluation.reasons,
              flags: evaluation.flags,
              createdAt: sql`now()`,
            },
          })
          .returning();

        screeningResults.push({
          screening,
          candidate: {
            id: candidate.id,
            fullName: candidate.fullName,
            headline: candidate.headline,
          },
        });
      }

      res.json({
        success: true,
        message: `Screened ${screeningResults.length} candidate(s)`,
        screenings: screeningResults,
      });
    } catch (error: any) {
      console.error("Screen candidates error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to screen candidates",
        error: error.message,
      });
    }
  });

  // Get all screenings for a role (ranked by score)
  app.get("/api/roles/:roleId/screenings", requireAuth, async (req: AuthRequest, res) => {
    try {
      const roleId = req.params.roleId;

      const allScreenings = await db.select({
        screening: screenings,
        candidate: {
          id: candidates.id,
          fullName: candidates.fullName,
          headline: candidates.headline,
          email: candidates.email,
          phone: candidates.phone,
          city: candidates.city,
          country: candidates.country,
        },
      })
        .from(screenings)
        .innerJoin(candidates, eq(screenings.candidateId, candidates.id))
        .where(eq(screenings.roleId, roleId))
        .orderBy(desc(screenings.scoreTotal));

      res.json({
        success: true,
        count: allScreenings.length,
        screenings: allScreenings,
      });
    } catch (error) {
      console.error("Get role screenings error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch screenings",
      });
    }
  });

  // Get all screenings for a candidate
  app.get("/api/candidates/:candidateId/screenings", requireAuth, async (req: AuthRequest, res) => {
    try {
      const candidateId = req.params.candidateId;

      const allScreenings = await db.select({
        screening: screenings,
        role: {
          id: roles.id,
          jobTitle: roles.jobTitle,
          companyId: roles.companyId,
          seniority: roles.seniority,
          employmentType: roles.employmentType,
          locationCity: roles.locationCity,
          locationCountry: roles.locationCountry,
        },
      })
        .from(screenings)
        .innerJoin(roles, eq(screenings.roleId, roles.id))
        .where(eq(screenings.candidateId, candidateId))
        .orderBy(desc(screenings.createdAt));

      res.json({
        success: true,
        count: allScreenings.length,
        screenings: allScreenings,
      });
    } catch (error) {
      console.error("Get candidate screenings error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch screenings",
      });
    }
  });

  // Delete a screening result
  app.delete("/api/screenings/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const screeningId = req.params.id;

      const deletedScreening = await db.delete(screenings)
        .where(eq(screenings.id, screeningId))
        .returning();

      if (!deletedScreening.length) {
        return res.status(404).json({
          success: false,
          message: "Screening not found",
        });
      }

      res.json({
        success: true,
        message: "Screening deleted successfully",
      });
    } catch (error) {
      console.error("Delete screening error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete screening",
      });
    }
  });

  // Mount shortlist routes
  app.use("/api", shortlistRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
