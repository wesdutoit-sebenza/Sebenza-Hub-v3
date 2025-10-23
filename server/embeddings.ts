import OpenAI from "openai";
import { db } from "./db";
import { 
  resumes, 
  candidates, 
  experiences,
  education,
  projects,
  skills,
  candidateSkills,
  candidateEmbeddings 
} from "@shared/schema";
import { eq } from "drizzle-orm";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

/**
 * Generate and store embedding for a candidate using OpenAI's embedding model
 * @param candidateId - UUID of the candidate to index
 * @returns Promise<boolean> - Returns true if successful, false otherwise
 */
export async function indexCandidate(candidateId: string): Promise<boolean> {
  try {
    console.log(`[Embeddings] Generating embedding for candidate: ${candidateId}`);

    // Fetch candidate data
    const candidateData = await db.query.candidates.findFirst({
      where: eq(candidates.id, candidateId),
    });

    if (!candidateData) {
      console.error(`[Embeddings] Candidate not found: ${candidateId}`);
      return false;
    }

    // Fetch related experiences
    const experiencesData = await db.query.experiences.findMany({
      where: eq(experiences.candidateId, candidateId),
    });

    // Fetch related skills
    const candidateSkillsData = await db.query.candidateSkills.findMany({
      where: eq(candidateSkills.candidateId, candidateId),
      with: {
        skill: true,
      },
    });

    // Fetch education
    const educationData = await db.query.education.findMany({
      where: eq(education.candidateId, candidateId),
    });

    // Fetch projects
    const projectsData = await db.query.projects.findMany({
      where: eq(projects.candidateId, candidateId),
    });

    // Build text representation of candidate for embedding
    const textParts: string[] = [];

    // Add headline/title
    if (candidateData.headline) {
      textParts.push(candidateData.headline);
    }

    // Add summary
    if (candidateData.summary) {
      textParts.push(candidateData.summary);
    }

    // Add location context
    const locationParts = [];
    if (candidateData.city) locationParts.push(candidateData.city);
    if (candidateData.country) locationParts.push(candidateData.country);
    if (locationParts.length > 0) {
      textParts.push(`Location: ${locationParts.join(", ")}`);
    }

    // Add skills
    const skillsList = candidateSkillsData
      .map((cs: any) => cs.skill?.name)
      .filter(Boolean)
      .join(", ");
    
    if (skillsList) {
      textParts.push(`Skills: ${skillsList}`);
    }

    // Add experience roles
    const experiencesList = experiencesData
      .map((exp) => {
        const parts = [exp.title];
        if (exp.company) parts.push(`at ${exp.company}`);
        // Add bullet points if available
        if (exp.bullets && exp.bullets.length > 0) {
          parts.push(exp.bullets.join(" "));
        }
        return parts.join(" ");
      })
      .filter(Boolean)
      .join("; ");

    if (experiencesList) {
      textParts.push(`Experience: ${experiencesList}`);
    }

    // Add education
    const educationList = educationData
      .map((edu) => {
        const parts = [];
        if (edu.qualification) parts.push(edu.qualification);
        if (edu.institution) parts.push(`from ${edu.institution}`);
        if (edu.location) parts.push(`in ${edu.location}`);
        return parts.join(" ");
      })
      .filter(Boolean)
      .join("; ");

    if (educationList) {
      textParts.push(`Education: ${educationList}`);
    }

    // Add projects
    const projectsList = projectsData
      .map((proj) => {
        const parts = [];
        if (proj.name) parts.push(proj.name);
        if (proj.what) parts.push(proj.what);
        if (proj.impact) parts.push(proj.impact);
        return parts.join(" - ");
      })
      .filter(Boolean)
      .join("; ");

    if (projectsList) {
      textParts.push(`Projects: ${projectsList}`);
    }

    // Combine all text
    const text = textParts.join("\n");

    if (!text.trim()) {
      console.warn(`[Embeddings] No text content for candidate ${candidateId}, skipping embedding`);
      return false;
    }

    console.log(`[Embeddings] Generating embedding for ${text.length} characters of text`);

    // Generate embedding using OpenAI
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text
    });

    const embedding = embeddingResponse.data[0].embedding;

    // Store embedding as JSON string (for compatibility with text column)
    const embeddingJson = JSON.stringify(embedding);

    // Insert or update embedding
    await db
      .insert(candidateEmbeddings)
      .values({
        candidateId,
        embedding: embeddingJson
      })
      .onConflictDoUpdate({
        target: candidateEmbeddings.candidateId,
        set: {
          embedding: embeddingJson
        }
      });

    console.log(`[Embeddings] Successfully generated and stored embedding for candidate: ${candidateId}`);
    return true;

  } catch (error) {
    console.error(`[Embeddings] Error indexing candidate ${candidateId}:`, error);
    return false;
  }
}

/**
 * Check if OpenAI API is configured for embeddings
 */
export function isEmbeddingsConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Batch index multiple candidates
 * @param candidateIds - Array of candidate UUIDs to index
 * @returns Promise<{ successful: number, failed: number }>
 */
export async function batchIndexCandidates(
  candidateIds: string[]
): Promise<{ successful: number; failed: number }> {
  console.log(`[Embeddings] Batch indexing ${candidateIds.length} candidates`);
  
  let successful = 0;
  let failed = 0;

  for (const candidateId of candidateIds) {
    const result = await indexCandidate(candidateId);
    if (result) {
      successful++;
    } else {
      failed++;
    }
  }

  console.log(`[Embeddings] Batch complete: ${successful} successful, ${failed} failed`);
  return { successful, failed };
}
