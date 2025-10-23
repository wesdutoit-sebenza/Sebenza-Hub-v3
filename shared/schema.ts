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
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCandidateProfileSchema = createInsertSchema(candidateProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
