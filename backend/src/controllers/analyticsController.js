import { db } from "../db/index.js";
import {
  vendors,
  candidateSubmissions,
  jobRequisitions,
  candidates,
} from "../db/schema.js";
import { eq, sql, gte, and } from "drizzle-orm";

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalRequisitions,
      openRequisitions,
      totalSubmissions,
      totalVendors,
      recentHires,
    ] = await Promise.all([
      db.select({ count: sql`count(*)` }).from(jobRequisitions),
      db
        .select({ count: sql`count(*)` })
        .from(jobRequisitions)
        .where(eq(jobRequisitions.status, "open")),
      db.select({ count: sql`count(*)` }).from(candidateSubmissions),
      db
        .select({ count: sql`count(*)` })
        .from(vendors)
        .where(eq(vendors.status, "active")),
      db
        .select({ count: sql`count(*)` })
        .from(candidateSubmissions)
        .where(eq(candidateSubmissions.status, "hired")),
    ]);

    // Submission pipeline breakdown
    const pipelineStats = await db
      .select({
        status: candidateSubmissions.status,
        count: sql`count(*)`,
      })
      .from(candidateSubmissions)
      .groupBy(candidateSubmissions.status);

    // Top performing vendors
    const topVendors = await db
      .select({
        id: vendors.id,
        companyName: vendors.companyName,
        totalSubmissions: vendors.totalSubmissions,
        totalHires: vendors.totalHires,
        rating: vendors.rating,
        hiringRatio: sql`CASE WHEN ${vendors.totalSubmissions} > 0 
          THEN ROUND((${vendors.totalHires}::decimal / ${vendors.totalSubmissions}) * 100, 2) 
          ELSE 0 END`,
      })
      .from(vendors)
      .where(eq(vendors.status, "active"))
      .orderBy(sql`total_hires desc`)
      .limit(5);

    res.json({
      data: {
        totals: {
          requisitions: Number(totalRequisitions[0].count),
          openRequisitions: Number(openRequisitions[0].count),
          submissions: Number(totalSubmissions[0].count),
          activeVendors: Number(totalVendors[0].count),
          hires: Number(recentHires[0].count),
        },
        pipeline: pipelineStats.map((s) => ({
          status: s.status,
          count: Number(s.count),
        })),
        topVendors,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getVendorReport = async (req, res, next) => {
  try {
    const vendorReport = await db
      .select({
        id: vendors.id,
        companyName: vendors.companyName,
        status: vendors.status,
        rating: vendors.rating,
        totalSubmissions: vendors.totalSubmissions,
        totalHires: vendors.totalHires,
        hiringRatio: sql`CASE WHEN ${vendors.totalSubmissions} > 0 
          THEN ROUND((${vendors.totalHires}::decimal / ${vendors.totalSubmissions}) * 100, 2) 
          ELSE 0 END`,
      })
      .from(vendors)
      .orderBy(sql`total_submissions desc`);

    res.json({ data: vendorReport });
  } catch (err) {
    next(err);
  }
};

export const getHiringFunnel = async (req, res, next) => {
  try {
    const { requisitionId } = req.query;

    const conditions = requisitionId
      ? [eq(candidateSubmissions.requisitionId, requisitionId)]
      : [];

    const funnel = await db
      .select({
        status: candidateSubmissions.status,
        count: sql`count(*)`,
      })
      .from(candidateSubmissions)
      .where(conditions.length ? and(...conditions) : undefined)
      .groupBy(candidateSubmissions.status)
      .orderBy(sql`count(*) desc`);

    res.json({ data: funnel });
  } catch (err) {
    next(err);
  }
};
