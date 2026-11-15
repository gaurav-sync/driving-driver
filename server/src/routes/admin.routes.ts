import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  adminDriverIdParamSchema,
  adminDriversQuerySchema,
  adminSetDriverStatusSchema,
} from "../schemas/admin.schema.js";
import {
  getDriverForAdmin,
  listDriversForAdmin,
  setDriverStatus,
} from "../services/admin.service.js";
import { listOpenReportsForAdmin, resolveReport } from "../services/reports.service.js";
import { objectIdSchema } from "../utils/objectId.js";
import { z } from "zod";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("admin"));

adminRouter.get(
  "/drivers",
  validate({ query: adminDriversQuerySchema }),
  async (req, res, next) => {
    try {
      const query = req.query as unknown as Parameters<
        typeof listDriversForAdmin
      >[0];
      const result = await listDriversForAdmin(query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

adminRouter.get(
  "/drivers/:id",
  validate({ params: adminDriverIdParamSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params as { id: string };
      const driver = await getDriverForAdmin(id);
      if (!driver) {
        res.status(404).json({ error: "not_found" });
        return;
      }
      res.json({ driver });
    } catch (err) {
      next(err);
    }
  }
);

adminRouter.patch(
  "/drivers/:id/status",
  validate({
    params: adminDriverIdParamSchema,
    body: adminSetDriverStatusSchema,
  }),
  async (req, res, next) => {
    try {
      const { id } = req.params as { id: string };
      const driver = await setDriverStatus(id, req.body);
      if (!driver) {
        res.status(404).json({ error: "not_found" });
        return;
      }
      res.json({ driver });
    } catch (err) {
      next(err);
    }
  }
);

const adminReportsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
});

adminRouter.get(
  "/reports",
  validate({ query: adminReportsQuerySchema }),
  async (req, res, next) => {
    try {
      const { page } = req.query as unknown as z.infer<
        typeof adminReportsQuerySchema
      >;
      const result = await listOpenReportsForAdmin(page);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

const reportIdParamSchema = z.object({ reportId: objectIdSchema });

adminRouter.patch(
  "/reports/:reportId/resolve",
  validate({ params: reportIdParamSchema }),
  async (req, res, next) => {
    try {
      const { reportId } = req.params as { reportId: string };
      const report = await resolveReport(reportId);
      if (!report) {
        res.status(404).json({ error: "not_found" });
        return;
      }
      res.json({ report });
    } catch (err) {
      next(err);
    }
  }
);