import { Router } from "express";
import * as authController from "../controllers/authController.js";
import * as vendorController from "../controllers/vendorController.js";
import * as requisitionController from "../controllers/requisitionController.js";
import * as candidateController from "../controllers/candidateController.js";
import * as analyticsController from "../controllers/analyticsController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { auditLog } from "../middleware/auditLog.js";

const router = Router();

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/me", authenticate, authController.me);

// ─── Vendors ──────────────────────────────────────────────────────────────────
router.get(
  "/vendors",
  authenticate,
  authorize("admin", "hr", "hiring_manager"),
  vendorController.getVendors
);
router.get(
  "/vendors/:id",
  authenticate,
  authorize("admin", "hr", "hiring_manager"),
  vendorController.getVendorById
);
router.post(
  "/vendors",
  authenticate,
  authorize("admin", "hr"),
  auditLog("create", "vendor"),
  vendorController.createVendor
);
router.patch(
  "/vendors/:id",
  authenticate,
  authorize("admin", "hr"),
  auditLog("update", "vendor"),
  vendorController.updateVendor
);
router.get(
  "/vendors/:id/performance",
  authenticate,
  vendorController.getVendorPerformance
);

// ─── Requisitions ─────────────────────────────────────────────────────────────
router.get(
  "/requisitions",
  authenticate,
  requisitionController.getRequisitions
);
router.get(
  "/requisitions/:id",
  authenticate,
  requisitionController.getRequisitionById
);
router.post(
  "/requisitions",
  authenticate,
  authorize("admin", "hr", "hiring_manager"),
  auditLog("create", "requisition"),
  requisitionController.createRequisition
);
router.patch(
  "/requisitions/:id",
  authenticate,
  authorize("admin", "hr", "hiring_manager"),
  auditLog("update", "requisition"),
  requisitionController.updateRequisition
);
router.post(
  "/requisitions/:id/approve",
  authenticate,
  authorize("admin", "hr"),
  auditLog("approve", "requisition"),
  requisitionController.approveRequisition
);
router.post(
  "/requisitions/:id/vendors",
  authenticate,
  authorize("admin", "hr"),
  requisitionController.assignVendors
);

// ─── Candidates / Submissions ─────────────────────────────────────────────────
router.post(
  "/submissions",
  authenticate,
  auditLog("create", "submission"),
  candidateController.submitCandidate
);
router.get(
  "/submissions",
  authenticate,
  candidateController.getSubmissions
);
router.patch(
  "/submissions/:id/status",
  authenticate,
  authorize("admin", "hr", "hiring_manager"),
  auditLog("update", "submission"),
  candidateController.updateSubmissionStatus
);
router.get(
  "/candidates/:id",
  authenticate,
  candidateController.getCandidateById
);

// ─── Analytics ────────────────────────────────────────────────────────────────
router.get(
  "/analytics/dashboard",
  authenticate,
  authorize("admin", "hr", "hiring_manager"),
  analyticsController.getDashboardStats
);
router.get(
  "/analytics/vendor-report",
  authenticate,
  authorize("admin", "hr"),
  analyticsController.getVendorReport
);
router.get(
  "/analytics/hiring-funnel",
  authenticate,
  authorize("admin", "hr", "hiring_manager"),
  analyticsController.getHiringFunnel
);

export default router;
