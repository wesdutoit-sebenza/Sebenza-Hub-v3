import { Request, Response, NextFunction, RequestHandler } from "express";
import { firebaseAuth } from "./firebase-admin";
import { db } from "./db";
import { users, type User } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
  user?: User;
  firebaseUid?: string;
}

/**
 * Middleware to authenticate requests using Firebase ID tokens
 * Verifies the token and syncs the Firebase user with our PostgreSQL database
 */
export const authenticateFirebase: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authReq = req as AuthRequest;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    // Verify the Firebase ID token
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    authReq.firebaseUid = decodedToken.uid;

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

    // Attach full user object to request
    authReq.user = dbUser;

    next();
  } catch (error) {
    console.error("Firebase token verification error:", error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
    return;
  }
};

/**
 * Optional middleware - only authenticates if token is present
 * Useful for routes that can work with or without authentication
 */
export const authenticateFirebaseOptional: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(); // Continue without authentication
    return;
  }

  // If token is present, verify it
  await authenticateFirebase(req, res, next);
};

/**
 * Middleware to check if authenticated user has one of the specified roles
 */
export function requireRole(...allowedRoles: string[]): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthRequest;
    
    if (!authReq.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userRoles = authReq.user.roles || [];
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      res.status(403).json({ 
        message: `Forbidden: One of [${allowedRoles.join(", ")}] roles required` 
      });
      return;
    }

    next();
  };
}

/**
 * Middleware specifically for admin routes
 */
export const requireAdmin = requireRole("admin");
