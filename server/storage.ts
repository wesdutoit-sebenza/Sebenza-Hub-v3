import { type User, type InsertUser, type Subscriber, type InsertSubscriber, type Job, type InsertJob, type CV, type InsertCV } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  getAllSubscribers(): Promise<Subscriber[]>;
  createJob(job: InsertJob): Promise<Job>;
  getAllJobs(): Promise<Job[]>;
  getJobById(id: string): Promise<Job | undefined>;
  createCV(cv: InsertCV): Promise<CV>;
  getCV(id: string): Promise<CV | undefined>;
  updateCV(id: string, cv: Partial<InsertCV>): Promise<CV | undefined>;
  getAllCVs(): Promise<CV[]>;
  getCVByUserId(userId: string): Promise<CV | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private subscribers: Map<string, Subscriber>;
  private jobs: Map<string, Job>;
  private cvs: Map<string, CV>;

  constructor() {
    this.users = new Map();
    this.subscribers = new Map();
    this.jobs = new Map();
    this.cvs = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSubscriber(insertSubscriber: InsertSubscriber): Promise<Subscriber> {
    const existing = await this.getSubscriberByEmail(insertSubscriber.email);
    if (existing) {
      throw new Error("Email already subscribed");
    }

    const id = randomUUID();
    const subscriber: Subscriber = {
      ...insertSubscriber,
      id,
      createdAt: new Date(),
    };
    this.subscribers.set(id, subscriber);
    return subscriber;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    return Array.from(this.subscribers.values()).find(
      (subscriber) => subscriber.email === email,
    );
  }

  async getAllSubscribers(): Promise<Subscriber[]> {
    return Array.from(this.subscribers.values());
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = randomUUID();
    const job: Job = {
      ...insertJob,
      id,
      createdAt: new Date(),
    };
    this.jobs.set(id, job);
    return job;
  }

  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getJobById(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async createCV(insertCV: InsertCV): Promise<CV> {
    const id = randomUUID();
    const now = new Date();
    const cv: CV = {
      ...insertCV,
      id,
      userId: insertCV.userId || null,
      personalInfo: insertCV.personalInfo as any,
      workExperience: insertCV.workExperience as any,
      skills: insertCV.skills as any,
      education: insertCV.education as any,
      aboutMe: insertCV.aboutMe || null,
      createdAt: now,
      updatedAt: now,
    };
    this.cvs.set(id, cv);
    return cv;
  }

  async getCV(id: string): Promise<CV | undefined> {
    return this.cvs.get(id);
  }

  async updateCV(id: string, updates: Partial<InsertCV>): Promise<CV | undefined> {
    const existing = this.cvs.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: CV = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
      personalInfo: updates.personalInfo ? (updates.personalInfo as any) : existing.personalInfo,
      workExperience: updates.workExperience ? (updates.workExperience as any) : existing.workExperience,
      skills: updates.skills ? (updates.skills as any) : existing.skills,
      education: updates.education ? (updates.education as any) : existing.education,
    };

    this.cvs.set(id, updated);
    return updated;
  }

  async getAllCVs(): Promise<CV[]> {
    return Array.from(this.cvs.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getCVByUserId(userId: string): Promise<CV | undefined> {
    return Array.from(this.cvs.values()).find(
      (cv) => cv.userId === userId
    );
  }
}

export const storage = new MemStorage();
