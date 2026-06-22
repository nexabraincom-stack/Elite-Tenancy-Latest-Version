import { Router, type IRouter } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/auth/me", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const clerkId = auth?.userId;

  if (!clerkId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Session claims only include email if the Clerk Dashboard session token is
  // customised. Fall back to the Clerk backend API so pre-seeded accounts
  // (e.g. the admin row inserted before first sign-in) are always matched by
  // their real email address.
  let clerkEmail = auth.sessionClaims?.email as string | undefined;
  let clerkName = auth.sessionClaims?.name as string | undefined;

  if (!clerkEmail) {
    try {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      clerkEmail =
        clerkUser.primaryEmailAddress?.emailAddress ??
        `user_${clerkId}@elitetenancy.co.uk`;
      clerkName ??=
        clerkUser.fullName ?? clerkUser.firstName ?? "New User";
    } catch {
      clerkEmail = `user_${clerkId}@elitetenancy.co.uk`;
      clerkName ??= "New User";
    }
  } else {
    clerkName ??= "New User";
  }

  // Check for a pre-seeded account (e.g. admin rows inserted before first sign-in).
  // If one exists for this email with no clerk_id yet, bind the clerk_id and keep
  // the existing role rather than overwriting it with the default "tenant".
  const [preseed] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, clerkEmail));

  if (preseed && preseed.clerkId === null) {
    const [user] = await db
      .update(usersTable)
      .set({ clerkId, name: clerkName, lastActiveAt: new Date() })
      .where(eq(usersTable.email, clerkEmail))
      .returning();

    res.json({
      id: user.id,
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    return;
  }

  // Normal upsert: conflict on clerk_id keeps role and bumps lastActiveAt
  const [user] = await db
    .insert(usersTable)
    .values({
      clerkId,
      email: clerkEmail,
      name: clerkName,
      role: "tenant",
    })
    .onConflictDoUpdate({
      target: usersTable.clerkId,
      set: { lastActiveAt: new Date() },
    })
    .returning();

  res.json({
    id: user.id,
    clerkId: user.clerkId,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

router.patch("/auth/profile", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  const clerkId = auth?.userId;

  if (!clerkId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { name } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  await db
    .update(usersTable)
    .set({ name: name.trim() })
    .where(eq(usersTable.clerkId, clerkId));

  res.json({ success: true });
});

export default router;
