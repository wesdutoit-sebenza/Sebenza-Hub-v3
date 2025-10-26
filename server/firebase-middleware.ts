import { Request, Response, NextFunction } from "express";
import { firebaseAuth } from "./firebase-admin";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string | null;
    roles: string[];
    onboardingComplete: Record<string, boolean>;
    firstName?: string | null;
    lastName?: string | null;
  };
  firebaseUid?: string;
}

/**
 * Middleware to authenticate requests using Firebase ID tokens
 * Verifies the token and syncs the Firebase user with our PostgreSQL database
 */
export async function authenticateFirebase(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    // Verify the Firebase ID token
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    req.firebaseUid = decodedToken.uid;

    // Get or create user in our database
    let [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, decodedToken.uid))
      .limit(1);

    // If user doesn't exist in our DB, create them
    if (!dbUser) {
      const [newUser] = await db
        .insert(users)
        .values({
          firebaseUid: decodedToken.uid,
          email: decodedToken.email || null,
          roles: ["individual"], // Default role
          onboardingComplete: {}, // Empty object means no roles have completed onboarding
          firstName: decodedToken.name?.split(" ")[0] || null,
          lastName: decodedToken.name?.split(" ").slice(1).join(" ") || null,
        })
        .returning();

      dbUser = newUser;
    }

    // Attach user to request
    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      roles: dbUser.roles,
      onboardingComplete: dbUser.onboardingComplete as Record<string, boolean>,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
    };

    next();
  } catch (error) {
    console.error("Firebase token verification error:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}

/**
 * Optional middleware - only authenticates if token is present
 * Useful for routes that can work with or without authentication
 */
export async function authenticateFirebaseOptional(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(); // Continue without authentication
  }

  // If token is present, verify it
  return authenticateFirebase(req, res, next);
}
