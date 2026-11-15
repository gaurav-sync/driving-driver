import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { searchPlaces } from "../services/places.service.js";

const placesQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, "Query is required")
    .max(100, "Query too long"),
});

export const placesRouter = Router();

placesRouter.get(
  "/",
  validate({ query: placesQuerySchema }),
  async (req, res, next) => {
    try {
      const { q } = req.query as z.infer<typeof placesQuerySchema>;
      const places = await searchPlaces(q);
      res.json({ places });
    } catch (err) {
      next(err);
    }
  }
);