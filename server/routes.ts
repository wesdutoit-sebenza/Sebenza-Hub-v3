import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubscriberSchema, insertJobSchema } from "@shared/schema";

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

  const httpServer = createServer(app);

  return httpServer;
}
