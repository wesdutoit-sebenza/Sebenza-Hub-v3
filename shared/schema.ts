import { pgTable, text, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Users table - single source of truth for all accounts
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  roles: text("roles").array().notNull().default(sql`'{}'::text[]`), // 'individual', 'business', 'recruiter'
  onboardingComplete: jsonb("onboarding_complete").notNull().default(sql`'{}'::jsonb`), // { individual: true, business: false }
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Magic link tokens for passwordless auth
export const magicTokens = pgTable("magic_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  token: text("token").notNull().unique(),
  email: text("email").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMagicTokenSchema = createInsertSchema(magicTokens).omit({
  id: true,
  createdAt: true,
});

export type InsertMagicToken = z.infer<typeof insertMagicTokenSchema>;
export type MagicToken = typeof magicTokens.$inferSelect;

// Organizations - for businesses and recruiting agencies
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'employer' or 'agency'
  website: text("website"),
  province: text("province"),
  city: text("city"),
  industry: text("industry"),
  size: text("size"), // '1-10', '11-50', '51-200', '201-500', '500+'
  logoUrl: text("logo_url"),
  isVerified: integer("is_verified").notNull().default(0), // 0 = pending, 1 = verified
  plan: text("plan").notNull().default('free'), // 'free' or 'pro'
  jobPostLimit: integer("job_post_limit").notNull().default(3),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
});

export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;

// Memberships - links users to organizations with roles
export const memberships = pgTable("memberships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  organizationId: varchar("organization_id").notNull(),
  role: text("role").notNull(), // 'owner', 'admin', 'poster', 'viewer'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMembershipSchema = createInsertSchema(memberships).omit({
  id: true,
  createdAt: true,
});

export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type Membership = typeof memberships.$inferSelect;

// Candidate profiles for job seekers
export const candidateProfiles = pgTable("candidate_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  province: text("province").notNull(),
  city: text("city").notNull(),
  jobTitle: text("job_title").notNull(),
  experienceLevel: text("experience_level").notNull(), // 'entry', 'intermediate', 'senior', 'executive'
  skills: text("skills").array().notNull().default(sql`'{}'::text[]`),
  cvUrl: text("cv_url"),
  isPublic: integer("is_public").notNull().default(1), // 0 = private, 1 = public
  popiaConsentGiven: integer("popia_consent_given").notNull(), // 0 = no, 1 = yes
  popiaConsentDate: timestamp("popia_consent_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCandidateProfileSchema = createInsertSchema(candidateProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  popiaConsentDate: true,
});

export type InsertCandidateProfile = z.infer<typeof insertCandidateProfileSchema>;
export type CandidateProfile = typeof candidateProfiles.$inferSelect;

// Recruiter profiles for agencies
export const recruiterProfiles = pgTable("recruiter_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  sectors: text("sectors").array().notNull().default(sql`'{}'::text[]`),
  proofUrl: text("proof_url"), // LinkedIn or company page
  verificationStatus: text("verification_status").notNull().default('pending'), // 'pending', 'approved', 'rejected'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertRecruiterProfileSchema = createInsertSchema(recruiterProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRecruiterProfile = z.infer<typeof insertRecruiterProfileSchema>;
export type RecruiterProfile = typeof recruiterProfiles.$inferSelect;

export const subscribers = pgTable("subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSubscriberSchema = createInsertSchema(subscribers).pick({
  email: true,
});

export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id"), // null for jobs posted before auth was added
  postedByUserId: varchar("posted_by_user_id"), // null for jobs posted before auth was added
  title: text("title").notNull(),
  company: text("company").notNull(), // kept for backwards compatibility
  location: text("location").notNull(),
  salaryMin: integer("salary_min").notNull(),
  salaryMax: integer("salary_max").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  whatsappContact: text("whatsapp_contact").notNull(),
  employmentType: text("employment_type").notNull(),
  industry: text("industry").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
}).refine(
  (data) => data.salaryMin <= data.salaryMax,
  {
    message: "Minimum salary must be less than or equal to maximum salary",
    path: ["salaryMax"],
  }
);

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

// CV Schema with Zod types for validation
export const cvPersonalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  physicalAddress: z.string().optional(),
  contactPhone: z.string().min(1, "Contact phone is required"),
  contactEmail: z.string().email("Valid email is required"),
  legalName: z.string().optional(),
  age: z.number().optional(),
  gender: z.string().optional(),
  driversLicense: z.string().optional(),
});

export const cvReferenceSchema = z.object({
  name: z.string().min(1, "Reference name is required"),
  title: z.string().min(1, "Reference title is required"),
  phone: z.string().min(1, "Reference phone is required"),
  email: z.string().optional(),
});

export const cvWorkExperienceSchema = z.object({
  period: z.string().min(1, "Period is required"),
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  type: z.string().min(1, "Employment type is required"),
  industry: z.string().min(1, "Industry is required"),
  clientele: z.string().optional(),
  responsibilities: z.array(z.object({
    title: z.string().optional(),
    items: z.array(z.string().min(1, "Responsibility item cannot be empty")).min(1, "At least one responsibility is required"),
  })),
  references: z.array(cvReferenceSchema).optional(),
});

export const cvSkillsSchema = z.object({
  softSkills: z.array(z.object({
    category: z.string().min(1, "Category is required"),
    items: z.array(z.string().min(1, "Skill item cannot be empty")).min(1, "At least one skill item is required"),
  })).optional(),
  technicalSkills: z.array(z.object({
    category: z.string().min(1, "Category is required"),
    items: z.array(z.string().min(1, "Skill item cannot be empty")).min(1, "At least one skill item is required"),
  })).optional(),
  languages: z.array(z.string()).optional(),
});

export const cvEducationSchema = z.object({
  level: z.string().min(1, "Education level is required"),
  institution: z.string().min(1, "Institution is required"),
  period: z.string().min(1, "Period is required"),
  location: z.string().min(1, "Location is required"),
  details: z.string().optional(),
});

export const cvs = pgTable("cvs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  personalInfo: jsonb("personal_info").notNull(),
  workExperience: jsonb("work_experience").notNull(),
  skills: jsonb("skills").notNull(),
  education: jsonb("education").notNull(),
  references: jsonb("references"),
  aboutMe: text("about_me"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCVSchema = z.object({
  userId: z.string().optional(),
  personalInfo: cvPersonalInfoSchema,
  workExperience: z.array(cvWorkExperienceSchema),
  skills: cvSkillsSchema,
  education: z.array(cvEducationSchema),
  references: z.array(cvReferenceSchema).optional(),
  aboutMe: z.string().optional(),
});

export type InsertCV = z.infer<typeof insertCVSchema>;
export type CV = typeof cvs.$inferSelect;
export type CVPersonalInfo = z.infer<typeof cvPersonalInfoSchema>;
export type CVWorkExperience = z.infer<typeof cvWorkExperienceSchema>;
export type CVSkills = z.infer<typeof cvSkillsSchema>;
export type CVEducation = z.infer<typeof cvEducationSchema>;
export type CVReference = z.infer<typeof cvReferenceSchema>;

// CV Screening tables for AI-powered candidate evaluation
export const screeningJobs = pgTable("screening_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  organizationId: varchar("organization_id"),
  jobTitle: text("job_title").notNull(),
  jobDescription: text("job_description").notNull(),
  seniority: text("seniority"), // 'junior', 'mid', 'senior', 'lead'
  employmentType: text("employment_type"), // 'permanent', 'contract'
  location: jsonb("location"), // { city, country, work_type: 'remote|hybrid|on-site' }
  mustHaveSkills: text("must_have_skills").array().notNull().default(sql`'{}'::text[]`),
  niceToHaveSkills: text("nice_to_have_skills").array().notNull().default(sql`'{}'::text[]`),
  salaryRange: jsonb("salary_range"), // { min, max, currency }
  knockouts: text("knockouts").array().notNull().default(sql`'{}'::text[]`),
  weights: jsonb("weights").notNull(), // scoring weights
  status: text("status").notNull().default('draft'), // 'draft', 'processing', 'completed', 'failed'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertScreeningJobSchema = createInsertSchema(screeningJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertScreeningJob = z.infer<typeof insertScreeningJobSchema>;
export type ScreeningJob = typeof screeningJobs.$inferSelect;

export const screeningCandidates = pgTable("screening_candidates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  screeningJobId: varchar("screening_job_id").notNull(),
  fullName: text("full_name").notNull(),
  contact: jsonb("contact"), // { email, phone, city, country }
  headline: text("headline"),
  skills: text("skills").array().notNull().default(sql`'{}'::text[]`),
  experience: jsonb("experience"), // array of { title, company, industry, location, dates, bullets }
  education: jsonb("education"), // array of { institution, qualification, grad_date }
  certifications: jsonb("certifications"), // array of { name, issuer, year }
  achievements: jsonb("achievements"), // array of { metric, value, note }
  links: jsonb("links"), // { linkedin, portfolio, github }
  workAuthorization: text("work_authorization"),
  salaryExpectation: text("salary_expectation"),
  availability: text("availability"),
  rawCvText: text("raw_cv_text"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertScreeningCandidateSchema = createInsertSchema(screeningCandidates).omit({
  id: true,
  createdAt: true,
});

export type InsertScreeningCandidate = z.infer<typeof insertScreeningCandidateSchema>;
export type ScreeningCandidate = typeof screeningCandidates.$inferSelect;

export const screeningEvaluations = pgTable("screening_evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  screeningJobId: varchar("screening_job_id").notNull(),
  candidateId: varchar("candidate_id").notNull(),
  scoreTotal: integer("score_total").notNull(),
  scoreBreakdown: jsonb("score_breakdown").notNull(), // { skills, experience, achievements, education, location_auth, salary_availability }
  mustHavesSatisfied: text("must_haves_satisfied").array().notNull().default(sql`'{}'::text[]`),
  missingMustHaves: text("missing_must_haves").array().notNull().default(sql`'{}'::text[]`),
  knockout: jsonb("knockout"), // { is_ko: boolean, reasons: [] }
  reasons: text("reasons").array().notNull().default(sql`'{}'::text[]`), // reasoning bullets
  flags: jsonb("flags"), // { red: [], yellow: [] }
  rank: integer("rank"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertScreeningEvaluationSchema = createInsertSchema(screeningEvaluations).omit({
  id: true,
  createdAt: true,
});

export type InsertScreeningEvaluation = z.infer<typeof insertScreeningEvaluationSchema>;
export type ScreeningEvaluation = typeof screeningEvaluations.$inferSelect;

// ============================================================================
// ATS (Applicant Tracking System) Tables - Standalone Candidate Database
// ============================================================================

// New integrated roles table - jobs/roles that reference ATS candidates directly
export const roles = pgTable("roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id"), // optional company association
  jobTitle: text("job_title").notNull(),
  jobDescription: text("job_description").notNull(),
  seniority: text("seniority"), // 'junior', 'mid', 'senior', 'lead'
  employmentType: text("employment_type"), // 'permanent', 'contract', etc.
  locationCity: text("location_city"),
  locationCountry: text("location_country").default('South Africa'),
  workType: text("work_type"), // 'remote', 'hybrid', 'on-site'
  mustHaveSkills: text("must_have_skills").array().notNull().default(sql`'{}'::text[]`),
  niceToHaveSkills: text("nice_to_have_skills").array().notNull().default(sql`'{}'::text[]`),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  salaryCurrency: text("salary_currency").default('ZAR'),
  knockouts: text("knockouts").array().notNull().default(sql`'{}'::text[]`),
  weights: jsonb("weights").default(sql`'{"skills":35,"experience":25,"achievements":15,"education":10,"location_auth":10,"salary_availability":5}'::jsonb`),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isActive: integer("is_active").notNull().default(1), // 0 = inactive, 1 = active
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
});

export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

// Screenings - evaluation results linking roles to ATS candidates
export const screenings = pgTable("screenings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roleId: varchar("role_id").notNull(),
  candidateId: varchar("candidate_id").notNull(),
  scoreTotal: integer("score_total"),
  scoreBreakdown: jsonb("score_breakdown"), // { skills, experience, achievements, education, location_auth, salary_availability }
  mustHavesSatisfied: text("must_haves_satisfied").array().notNull().default(sql`'{}'::text[]`),
  missingMustHaves: text("missing_must_haves").array().notNull().default(sql`'{}'::text[]`),
  knockout: jsonb("knockout"), // { is_ko: boolean, reasons: [] }
  reasons: text("reasons").array().notNull().default(sql`'{}'::text[]`), // 3-6 brief reasoning bullets
  flags: jsonb("flags"), // { red: [], yellow: [] }
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertScreeningSchema = createInsertSchema(screenings).omit({
  id: true,
  createdAt: true,
});

export type InsertScreening = z.infer<typeof insertScreeningSchema>;
export type Screening = typeof screenings.$inferSelect;

// Core candidate table
export const candidates = pgTable("candidates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name"),
  headline: text("headline"),
  email: text("email"),
  phone: text("phone"),
  city: text("city"),
  country: text("country"),
  links: jsonb("links").default(sql`'{}'::jsonb`), // { linkedin, github, portfolio, etc. }
  summary: text("summary"),
  workAuthorization: text("work_authorization"),
  availability: text("availability"),
  salaryExpectation: text("salary_expectation"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  createdAt: true,
});

export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidates.$inferSelect;

// Resumes - file uploads linked to candidates
export const resumes = pgTable("resumes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  candidateId: varchar("candidate_id").notNull(),
  filename: text("filename"),
  filesizeBytes: integer("filesize_bytes"),
  parsedOk: integer("parsed_ok").notNull().default(1), // 0 = failed, 1 = success
  parseNotes: text("parse_notes"),
  rawText: text("raw_text"), // extracted text from resume
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  createdAt: true,
});

export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumes.$inferSelect;

// Work experience entries
export const experiences = pgTable("experiences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  candidateId: varchar("candidate_id").notNull(),
  title: text("title"),
  company: text("company"),
  industry: text("industry"),
  location: text("location"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  isCurrent: integer("is_current").notNull().default(0), // 0 = false, 1 = true
  bullets: text("bullets").array().notNull().default(sql`'{}'::text[]`),
});

export const insertExperienceSchema = createInsertSchema(experiences).omit({
  id: true,
});

export type InsertExperience = z.infer<typeof insertExperienceSchema>;
export type Experience = typeof experiences.$inferSelect;

// Education entries
export const education = pgTable("education", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  candidateId: varchar("candidate_id").notNull(),
  institution: text("institution"),
  qualification: text("qualification"),
  location: text("location"),
  gradDate: text("grad_date"),
});

export const insertEducationSchema = createInsertSchema(education).omit({
  id: true,
});

export type InsertEducation = z.infer<typeof insertEducationSchema>;
export type Education = typeof education.$inferSelect;

// Certifications
export const certifications = pgTable("certifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  candidateId: varchar("candidate_id").notNull(),
  name: text("name"),
  issuer: text("issuer"),
  year: text("year"),
});

export const insertCertificationSchema = createInsertSchema(certifications).omit({
  id: true,
});

export type InsertCertification = z.infer<typeof insertCertificationSchema>;
export type Certification = typeof certifications.$inferSelect;

// Projects
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  candidateId: varchar("candidate_id").notNull(),
  name: text("name"),
  what: text("what"), // description
  impact: text("impact"),
  link: text("link"),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Awards
export const awards = pgTable("awards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  candidateId: varchar("candidate_id").notNull(),
  name: text("name"),
  byWhom: text("by_whom"),
  year: text("year"),
  note: text("note"),
});

export const insertAwardSchema = createInsertSchema(awards).omit({
  id: true,
});

export type InsertAward = z.infer<typeof insertAwardSchema>;
export type Award = typeof awards.$inferSelect;

// Skills - normalized table
export const skills = pgTable("skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
});

export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;

// Candidate skills - many-to-many relationship
export const candidateSkills = pgTable("candidate_skills", {
  candidateId: varchar("candidate_id").notNull(),
  skillId: varchar("skill_id").notNull(),
  kind: text("kind").notNull(), // 'technical', 'tools', 'soft'
});

export const insertCandidateSkillSchema = createInsertSchema(candidateSkills);

export type InsertCandidateSkill = z.infer<typeof insertCandidateSkillSchema>;
export type CandidateSkill = typeof candidateSkills.$inferSelect;

// Candidate embeddings for semantic search
// Note: pgvector extension must be enabled in the database
export const candidateEmbeddings = pgTable("candidate_embeddings", {
  candidateId: varchar("candidate_id").primaryKey().notNull(),
  embedding: text("embedding").notNull(), // Store as JSON array for compatibility
});

export const insertCandidateEmbeddingSchema = createInsertSchema(candidateEmbeddings);

export type InsertCandidateEmbedding = z.infer<typeof insertCandidateEmbeddingSchema>;
export type CandidateEmbedding = typeof candidateEmbeddings.$inferSelect;
