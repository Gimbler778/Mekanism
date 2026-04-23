import { db } from "../db/index.js";
import {
  candidates,
  candidateSubmissions,
  submissionStatusHistory,
  vendors,
  jobRequisitions,
} from "../db/schema.js";
import { eq, and, ilike, sql, or } from "drizzle-orm";

// Simple duplicate detection by email within a requisition
const checkDuplicate = async (email, requisitionId) => {
  const existing = await db
    .select({ id: candidateSubmissions.id })
    .from(candidateSubmissions)
    .innerJoin(candidates, eq(candidateSubmissions.candidateId, candidates.id))
    .where(
      and(
        eq(candidates.email, email.toLowerCase()),
        eq(candidateSubmissions.requisitionId, requisitionId)
      )
    )
    .limit(1);

  return existing.length > 0;
};

export const submitCandidate = async (req, res, next) => {
  try {
    const {
      firstName, lastName, email, phone, linkedinUrl, resumeUrl,
      currentTitle, currentCompany, totalExperience, skills,
      location, expectedSalary, noticePeriod, coverNote,
      requisitionId,
    } = req.body;

    // Get vendor ID for the submitting user
    const { vendorUsers } = await import("../db/schema.js");
    const [vendorLink] = await db
      .select()
      .from(vendorUsers)
      .where(eq(vendorUsers.userId, req.user.id))
      .limit(1);

    const vendorId = vendorLink?.vendorId;
    if (!vendorId && req.user.role === "vendor") {
      return res.status(400).json({ error: "No vendor account linked to user" });
    }

    // Check for duplicate
    const isDuplicate = await checkDuplicate(email, requisitionId);

    // Upsert candidate
    let [candidate] = await db
      .select()
      .from(candidates)
      .where(eq(candidates.email, email.toLowerCase()))
      .limit(1);

    if (!candidate) {
      [candidate] = await db
        .insert(candidates)
        .values({
          firstName, lastName,
          email: email.toLowerCase(),
          phone, linkedinUrl, resumeUrl,
          currentTitle, currentCompany,
          totalExperience, skills: skills || [],
          location, expectedSalary, noticePeriod,
          isDuplicate,
        })
        .returning();
    }

    if (isDuplicate) {
      return res.status(409).json({
        error: "Candidate already submitted for this requisition",
        candidateId: candidate.id,
      });
    }

    // Create submission
    const [submission] = await db
      .insert(candidateSubmissions)
      .values({
        candidateId: candidate.id,
        requisitionId,
        vendorId: vendorId || req.body.vendorId,
        submittedById: req.user.id,
        coverNote,
        status: "submitted",
      })
      .returning();

    // Log status history
    await db.insert(submissionStatusHistory).values({
      submissionId: submission.id,
      toStatus: "submitted",
      changedById: req.user.id,
      notes: "Initial submission",
    });

    // Update vendor submission count
    if (vendorId) {
      await db
        .update(vendors)
        .set({ totalSubmissions: sql`total_submissions + 1` })
        .where(eq(vendors.id, vendorId));
    }

    res.status(201).json({
      data: { candidate, submission },
      message: "Candidate submitted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const getSubmissions = async (req, res, next) => {
  try {
    const { requisitionId, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (requisitionId) conditions.push(eq(candidateSubmissions.requisitionId, requisitionId));
    if (status) conditions.push(eq(candidateSubmissions.status, status));

    const [submissions, countResult] = await Promise.all([
      db
        .select({
          id: candidateSubmissions.id,
          status: candidateSubmissions.status,
          submittedAt: candidateSubmissions.submittedAt,
          candidateId: candidates.id,
          candidateName: sql`concat(${candidates.firstName}, ' ', ${candidates.lastName})`,
          candidateEmail: candidates.email,
          currentTitle: candidates.currentTitle,
          totalExperience: candidates.totalExperience,
          vendorId: vendors.id,
          vendorName: vendors.companyName,
          requisitionId: jobRequisitions.id,
          requisitionTitle: jobRequisitions.title,
          requisitionCode: jobRequisitions.requisitionCode,
        })
        .from(candidateSubmissions)
        .innerJoin(candidates, eq(candidateSubmissions.candidateId, candidates.id))
        .innerJoin(vendors, eq(candidateSubmissions.vendorId, vendors.id))
        .innerJoin(jobRequisitions, eq(candidateSubmissions.requisitionId, jobRequisitions.id))
        .where(conditions.length ? and(...conditions) : undefined)
        .limit(Number(limit))
        .offset(Number(offset))
        .orderBy(candidateSubmissions.submittedAt),
      db
        .select({ count: sql`count(*)` })
        .from(candidateSubmissions)
        .where(conditions.length ? and(...conditions) : undefined),
    ]);

    res.json({
      data: submissions,
      pagination: {
        total: Number(countResult[0].count),
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateSubmissionStatus = async (req, res, next) => {
  try {
    const { status, notes, rejectionReason } = req.body;

    const [existing] = await db
      .select()
      .from(candidateSubmissions)
      .where(eq(candidateSubmissions.id, req.params.id))
      .limit(1);

    if (!existing) return res.status(404).json({ error: "Submission not found" });

    const [submission] = await db
      .update(candidateSubmissions)
      .set({ status, rejectionReason, updatedAt: new Date() })
      .where(eq(candidateSubmissions.id, req.params.id))
      .returning();

    await db.insert(submissionStatusHistory).values({
      submissionId: submission.id,
      fromStatus: existing.status,
      toStatus: status,
      changedById: req.user.id,
      notes,
    });

    // Update vendor hire count if hired
    if (status === "hired") {
      await db
        .update(vendors)
        .set({ totalHires: sql`total_hires + 1` })
        .where(eq(vendors.id, existing.vendorId));
    }

    res.json({ data: submission, message: "Status updated" });
  } catch (err) {
    next(err);
  }
};

export const getCandidateById = async (req, res, next) => {
  try {
    const [candidate] = await db
      .select()
      .from(candidates)
      .where(eq(candidates.id, req.params.id))
      .limit(1);

    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

    const submissions = await db
      .select()
      .from(candidateSubmissions)
      .where(eq(candidateSubmissions.candidateId, req.params.id));

    res.json({ data: { ...candidate, submissions } });
  } catch (err) {
    next(err);
  }
};
