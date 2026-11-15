import { z } from "zod";
import { objectIdSchema } from "../utils/objectId.js";

const profileStatuses = ["pending", "approved", "rejected", "suspended"] as const;
const adminSetStatuses = ["approved", "rejected", "suspended"] as const;

export const adminDriversQuerySchema = z.object({
  status: z.enum(profileStatuses).default("pending"),
  page: z.coerce.number().int().min(1).default(1),
});

export const adminDriverIdParamSchema = z.object({
  id: objectIdSchema,
});

export const adminSetDriverStatusSchema = z
  .object({
    status: z.enum(adminSetStatuses),
    reason: z.string().trim().max(500).optional(),
  })
  .refine(
    (data) =>
      data.status !== "rejected" ||
      (data.reason !== undefined && data.reason.length >= 3),
    { message: "Rejection reason is required (min 3 characters)", path: ["reason"] }
  );

export { profileStatuses, adminSetStatuses };