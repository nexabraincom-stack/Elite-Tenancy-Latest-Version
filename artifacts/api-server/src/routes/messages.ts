import { Router, type IRouter } from "express";
import {
  db,
  conversationsTable,
  messagesTable,
  usersTable,
  listingsTable,
} from "@workspace/db";
import { eq, and, or, desc, count, isNull, ne, inArray } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { issueWsToken } from "../ws/server";

const router: IRouter = Router();

// All messaging routes require auth
router.use("/messages", requireAuth());

// ── Issue a one-time WebSocket handshake token ────────────────────────────────
router.get("/messages/ws-token", (req, res): void => {
  const userId = res.locals.user.id;
  const token = issueWsToken(userId);
  res.json({ token });
});

// ── List conversations for the current user ───────────────────────────────────
// Returns conversations with the other party's name, last message preview, unread count
router.get("/messages/conversations", async (req, res): Promise<void> => {
  const userId = res.locals.user.id;

  const rows = await db
    .select({
      id: conversationsTable.id,
      landlordId: conversationsTable.landlordId,
      tenantId: conversationsTable.tenantId,
      listingId: conversationsTable.listingId,
      lastMessageAt: conversationsTable.lastMessageAt,
      createdAt: conversationsTable.createdAt,
    })
    .from(conversationsTable)
    .where(
      or(
        eq(conversationsTable.landlordId, userId),
        eq(conversationsTable.tenantId, userId),
      ),
    )
    .orderBy(desc(conversationsTable.lastMessageAt));

  // Enrich with participant name, listing title, last message, unread count
  const enriched = await Promise.all(
    rows.map(async (conv) => {
      const otherId = conv.landlordId === userId ? conv.tenantId : conv.landlordId;

      const [other] = await db
        .select({ id: usersTable.id, name: usersTable.name, role: usersTable.role })
        .from(usersTable)
        .where(eq(usersTable.id, otherId));

      const [listing] = conv.listingId
        ? await db
            .select({ id: listingsTable.id, title: listingsTable.title, city: listingsTable.city })
            .from(listingsTable)
            .where(eq(listingsTable.id, conv.listingId))
        : [null];

      // Last message
      const [lastMsg] = await db
        .select({ content: messagesTable.content, senderId: messagesTable.senderId, createdAt: messagesTable.createdAt })
        .from(messagesTable)
        .where(eq(messagesTable.conversationId, conv.id))
        .orderBy(desc(messagesTable.createdAt))
        .limit(1);

      // Unread count (messages NOT sent by me, not yet read)
      const [unreadRow] = await db
        .select({ count: count() })
        .from(messagesTable)
        .where(
          and(
            eq(messagesTable.conversationId, conv.id),
            ne(messagesTable.senderId, userId),
            isNull(messagesTable.readAt),
          ),
        );

      return {
        id: conv.id,
        other: other ?? { id: otherId, name: "Unknown", role: "tenant" },
        listing: listing ?? null,
        lastMessage: lastMsg ?? null,
        unreadCount: unreadRow?.count ?? 0,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
      };
    }),
  );

  res.json(enriched);
});

// ── Get messages in a conversation ────────────────────────────────────────────
router.get("/messages/conversations/:id", async (req, res): Promise<void> => {
  const userId = res.locals.user.id;
  const convId = Number(req.params.id);

  if (!convId) {
    res.status(400).json({ error: "Invalid conversation id" });
    return;
  }

  // Verify participant
  const [conv] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, convId));

  if (!conv || (conv.landlordId !== userId && conv.tenantId !== userId)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  // Fetch last 100 messages
  const limit = Math.min(Number(req.query.limit ?? 100), 200);
  const offset = Number(req.query.offset ?? 0);

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, convId))
    .orderBy(desc(messagesTable.createdAt))
    .limit(limit)
    .offset(offset);

  // Mark all messages not sent by me as read
  await db
    .update(messagesTable)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(messagesTable.conversationId, convId),
        ne(messagesTable.senderId, userId),
        isNull(messagesTable.readAt),
      ),
    );

  // Return messages in chronological order (oldest first for display)
  res.json(messages.reverse());
});

// ── Start a new conversation (or return existing) ─────────────────────────────
router.post("/messages/conversations", async (req, res): Promise<void> => {
  const userId = res.locals.user.id;
  const { otherUserId, listingId } = req.body;

  if (!otherUserId || typeof otherUserId !== "number") {
    res.status(400).json({ error: "otherUserId required" });
    return;
  }

  const user = res.locals.user;

  // Determine landlord/tenant assignment
  const [other] = await db
    .select({ id: usersTable.id, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.id, otherUserId));

  if (!other) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const landlordId = user.role === "landlord" ? userId : other.id;
  const tenantId = user.role === "tenant" ? userId : other.id;

  // Upsert conversation
  const [conv] = await db
    .insert(conversationsTable)
    .values({
      landlordId,
      tenantId,
      listingId: listingId ?? null,
    })
    .onConflictDoUpdate({
      target: [conversationsTable.landlordId, conversationsTable.tenantId, conversationsTable.listingId],
      set: { lastMessageAt: new Date() },
    })
    .returning();

  res.json(conv);
});

// ── Send a message via REST (fallback if WS unavailable) ─────────────────────
router.post("/messages/conversations/:id/send", async (req, res): Promise<void> => {
  const userId = res.locals.user.id;
  const convId = Number(req.params.id);
  const { content } = req.body;

  if (!content || typeof content !== "string" || !content.trim() || content.length > 4000) {
    res.status(400).json({ error: "content must be 1–4000 characters" });
    return;
  }

  const [conv] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, convId));

  if (!conv || (conv.landlordId !== userId && conv.tenantId !== userId)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [msg] = await db
    .insert(messagesTable)
    .values({ conversationId: convId, senderId: userId, content: content.trim() })
    .returning();

  await db
    .update(conversationsTable)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversationsTable.id, convId));

  res.json(msg);
});

// ── Unread message count across all conversations ─────────────────────────────
router.get("/messages/unread-count", async (req, res): Promise<void> => {
  const userId = res.locals.user.id;

  // Get all conversation IDs this user is in
  const convs = await db
    .select({ id: conversationsTable.id })
    .from(conversationsTable)
    .where(
      or(
        eq(conversationsTable.landlordId, userId),
        eq(conversationsTable.tenantId, userId),
      ),
    );

  if (convs.length === 0) {
    res.json({ unreadCount: 0 });
    return;
  }

  // Single aggregate query — collapses N queries into 1 regardless of conversation count
  const convIds = convs.map((c) => c.id);
  const [totalRow] = await db
    .select({ count: count() })
    .from(messagesTable)
    .where(
      and(
        inArray(messagesTable.conversationId, convIds),
        ne(messagesTable.senderId, userId),
        isNull(messagesTable.readAt),
      ),
    );

  res.json({ unreadCount: totalRow?.count ?? 0 });
});

export default router;
