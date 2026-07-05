import { pgTable, serial, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const listingStatusEnum = pgEnum("listing_status", ["active", "let", "pending", "withdrawn"]);
export const leadStatusEnum = pgEnum("lead_status", ["new", "contacted", "qualified", "closed"]);
export const userRoleEnum = pgEnum("user_role", ["tenant", "landlord", "admin"]);
export const tenancyStatusEnum = pgEnum("tenancy_status", ["active", "expired", "terminated"]);
export const maintenancePriorityEnum = pgEnum("maintenance_priority", ["low", "medium", "high", "emergency"]);
export const maintenanceStatusEnum = pgEnum("maintenance_status", ["open", "in_progress", "resolved", "closed"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default("tenant"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastActiveAt: timestamp("last_active_at"),
});

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  landlordId: integer("landlord_id").references(() => usersTable.id),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  pricePeriod: text("price_period").notNull().default("month"),
  category: text("category").notNull().default("flat"),
  city: text("city").notNull(),
  postcode: text("postcode").notNull(),
  addressLine1: text("address_line1").notNull().default(""),
  bedrooms: integer("bedrooms").notNull().default(1),
  bathrooms: integer("bathrooms").notNull().default(1),
  floorAreaSqm: integer("floor_area_sqm"),
  furnished: boolean("furnished").notNull().default(false),
  petsAllowed: boolean("pets_allowed").notNull().default(false),
  billsIncluded: boolean("bills_included").notNull().default(false),
  dssAccepted: boolean("dss_accepted").notNull().default(false),
  status: listingStatusEnum("status").notNull().default("active"),
  isFeatured: boolean("is_featured").notNull().default(false),
  isPremium: boolean("is_premium").notNull().default(false),
  photos: text("photos").array().notNull().default([]),
  aiMatchScore: integer("ai_match_score"),
  availableFrom: text("available_from"),
  viewCount: integer("view_count").notNull().default(0),
  enquiryCount: integer("enquiry_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const leadsTable = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message"),
  listingId: integer("listing_id"),
  listingTitle: text("listing_title"),
  status: leadStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const blogArticlesTable = pgTable("blog_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  author: text("author").notNull(),
  imageUrl: text("image_url"),
  readTimeMinutes: integer("read_time_minutes").notNull().default(5),
  tags: text("tags").array().notNull().default([]),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tenanciesTable = pgTable("tenancies", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => usersTable.id),
  landlordId: integer("landlord_id").notNull().references(() => usersTable.id),
  listingId: integer("listing_id").notNull().references(() => listingsTable.id),
  monthlyRent: integer("monthly_rent").notNull(),
  depositAmount: integer("deposit_amount").notNull(),
  leaseStart: text("lease_start").notNull(),
  leaseEnd: text("lease_end").notNull(),
  tenancyType: text("tenancy_type").notNull().default("Assured Shorthold Tenancy"),
  status: tenancyStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  reviewRequestedAt: timestamp("review_requested_at"),
});

export const maintenanceRequestsTable = pgTable("maintenance_requests", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => usersTable.id),
  tenancyId: integer("tenancy_id").references(() => tenanciesTable.id),
  listingId: integer("listing_id").references(() => listingsTable.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  priority: maintenancePriorityEnum("priority").notNull().default("medium"),
  status: maintenanceStatusEnum("status").notNull().default("open"),
  propertyAddress: text("property_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const rentPaymentsTable = pgTable("rent_payments", {
  id: serial("id").primaryKey(),
  tenancyId: integer("tenancy_id").notNull().references(() => tenanciesTable.id),
  dueDate: text("due_date").notNull(),
  paidDate: text("paid_date"),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("due"),
  reference: text("reference").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const documentsTable = pgTable("documents", {
  id: serial("id").primaryKey(),
  tenancyId: integer("tenancy_id").notNull().references(() => tenanciesTable.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  uploadedAt: text("uploaded_at").notNull(),
  size: text("size").notNull(),
  downloadUrl: text("download_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Messaging ─────────────────────────────────────────────────────────────────

export const conversationsTable = pgTable("conversations", {
  id: serial("id").primaryKey(),
  landlordId: integer("landlord_id").notNull().references(() => usersTable.id),
  tenantId: integer("tenant_id").notNull().references(() => usersTable.id),
  listingId: integer("listing_id").references(() => listingsTable.id),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversationsTable.id),
  senderId: integer("sender_id").notNull().references(() => usersTable.id),
  content: text("content").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Renter Passport (two-way AI matching — Play ④) ─────────────────────────────

export const renterPassportsTable = pgTable("renter_passports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  city: text("city").notNull(),
  minBudget: integer("min_budget"),
  maxBudget: integer("max_budget").notNull(),
  bedrooms: integer("bedrooms"),
  moveInDate: text("move_in_date"),
  occupants: text("occupants"),
  employment: text("employment"),
  petsOwner: boolean("pets_owner").notNull().default(false),
  about: text("about"),
  aiPersona: text("ai_persona"),          // landlord-facing AI summary
  aiScore: integer("ai_score"),           // 0–100 tenant readiness/fit
  status: leadStatusEnum("status").notNull().default("new"),
  photoUrl: text("photo_url"),
  // Auto-true on submit so the board keeps its current always-visible
  // behaviour; admin can flip to false to hide spam/inappropriate entries.
  approved: boolean("approved").notNull().default(true),
  // Admin-confirmed only — never self-service. Distinct from `approved`:
  // a passport can be visible on the board without being verified.
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRenterPassportSchema = createInsertSchema(renterPassportsTable).omit({ id: true, createdAt: true, aiPersona: true, aiScore: true, status: true, approved: true, verified: true });
export type RenterPassport = typeof renterPassportsTable.$inferSelect;
export type InsertRenterPassport = z.infer<typeof insertRenterPassportSchema>;

// ── Right to Rent checks (immigration share-code tracking + expiry alerts) ─────
export const rtrChecksTable = pgTable("rtr_checks", {
  id: serial("id").primaryKey(),
  landlordEmail: text("landlord_email").notNull(),
  landlordName: text("landlord_name"),
  tenantName: text("tenant_name").notNull(),
  rightStatus: text("right_status").notNull(),     // unlimited | time_limited | none
  expiryDate: text("expiry_date"),                 // for time_limited (ISO date)
  status: text("status").notNull().default("active"), // active | reminded | renewed | expired
  remindedAt: timestamp("reminded_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export type RtrCheck = typeof rtrChecksTable.$inferSelect;

export const insertConversationSchema = createInsertSchema(conversationsTable).omit({ id: true, createdAt: true, lastMessageAt: true });
export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, createdAt: true, readAt: true });

export type Conversation = typeof conversationsTable.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messagesTable.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export const insertListingSchema = createInsertSchema(listingsTable).omit({ id: true, createdAt: true, updatedAt: true, viewCount: true, enquiryCount: true });
export const insertLeadSchema = createInsertSchema(leadsTable).omit({ id: true, createdAt: true });
export const insertBlogArticleSchema = createInsertSchema(blogArticlesTable).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export const insertTenancySchema = createInsertSchema(tenanciesTable).omit({ id: true, createdAt: true });
export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRentPaymentSchema = createInsertSchema(rentPaymentsTable).omit({ id: true, createdAt: true });
export const insertDocumentSchema = createInsertSchema(documentsTable).omit({ id: true, createdAt: true });

export type Listing = typeof listingsTable.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Lead = typeof leadsTable.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type BlogArticle = typeof blogArticlesTable.$inferSelect;
export type InsertBlogArticle = z.infer<typeof insertBlogArticleSchema>;
export type User = typeof usersTable.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Tenancy = typeof tenanciesTable.$inferSelect;
export type InsertTenancy = z.infer<typeof insertTenancySchema>;
export type MaintenanceRequest = typeof maintenanceRequestsTable.$inferSelect;
export type InsertMaintenanceRequest = z.infer<typeof insertMaintenanceRequestSchema>;
export type RentPayment = typeof rentPaymentsTable.$inferSelect;
export type InsertRentPayment = z.infer<typeof insertRentPaymentSchema>;
export type Document = typeof documentsTable.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
