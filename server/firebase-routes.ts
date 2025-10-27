import { Express } from "express";
import { authenticateFirebase, AuthRequest } from "./firebase-middleware";
import { firebaseAuth } from "./firebase-admin";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export function setupFirebaseRoutes(app: Express) {
  // Get current user endpoint - uses Firebase authentication
  app.get("/api/auth/user", authenticateFirebase, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      res.json({ user: req.user });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Set user's role (replaces previous role)
  app.post("/api/me/role", authenticateFirebase, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { role } = req.body;

      if (!role || !['individual', 'business', 'recruiter'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      // Update user's role (only one role allowed)
      await db
        .update(users)
        .set({ 
          role: role,
          onboardingComplete: 0 // Reset onboarding when switching roles
        })
        .where(eq(users.id, req.user.id));

      res.json({ success: true });
    } catch (error) {
      console.error("Error selecting role:", error);
      res.status(500).json({ message: "Failed to select role" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", authenticateFirebase, async (req: AuthRequest, res) => {
    try {
      // Firebase handles logout on the client side
      // Just acknowledge the request
      res.json({ success: true });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });

  // Admin setup endpoint - only works if no admin exists
  app.post("/api/admin/setup", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validate input
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ 
          message: "Email, password, first name, and last name are required" 
        });
      }

      // Check if any admin already exists
      const existingAdmins = await db
        .select()
        .from(users)
        .where(eq(users.role, 'admin'))
        .limit(1);

      if (existingAdmins.length > 0) {
        return res.status(403).json({ 
          message: "Admin setup is disabled. An admin already exists." 
        });
      }

      // Create user in Firebase
      let firebaseUser;
      try {
        firebaseUser = await firebaseAuth.createUser({
          email,
          password,
          displayName: `${firstName} ${lastName}`.trim(),
        });
      } catch (firebaseError: any) {
        console.error("Firebase user creation error:", firebaseError);
        return res.status(400).json({ 
          message: firebaseError.message || "Failed to create Firebase user" 
        });
      }

      // Create user in database with admin role
      const [newAdmin] = await db
        .insert(users)
        .values({
          firebaseUid: firebaseUser.uid,
          email,
          role: "admin",
          onboardingComplete: 1, // Admin setup complete
          firstName,
          lastName,
        })
        .returning();

      // Set custom claims in Firebase for admin role
      await firebaseAuth.setCustomUserClaims(firebaseUser.uid, { 
        admin: true 
      });

      res.json({ 
        success: true, 
        message: "Admin account created successfully",
        admin: {
          id: newAdmin.id,
          email: newAdmin.email,
          firstName: newAdmin.firstName,
          lastName: newAdmin.lastName,
        }
      });
    } catch (error) {
      console.error("Admin setup error:", error);
      res.status(500).json({ message: "Failed to create admin account" });
    }
  });
}
