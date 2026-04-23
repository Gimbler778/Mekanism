import { db } from "../db/index.js";
import { vendors, vendorContacts, vendorUsers } from "../db/schema.js";
import { eq, ilike, and, sql } from "drizzle-orm";

export const getVendors = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (search) conditions.push(ilike(vendors.companyName, `%${search}%`));
    if (status) conditions.push(eq(vendors.status, status));

    const [allVendors, countResult] = await Promise.all([
      db
        .select()
        .from(vendors)
        .where(conditions.length ? and(...conditions) : undefined)
        .limit(Number(limit))
        .offset(Number(offset))
        .orderBy(vendors.createdAt),
      db
        .select({ count: sql`count(*)` })
        .from(vendors)
        .where(conditions.length ? and(...conditions) : undefined),
    ]);

    res.json({
      data: allVendors,
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

export const getVendorById = async (req, res, next) => {
  try {
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, req.params.id))
      .limit(1);

    if (!vendor) return res.status(404).json({ error: "Vendor not found" });

    const contacts = await db
      .select()
      .from(vendorContacts)
      .where(eq(vendorContacts.vendorId, vendor.id));

    res.json({ data: { ...vendor, contacts } });
  } catch (err) {
    next(err);
  }
};

export const createVendor = async (req, res, next) => {
  try {
    const { contacts, ...vendorData } = req.body;

    const [vendor] = await db
      .insert(vendors)
      .values(vendorData)
      .returning();

    if (contacts?.length) {
      await db.insert(vendorContacts).values(
        contacts.map((c) => ({ ...c, vendorId: vendor.id }))
      );
    }

    res.status(201).json({ data: vendor, message: "Vendor created" });
  } catch (err) {
    next(err);
  }
};

export const updateVendor = async (req, res, next) => {
  try {
    const [vendor] = await db
      .update(vendors)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(vendors.id, req.params.id))
      .returning();

    if (!vendor) return res.status(404).json({ error: "Vendor not found" });

    res.json({ data: vendor, message: "Vendor updated" });
  } catch (err) {
    next(err);
  }
};

export const getVendorPerformance = async (req, res, next) => {
  try {
    const [vendor] = await db
      .select({
        id: vendors.id,
        companyName: vendors.companyName,
        rating: vendors.rating,
        totalSubmissions: vendors.totalSubmissions,
        totalHires: vendors.totalHires,
        hiringRatio: sql`CASE WHEN ${vendors.totalSubmissions} > 0 
          THEN ROUND((${vendors.totalHires}::decimal / ${vendors.totalSubmissions}) * 100, 2) 
          ELSE 0 END`,
      })
      .from(vendors)
      .where(eq(vendors.id, req.params.id))
      .limit(1);

    if (!vendor) return res.status(404).json({ error: "Vendor not found" });

    res.json({ data: vendor });
  } catch (err) {
    next(err);
  }
};
