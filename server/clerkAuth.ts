import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express';
import type { Express, RequestHandler } from 'express';

export function setupClerkAuth(app: Express) {
  const publishableKey = process.env.CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!publishableKey || !secretKey) {
    throw new Error('Missing Clerk environment variables');
  }

  // Apply Clerk middleware to all routes with configuration
  app.use(clerkMiddleware({
    publishableKey,
    secretKey,
  }));
}

// Middleware to require authentication
export const isAuthenticated: RequestHandler = (req, res, next) => {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  next();
};

// Helper to get user ID from request
export function getUserId(req: any): string {
  const { userId } = getAuth(req);
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}
