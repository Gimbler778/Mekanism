import { db } from "../db/index.js";
import {
  jobRequisitions,
  requisitionVendors,
  users,
  vendors,
} from "../db/schema.js";
import { eq, and, ilike, sql } from "drizzle-orm";

const generateRequisitionCode = () => {
  const prefix = "REQ";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const getRequisitions = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (status) conditions.push(eq(jobRequisitions.status, status));
    if (search) conditions.push(ilike(jobRequisitions.title, `%${search}%`));

    // Vendors can only see requisitions assigned to them
    if (req.user.role === "vendor") {
      // This would need a join to filter by vendor - simplified for now
    }

    const [allRequisitions, countResult] = await Promise.all([
      db
        .select({
          id: jobRequisitions.id,
          requisitionCode: jobRequisitions.requisitionCode,
          title: jobRequisitions.title,
          department: jobRequisitions.department,
          location: jobRequisitions.location,
          status: jobRequisitions.status,
          numberOfOpenings: jobRequisitions.numberOfOpenings,
          targetStartDate: jobRequisitions.targetStartDate,
          closingDate: jobRequisitions.closingDate,
          createdAt: jobRequisitions.createdAt,
        })
        .from(jobRequisitions)
        .where(conditions.length ? and(...conditions) : undefined)
        .limit(Number(limit))
        .offset(Number(offset))
        .orderBy(jobRequisitions.createdAt),
      db
        .select({ count: sql`count(*)` })
        .from(jobRequisitions)
        .where(conditions.length ? and(...conditions) : undefined),
    ]);

    res.json({
      data: allRequisitions,
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

export const getRequisitionById = async (req, res, next) => {
  try {
    const [requisition] = await db
      .select()
      .from(jobRequisitions)
      .where(eq(jobRequisitions.id, req.params.id))
      .limit(1);

    if (!requisition)
      return res.status(404).json({ error: "Requisition not found" });

    // Get assigned vendors
    const assignedVendors = await db
      .select({
        id: vendors.id,
        companyName: vendors.companyName,
        status: vendors.status,
        rating: vendors.rating,
      })
      .from(requisitionVendors)
      .innerJoin(vendors, eq(requisitionVendors.vendorId, vendors.id))
      .where(eq(requisitionVendors.requisitionId, req.params.id));

    res.json({ data: { ...requisition, assignedVendors } });
  } catch (err) {
    next(err);
  }
};

export const createRequisition = async (req, res, next) => {
  try {
    const [requisition] = await db
      .insert(jobRequisitions)
      .values({
        ...req.body,
        requisitionCode: generateRequisitionCode(),
        createdById: req.user.id,
      })
      .returning();

    res
      .status(201)
      .json({ data: requisition, message: "Requisition created" });
  } catch (err) {
    next(err);
  }
};

export const updateRequisition = async (req, res, next) => {
  try {
    const [requisition] = await db
      .update(jobRequisitions)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(jobRequisitions.id, req.params.id))
      .returning();

    if (!requisition)
      return res.status(404).json({ error: "Requisition not found" });

    res.json({ data: requisition, message: "Requisition updated" });
  } catch (err) {
    next(err);
  }
};

export const approveRequisition = async (req, res, next) => {
  try {
    const [requisition] = await db
      .update(jobRequisitions)
      .set({
        status: "approved",
        approvedById: req.user.id,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(jobRequisitions.id, req.params.id))
      .returning();

    if (!requisition)
      return res.status(404).json({ error: "Requisition not found" });

    res.json({ data: requisition, message: "Requisition approved" });
  } catch (err) {
    next(err);
  }
};

export const assignVendors = async (req, res, next) => {
  try {
    const { vendorIds } = req.body;

    // Remove existing assignments
    await db
      .delete(requisitionVendors)
      .where(eq(requisitionVendors.requisitionId, req.params.id));

    // Insert new assignments
    if (vendorIds?.length) {
      await db.insert(requisitionVendors).values(
        vendorIds.map((vendorId) => ({
          requisitionId: req.params.id,
          vendorId,
          assignedById: req.user.id,
        }))
      );
    }

    res.json({ message: "Vendors assigned successfully" });
  } catch (err) {
    next(err);
  }
};
