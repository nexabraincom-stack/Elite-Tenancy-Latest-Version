import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
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

  const clerkEmail =
    (auth.sessionClaims?.email as string | undefined) ??
    `user_${clerkId}@elitetenancy.co.uk`;
  const clerkName =
    (auth.sessionClaims?.name as string | undefined) ?? "New User";

  // Upsert: avoids the TOCTOU race condition on first login
  // Note: createdAt is omitted — the DB sets it via defaultNow()
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
