import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createDriverProfileSchema,
  driverIdParamSchema,
  driverSearchQuerySchema,
  toggleActiveSchema,
  updateDriverProfileSchema,
} from "../schemas/driverProfile.schema.js";
import {
  createDriverProfile,
  getApprovedDriverById,
  getOwnDriverProfile,
  searchDrivers,
  setDriverActive,
  updateDriverProfile,
} from "../services/driverProfile.service.js";

export const driversRouter = Router();

driversRouter.get(
  "/",
  validate({ query: driverSearchQuerySchema }),
  async (req, res, next) => {
    try {
      const query = req.query as unknown as Parameters<typeof searchDrivers>[0];
      const result = await searchDrivers(query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

driversRouter.get(
  "/profile",
  requireAuth,
  requireRole("driver"),
  async (req, res, next) => {
    try {
      const profile = await getOwnDriverProfile(req.auth!.userId);
      if (!profile) {
        res.status(404).json({ error: "profile_not_found" });
        return;
      }
      res.json({ profile });
    } catch (err) {
      next(err);
    }
  }
);

driversRouter.post(
  "/profile",
  requireAuth,
  requireRole("driver"),
  validate({ body: createDriverProfileSchema }),
  async (req, res, next) => {
    try {
      const profile = await createDriverProfile(
        req.auth!.userId,
        req.body
      );
      res.status(201).json({ profile });
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "profile_exists") {
          res.status(409).json({ error: "profile_exists" });
          return;
        }
        if (err.message === "invalid_place") {
          res.status(400).json({ error: "invalid_place" });
          return;
        }
      }
      next(err);
    }
  }
);

driversRouter.put(
  "/profile",
  requireAuth,
  requireRole("driver"),
  validate({ body: updateDriverProfileSchema }),
  async (req, res, next) => {
    try {
      const profile = await updateDriverProfile(req.auth!.userId, req.body);
      if (!profile) {
        res.status(404).json({ error: "profile_not_found" });
        return;
      }
      res.json({ profile });
    } catch (err) {
      if (err instanceof Error && err.message === "invalid_place") {
        res.status(400).json({ error: "invalid_place" });
        return;
      }
      next(err);
    }
  }
);

driversRouter.patch(
  "/profile/active",
  requireAuth,
  requireRole("driver"),
  validate({ body: toggleActiveSchema }),
  async (req, res, next) => {
    try {
      const body = req.body as { isActive?: boolean };
      const profile = await setDriverActive(req.auth!.userId, body.isActive);
      if (!profile) {
        res.status(404).json({ error: "profile_not_found" });
        return;
      }
      res.json({ profile });
    } catch (err) {
      next(err);
    }
  }
);

driversRouter.get(
  "/:id",
  validate({ params: driverIdParamSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params as { id: string };
      const driver = await getApprovedDriverById(id);
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