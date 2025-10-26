import { Express } from "express";
import { authenticateFirebase, AuthRequest } from "./firebase-middleware";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

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

  // Select/add role for user
  app.post("/api/me/role", authenticateFirebase, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { role } = req.body;

      if (!role || !['individual', 'business', 'recruiter'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      // Get current user's roles
      const [currentUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.user.id))
        .limit(1);

      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Add role if not already present
      const currentRoles = currentUser.roles || [];
      if (!currentRoles.includes(role)) {
        const updatedRoles = [...currentRoles, role];
        
        await db
          .update(users)
          .set({ roles: updatedRoles })
          .where(eq(users.id, req.user.id));
      }

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
}
