import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubscriberSchema, insertJobSchema, insertCVSchema, insertMagicTokenSchema, insertCandidateProfileSchema, insertOrganizationSchema, insertRecruiterProfileSchema, insertScreeningJobSchema, insertScreeningCandidateSchema, insertScreeningEvaluationSchema, type User } from "@shared/schema";
import { db } from "./db";
import { users, magicTokens, candidateProfiles, organizations, recruiterProfiles, memberships, screeningJobs, screeningCandidates, screeningEvaluations } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { randomBytes } from "crypto";
import { sendMagicLinkEmail } from "./resend";
import { requireAuth, requireRole, optionalAuth, generateToken, type AuthRequest } from "./auth";
import { z } from "zod";
import { parseCVWithAI, evaluateCandidateWithAI, isAIConfigured } from "./ai-screening";

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

  const httpServer = createServer(app);

  return httpServer;
}
