import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createReportSchema } from "../schemas/report.schema.js";
import { createReport } from "../services/reports.service.js";

export const reportsRouter = Router();

reportsRouter.post(
  "/",
  requireAuth,
  requireRole("customer"),
  validate({ body: createReportSchema }),
  async (req, res, next) => {
    try {
      const report = await createReport(req.auth!.userId, req.body);
      res.status(201).json({ report });
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "driver_not_found") {
          res.status(404).json({ error: "driver_not_found" });
          return;
        }
        if (err.message === "already_reported") {
          res.status(409).json({ error: "already_reported" });
          return;
        }
      }
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code: number }).code === 11000
      ) {
        res.status(409).json({ error: "already_reported" });
        return;
      }
      next(err);
    }
  }
);