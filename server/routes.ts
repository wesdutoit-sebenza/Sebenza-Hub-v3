import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubscriberSchema, insertJobSchema, insertCVSchema } from "@shared/schema";

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

  const httpServer = createServer(app);

  return httpServer;
}
