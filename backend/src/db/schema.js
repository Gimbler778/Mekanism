import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  pgEnum,
  jsonb,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "hr",
  "hiring_manager",
  "vendor",
]);

export const requisitionStatusEnum = pgEnum("requisition_status", [
  "draft",
  "pending_approval",
  "approved",
  "open",
  "on_hold",
  "closed",
  "cancelled",
]);

export const candidateStatusEnum = pgEnum("candidate_status", [
  "submitted",
  "screened",
  "shortlisted",
  "interview_scheduled",
  "interview_completed",
  "offer_extended",
  "hired",
  "rejected",
  "withdrawn",
]);

export const vendorStatusEnum = pgEnum("vendor_status", [
  "pending",
  "active",
  "inactive",
  "blacklisted",
]);

export const interviewTypeEnum = pgEnum("interview_type", [
  "phone_screen",
  "technical",
  "hr",
  "final",
  "panel",
]);

export const interviewStatusEnum = pgEnum("interview_status", [
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "update",
  "delete",
  "login",
  "logout",
  "view",
  "approve",
  "reject",
]);

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  role: userRoleEnum("role").notNull().default("hr"),
  isActive: boolean("is_active").notNull().default(true),
  avatarUrl: text("avatar_url"),
  oauthProvider: varchar("oauth_provider", { length: 50 }),
  oauthId: varchar("oauth_id", { length: 255 }),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Vendors ─────────────────────────────────────────────────────────────────

export const vendors = pgTable("vendors", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  registrationNumber: varchar("registration_number", { length: 100 }),
  website: text("website"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  status: vendorStatusEnum("status").notNull().default("pending"),
  specializations: jsonb("specializations").default([]),
  agreedTermsAt: timestamp("agreed_terms_at"),
  contractStartDate: date("contract_start_date"),
  contractEndDate: date("contract_end_date"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalSubmissions: integer("total_submissions").notNull().default(0),
  totalHires: integer("total_hires").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const vendorContacts = pgTable("vendor_contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendorId: uuid("vendor_id")
    .notNull()
    .references(() => vendors.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  designation: varchar("designation", { length: 100 }),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Link between vendor org and user account
export const vendorUsers = pgTable("vendor_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendorId: uuid("vendor_id")
    .notNull()
    .references(() => vendors.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Job Requisitions ─────────────────────────────────────────────────────────

export const jobRequisitions = pgTable("job_requisitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  requisitionCode: varchar("requisition_code", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  department: varchar("department", { length: 100 }),
  location: varchar("location", { length: 255 }),
  description: text("description"),
  requirements: text("requirements"),
  skills: jsonb("skills").default([]),
  experienceMin: integer("experience_min"),
  experienceMax: integer("experience_max"),
  budgetMin: decimal("budget_min", { precision: 12, scale: 2 }),
  budgetMax: decimal("budget_max", { precision: 12, scale: 2 }),
  targetStartDate: date("target_start_date"),
  closingDate: date("closing_date"),
  numberOfOpenings: integer("number_of_openings").notNull().default(1),
  status: requisitionStatusEnum("status").notNull().default("draft"),
  createdById: uuid("created_by_id")
    .notNull()
    .references(() => users.id),
  approvedById: uuid("approved_by_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  hiringManagerId: uuid("hiring_manager_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Vendors assigned to a requisition
export const requisitionVendors = pgTable("requisition_vendors", {
  id: uuid("id").primaryKey().defaultRandom(),
  requisitionId: uuid("requisition_id")
    .notNull()
    .references(() => jobRequisitions.id, { onDelete: "cascade" }),
  vendorId: uuid("vendor_id")
    .notNull()
    .references(() => vendors.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  assignedById: uuid("assigned_by_id").references(() => users.id),
});

// ─── Candidates ───────────────────────────────────────────────────────────────

export const candidates = pgTable("candidates", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  linkedinUrl: text("linkedin_url"),
  resumeUrl: text("resume_url"),
  resumeParsedData: jsonb("resume_parsed_data"),
  currentTitle: varchar("current_title", { length: 255 }),
  currentCompany: varchar("current_company", { length: 255 }),
  totalExperience: decimal("total_experience", { precision: 4, scale: 1 }),
  skills: jsonb("skills").default([]),
  location: varchar("location", { length: 255 }),
  expectedSalary: decimal("expected_salary", { precision: 12, scale: 2 }),
  noticePeriod: integer("notice_period"),
  isDuplicate: boolean("is_duplicate").notNull().default(false),
  duplicateOfId: uuid("duplicate_of_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Submission of a candidate for a specific requisition by a vendor
export const candidateSubmissions = pgTable("candidate_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id")
    .notNull()
    .references(() => candidates.id, { onDelete: "cascade" }),
  requisitionId: uuid("requisition_id")
    .notNull()
    .references(() => jobRequisitions.id, { onDelete: "cascade" }),
  vendorId: uuid("vendor_id")
    .notNull()
    .references(() => vendors.id),
  submittedById: uuid("submitted_by_id")
    .notNull()
    .references(() => users.id),
  status: candidateStatusEnum("status").notNull().default("submitted"),
  coverNote: text("cover_note"),
  vendorRating: integer("vendor_rating"),
  internalNotes: text("internal_notes"),
  rejectionReason: text("rejection_reason"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Status history for audit trail
export const submissionStatusHistory = pgTable("submission_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => candidateSubmissions.id, { onDelete: "cascade" }),
  fromStatus: candidateStatusEnum("from_status"),
  toStatus: candidateStatusEnum("to_status").notNull(),
  changedById: uuid("changed_by_id")
    .notNull()
    .references(() => users.id),
  notes: text("notes"),
  changedAt: timestamp("changed_at").notNull().defaultNow(),
});

// ─── Interviews ───────────────────────────────────────────────────────────────

export const interviews = pgTable("interviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => candidateSubmissions.id, { onDelete: "cascade" }),
  type: interviewTypeEnum("type").notNull(),
  status: interviewStatusEnum("status").notNull().default("scheduled"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").default(60),
  location: varchar("location", { length: 255 }),
  meetingLink: text("meeting_link"),
  interviewers: jsonb("interviewers").default([]),
  feedback: text("feedback"),
  rating: integer("rating"),
  outcome: varchar("outcome", { length: 50 }),
  scheduledById: uuid("scheduled_by_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  action: auditActionEnum("action").notNull(),
  resourceType: varchar("resource_type", { length: 100 }).notNull(),
  resourceId: uuid("resource_id"),
  metadata: jsonb("metadata"),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  vendorUsers: many(vendorUsers),
  createdRequisitions: many(jobRequisitions, { relationName: "createdBy" }),
  auditLogs: many(auditLogs),
}));

export const vendorsRelations = relations(vendors, ({ many }) => ({
  contacts: many(vendorContacts),
  vendorUsers: many(vendorUsers),
  requisitions: many(requisitionVendors),
  submissions: many(candidateSubmissions),
}));

export const jobRequisitionsRelations = relations(
  jobRequisitions,
  ({ one, many }) => ({
    createdBy: one(users, {
      fields: [jobRequisitions.createdById],
      references: [users.id],
      relationName: "createdBy",
    }),
    approvedBy: one(users, {
      fields: [jobRequisitions.approvedById],
      references: [users.id],
    }),
    hiringManager: one(users, {
      fields: [jobRequisitions.hiringManagerId],
      references: [users.id],
    }),
    vendors: many(requisitionVendors),
    submissions: many(candidateSubmissions),
  })
);

export const candidatesRelations = relations(candidates, ({ many }) => ({
  submissions: many(candidateSubmissions),
}));

export const vendorContactsRelations = relations(
  vendorContacts,
  ({ one }) => ({
    vendor: one(vendors, {
      fields: [vendorContacts.vendorId],
      references: [vendors.id],
    }),
  })
);

export const vendorUsersRelations = relations(
  vendorUsers,
  ({ one }) => ({
    vendor: one(vendors, {
      fields: [vendorUsers.vendorId],
      references: [vendors.id],
    }),
    user: one(users, {
      fields: [vendorUsers.userId],
      references: [users.id],
    }),
  })
);

export const requisitionVendorsRelations = relations(
  requisitionVendors,
  ({ one }) => ({
    requisition: one(jobRequisitions, {
      fields: [requisitionVendors.requisitionId],
      references: [jobRequisitions.id],
    }),
    vendor: one(vendors, {
      fields: [requisitionVendors.vendorId],
      references: [vendors.id],
    }),
    assignedBy: one(users, {
      fields: [requisitionVendors.assignedById],
      references: [users.id],
    }),
  })
);

export const candidateSubmissionsRelations = relations(
  candidateSubmissions,
  ({ one, many }) => ({
    candidate: one(candidates, {
      fields: [candidateSubmissions.candidateId],
      references: [candidates.id],
    }),
    requisition: one(jobRequisitions, {
      fields: [candidateSubmissions.requisitionId],
      references: [jobRequisitions.id],
    }),
    vendor: one(vendors, {
      fields: [candidateSubmissions.vendorId],
      references: [vendors.id],
    }),
    submittedBy: one(users, {
      fields: [candidateSubmissions.submittedById],
      references: [users.id],
    }),
    statusHistory: many(submissionStatusHistory),
    interviews: many(interviews),
  })
);

export const submissionStatusHistoryRelations = relations(
  submissionStatusHistory,
  ({ one }) => ({
    submission: one(candidateSubmissions, {
      fields: [submissionStatusHistory.submissionId],
      references: [candidateSubmissions.id],
    }),
    changedBy: one(users, {
      fields: [submissionStatusHistory.changedById],
      references: [users.id],
    }),
  })
);

export const interviewsRelations = relations(
  interviews,
  ({ one }) => ({
    submission: one(candidateSubmissions, {
      fields: [interviews.submissionId],
      references: [candidateSubmissions.id],
    }),
    scheduledBy: one(users, {
      fields: [interviews.scheduledById],
      references: [users.id],
    }),
  })
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
