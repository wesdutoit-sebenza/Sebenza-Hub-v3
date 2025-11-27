import { z } from "zod";

// ==================== CV VALIDATION SCHEMAS ====================

export const cvPersonalInfoSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  physicalAddress: z.string().optional(),
  contactPhone: z.string().min(1, "Contact phone is required"),
  contactEmail: z.string().email("Valid email is required"),
  legalName: z.string().optional(),
  age: z.number().optional(),
  gender: z.string().optional(),
  driversLicense: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default("South Africa"),
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

export const cvSkillsSchema = z.array(z.string()).max(10, "Maximum 10 skills allowed");

export const cvEducationSchema = z.object({
  level: z.string().min(1, "Education level is required"),
  institution: z.string().min(1, "Institution is required"),
  period: z.string().min(1, "Period is required"),
  location: z.string().min(1, "Location is required"),
  details: z.string().optional(),
});

// ==================== JOB VALIDATION SCHEMAS ====================

export const jobLocationSchema = z.object({
  country: z.string().default("South Africa"),
  province: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  suburb: z.string().optional(),
  postalCode: z.string().optional(),
  multiLocation: z.boolean().default(false),
});

export const jobCompensationSchema = z.object({
  displayRange: z.boolean().default(true),
  currency: z.string().default("ZAR"),
  payType: z.enum(["Annual", "Monthly", "Hourly", "Day Rate"]).default("Annual"),
  min: z.number().nonnegative().optional(),
  max: z.number().nonnegative().optional(),
  commissionAvailable: z.boolean().default(false),
  performanceBonus: z.boolean().default(false),
  medicalAidContribution: z.boolean().default(false),
  pensionContribution: z.boolean().default(false),
}).refine(
  (val) => {
    if (val.min == null && val.max == null) return true;
    return typeof val.min === "number" && typeof val.max === "number" && val.min < val.max;
  },
  { message: "Salary range must have both min and max, and min < max" }
);

export const skillWithDetailsSchema = z.object({
  skill: z.string().min(1, "Skill name is required"),
  level: z.enum(["Basic", "Intermediate", "Expert"]).default("Intermediate"),
  priority: z.enum(["Must-Have", "Nice-to-Have"]).default("Must-Have"),
});

export const languageWithProficiencySchema = z.object({
  language: z.string().min(1, "Language is required"),
  proficiency: z.enum(["Basic", "Intermediate", "Expert"]).default("Intermediate"),
});

export const jobCoreSchema = z.object({
  seniority: z.enum(["Intern", "Junior", "Mid", "Senior", "Lead", "Manager", "Director", "Executive"]),
  department: z.string().min(2, "Required"),
  workArrangement: z.enum(["On-site", "Hybrid", "Remote"]),
  hybridPercentOnsite: z.number().min(0).max(100).optional(),
  remoteEligibility: z.enum(["South Africa", "Africa", "Global"]).optional(),
  location: jobLocationSchema,
  visaRequired: z.boolean().default(false),
  visaNote: z.string().optional(),
  summary: z.string().min(20, "Give a short 2–4 line summary"),
  responsibilities: z.array(z.string().min(2)).min(5, "Add at least 5 responsibilities"),
  requiredSkills: z.array(skillWithDetailsSchema).min(5, "Add at least 5 required skills"),
  qualifications: z.array(z.string().min(2)).min(1, "Add at least 1 qualification"),
  experience: z.array(z.string().min(2)).min(1, "Add at least 1 experience requirement"),
  driversLicenseRequired: z.enum(["Yes", "No"]).optional(),
  licenseCode: z.string().optional(),
  languagesRequired: z.array(languageWithProficiencySchema).optional(),
});

export const jobApplicationSchema = z.object({
  method: z.enum(["in-app", "external"]).default("in-app"),
  externalUrl: z.string().url().optional(),
  closingDate: z.string().min(1),
  whatsappNumber: z.string().optional(),
  competencyTestRequired: z.enum(["Yes", "No"]).optional(),
  competencyTestReference: z.string().optional(),
});

export const jobCompanyDetailsSchema = z.object({
  name: z.string().min(2),
  industry: z.string().optional(),
  recruitingAgency: z.string().optional(),
  website: z.string().url().optional(),
  logoUrl: z.string()
    .refine((val) => {
      if (!val || val.length === 0) return true;
      try {
        const url = new URL(val);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          return true;
        }
        return false;
      } catch {
        return /^\/uploads\/company-logos\/.+\.(png|jpg|jpeg|webp|gif)$/i.test(val);
      }
    }, { message: "Invalid url" })
    .optional(),
  description: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  companySize: z.enum(["1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5000+"]).optional(),
  eeAa: z.boolean().default(false),
  contactEmail: z.string().email(),
});

export const jobContractSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  renewalPossible: z.boolean().optional(),
  noticePeriod: z.string().optional(),
});

export const jobBenefitsSchema = z.object({
  benefits: z.array(z.string()).optional(),
  reportingLine: z.string().optional(),
  teamSize: z.number().optional(),
  equipment: z.array(z.string()).optional(),
});

export const jobVettingSchema = z.object({
  criminal: z.boolean().default(false),
  credit: z.boolean().default(false),
  qualification: z.boolean().default(false),
  references: z.boolean().default(false),
});

export const jobComplianceSchema = z.object({
  rightToWork: z.enum(["Citizen/PR", "Work Permit", "Not eligible"]).default("Citizen/PR"),
  popiaConsent: z.boolean(),
  checksConsent: z.boolean(),
});

export const jobRoleDetailsSchema = z.object({
  problemStatement: z.string().optional(),
  successMetrics: z.array(z.string()).optional(),
  toolsTech: z.array(z.string()).optional(),
  niceToHave: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  driversLicense: z.boolean().optional(),
  travel: z.enum(["None", "<10%", "10–25%", "25–50%", ">50%"]).optional(),
  shiftPattern: z.enum(["Standard", "Shift", "Rotational", "Night"]).optional(),
  coreHours: z.string().optional(),
  weekendWork: z.boolean().optional(),
  onCall: z.boolean().optional(),
});

export const jobAttachmentsSchema = z.object({
  required: z.array(z.enum(["CV", "Cover Letter", "Certificates", "ID", "Work Permit", "Portfolio"])).optional(),
  optional: z.array(z.enum(["References", "Transcripts"])).optional(),
});

export const jobAccessibilitySchema = z.object({
  accommodationContact: z.string().email().optional(),
  physicalRequirements: z.string().optional(),
  workplaceAccessibility: z.string().optional(),
});

export const jobBrandingSchema = z.object({
  logoUrl: z.string().url().optional(),
  heroUrl: z.string().url().optional(),
  aboutShort: z.string().optional(),
  careersUrl: z.string().url().optional(),
  social: z.array(z.string().url()).optional(),
});

export const jobAdminSchema = z.object({
  jobId: z.string().min(1).optional(),
  pipeline: z.array(z.string()).default(["Applied", "Screen", "Interview 1", "Interview 2", "Offer", "Hired"]),
  owner: z.string().min(1),
  backupOwner: z.string().optional(),
  visibility: z.enum(["Public", "Invite-only", "Internal"]).default("Public"),
  status: z.enum(["Draft", "Live", "Paused", "Closed", "Filled"]).default("Draft"),
  targetStartDate: z.string().optional(),
  closingDate: z.string().optional(),
  externalJobBoards: z.object({
    linkedin: z.boolean().default(false),
    pnet: z.boolean().default(false),
    careerJunction: z.boolean().default(false),
    jobMail: z.boolean().default(false),
  }).optional(),
});

export const jobSeoSchema = z.object({
  keywords: z.array(z.string()).max(25).optional(),
  urgent: z.boolean().default(false),
  slug: z.string().optional(),
  titleTag: z.string().max(70).optional(),
  metaDescription: z.string().max(200).optional(),
  ogTitle: z.string().max(80).optional(),
  ogDescription: z.string().max(220).optional(),
  twitterTitle: z.string().max(80).optional(),
  twitterDescription: z.string().max(220).optional(),
  imageAlt: z.string().max(140).optional(),
  hashtags: z.array(z.string()).optional(),
  internalLinks: z.array(z.object({
    label: z.string(),
    href: z.string(),
  })).optional(),
  faq: z.array(z.object({
    q: z.string(),
    a: z.string(),
  })).optional(),
  jsonld: z.string().optional(),
  version: z.number().default(1),
});

export const insertJobSchema = z.object({
  organizationId: z.string().optional(),
  postedByUserId: z.string().optional(),
  
  title: z.string().min(3).max(80),
  jobIndustry: z.string().optional(),
  core: jobCoreSchema,
  compensation: jobCompensationSchema,
  application: jobApplicationSchema,
  
  company: z.string().min(2).optional(),
  companyDetails: jobCompanyDetailsSchema,
  
  roleDetails: jobRoleDetailsSchema.optional(),
  contract: jobContractSchema.optional(),
  benefits: jobBenefitsSchema.optional(),
  vetting: jobVettingSchema,
  compliance: jobComplianceSchema,
  attachments: jobAttachmentsSchema.optional(),
  accessibility: jobAccessibilitySchema.optional(),
  branding: jobBrandingSchema.optional(),
  admin: jobAdminSchema,
  seo: jobSeoSchema.optional(),
  
  location: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  whatsappContact: z.string().optional(),
  employmentType: z.string().optional(),
  industry: z.string().optional(),
}).superRefine((val, ctx) => {
  const today = new Date().toISOString().split("T")[0];
  if (val.application?.closingDate && val.application.closingDate < today) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Closing date must be today or later",
      path: ["application", "closingDate"],
    });
  }

  if (val.core?.workArrangement === "Hybrid") {
    if (!val.core?.location?.province || !val.core?.location?.city || typeof val.core?.hybridPercentOnsite !== "number") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "For Hybrid, province, city and % on-site are required",
        path: ["core", "workArrangement"],
      });
    }
  } else if (val.core?.workArrangement === "On-site") {
    if (!val.core?.location?.province || !val.core?.location?.city) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "For On-site, province and city are required",
        path: ["core", "location"],
      });
    }
  }

  if (val.application?.method === "external" && !val.application?.externalUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "External application selected — provide a valid URL",
      path: ["application", "externalUrl"],
    });
  }

  if (!val.compliance?.popiaConsent || !val.compliance?.checksConsent) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "POPIA & consent boxes must be ticked before publish",
      path: ["compliance", "popiaConsent"],
    });
  }
});

// ==================== ROLE VALIDATION SCHEMAS ====================

export const insertRoleSchema = z.object({
  companyId: z.string().optional(),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(1, "Job description is required"),
  seniority: z.string().optional(),
  employmentType: z.string().optional(),
  locationCity: z.string().optional(),
  locationCountry: z.string().default('South Africa'),
  workType: z.string().optional(),
  mustHaveSkills: z.array(z.string()).default([]),
  niceToHaveSkills: z.array(z.string()).default([]),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryCurrency: z.string().default('ZAR'),
  knockouts: z.array(z.string()).default([]),
  weights: z.object({
    skills: z.number(),
    experience: z.number(),
    achievements: z.number(),
    education: z.number(),
    location_auth: z.number(),
    salary_availability: z.number(),
  }).default({
    skills: 35,
    experience: 25,
    achievements: 15,
    education: 10,
    location_auth: 10,
    salary_availability: 5,
  }),
  createdBy: z.string().optional(),
  isActive: z.number().default(1),
});
