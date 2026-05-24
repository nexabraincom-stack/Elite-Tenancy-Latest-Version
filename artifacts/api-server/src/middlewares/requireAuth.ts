import { type RequestHandler } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface Locals {
      user: typeof usersTable.$inferSelect;
    }
  }
}

/**
 * Requires a valid Clerk session. Attaches the DB user to res.locals.user.
 * Returns 401 if unauthenticated, 403 if no matching DB user.
 */
export function requireAuth(): RequestHandler {
  return async (req, res, next) => {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, userId));

    if (!user) {
      res.status(401).json({ error: "User not found — please sign in again" });
      return;
    }

    res.locals.user = user;

    // Touch lastActiveAt in the background (fire-and-forget)
    db.update(usersTable)
      .set({ lastActiveAt: new Date() })
      .where(eq(usersTable.id, user.id))
      .catch(() => {});

    next();
  };
}

/**
 * Requires one of the given roles. Must be composed after requireAuth().
 */
export function requireRole(...roles: Array<"tenant" | "landlord" | "admin">): RequestHandler {
  return (req, res, next) => {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = res.locals.user;
    if (!user || !roles.includes(user.role as "tenant" | "landlord" | "admin")) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    next();
  };
}
