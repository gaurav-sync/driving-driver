import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createVehiclePhotoUploadSign } from "../services/cloudinary.service.js";

export const uploadsRouter = Router();

uploadsRouter.post(
  "/sign",
  requireAuth,
  requireRole("driver"),
  (req, res, next) => {
    try {
      const signed = createVehiclePhotoUploadSign(req.auth!.userId);
      res.json(signed);
    } catch (err) {
      if (err instanceof Error && err.message === "cloudinary_not_configured") {
        res.status(503).json({ error: "uploads_not_configured" });
        return;
      }
      next(err);
    }
  }
);