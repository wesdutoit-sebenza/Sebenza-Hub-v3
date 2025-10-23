import { Worker, Job } from "bullmq";
import { connection, isQueueAvailable } from "./queue";
import { db } from "./db";
import { roles, candidates, screenings, experiences, education, certifications, skills, candidateSkills } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { evaluateCandidateWithAI, isAIConfigured } from "./ai-screening";

// Job data types
interface ScreenJobData {
  roleId: string;
  candidateId: string;
}

// Worker only starts if Redis is available
if (!isQueueAvailable() || !connection) {
  console.log("[Worker] Queue not available, worker not started");
  process.exit(0);
}

console.log("[Worker] Starting screening worker...");

const worker = new Worker(
  "screening",
  async (job: Job<ScreenJobData>) => {
    const { roleId, candidateId } = job.data;
    
    console.log(`[Worker] Processing screening job: Role ${roleId} x Candidate ${candidateId}`);
    
    try {
      // Check if AI is configured
      if (!isAIConfigured()) {
        console.warn(`[Worker] AI not configured, skipping screening`);
        return { skipped: true, reason: "ai_not_configured" };
      }

      // Fetch role details
      const [role] = await db
        .select()
        .from(roles)
        .where(eq(roles.id, roleId))
        .limit(1);
      
      if (!role) {
        throw new Error(`Role ${roleId} not found`);
      }
      
      if (!role.isActive) {
        console.log(`[Worker] Role ${roleId} is no longer active, skipping screening`);
        return { skipped: true, reason: "role_inactive" };
      }
      
      // Fetch candidate details
      const [candidate] = await db
        .select()
        .from(candidates)
        .where(eq(candidates.id, candidateId))
        .limit(1);
      
      if (!candidate) {
        throw new Error(`Candidate ${candidateId} not found`);
      }
      
      // Check if screening already exists (avoid duplicates)
      const existingScreening = await db
        .select()
        .from(screenings)
        .where(
          and(
            eq(screenings.roleId, roleId),
            eq(screenings.candidateId, candidateId)
          )
        )
        .limit(1);
      
      if (existingScreening.length > 0) {
        console.log(`[Worker] Screening already exists for Role ${roleId} x Candidate ${candidateId}, updating...`);
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
        summary: candidate.summary ?? undefined,
        links: candidate.links || {},
        work_authorization: candidate.workAuthorization ?? undefined,
        availability: candidate.availability ?? undefined,
        salary_expectation: candidate.salaryExpectation ?? undefined,
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
      };

      // Get AI evaluation
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
      
      // Upsert screening result
      await db
        .insert(screenings)
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
        });
      
      console.log(`[Worker] Successfully screened candidate ${candidateId} for role ${roleId} (score: ${evaluation.score_total})`);
      
      return {
        success: true,
        roleId,
        candidateId,
        totalScore: evaluation.score_total,
      };
    } catch (error: any) {
      console.error(`[Worker] Failed to screen candidate ${candidateId} for role ${roleId}:`, error);
      throw error; // Re-throw to mark job as failed
    }
  },
  {
    connection,
    concurrency: 5, // Process up to 5 jobs concurrently
  }
);

// Worker event handlers
worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("[Worker] Worker error:", err);
});

console.log("[Worker] Screening worker started successfully");

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[Worker] SIGTERM received, shutting down gracefully...");
  await worker.close();
  await connection?.quit();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[Worker] SIGINT received, shutting down gracefully...");
  await worker.close();
  await connection?.quit();
  process.exit(0);
});
