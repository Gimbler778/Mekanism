import { db } from "../db/index.js";
import { auditLogs } from "../db/schema.js";

export const auditLog = (action, resourceType) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      if (res.statusCode < 400 && req.user) {
        try {
          const resourceId =
            req.params.id ||
            (body?.data?.id) ||
            null;

          await db.insert(auditLogs).values({
            userId: req.user.id,
            action,
            resourceType,
            resourceId,
            metadata: {
              method: req.method,
              path: req.path,
              body: req.method !== "GET" ? req.body : undefined,
            },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
          });
        } catch (err) {
          console.error("Audit log error:", err);
        }
      }
      return originalJson(body);
    };

    next();
  };
};
