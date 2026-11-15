import { z } from "zod";
import { objectIdSchema } from "../utils/objectId.js";

export const createReportSchema = z.object({
  driverId: objectIdSchema,
  reason: z.string().trim().min(3).max(200),
  note: z.string().trim().max(500).optional(),
});