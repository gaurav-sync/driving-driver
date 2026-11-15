import { z } from "zod";
import { phoneSchema } from "../utils/phone.js";
import { objectIdSchema } from "../utils/objectId.js";

const vehicleTypes = [
  "hatchback",
  "sedan",
  "suv",
  "innova",
  "tempo traveller",
  "other",
] as const;

const photoUrlSchema = z
  .string()
  .url()
  .max(500)
  .refine((u) => u.startsWith("https://"), "Photo URL must use HTTPS");

const profileFieldsSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  phone: phoneSchema,
  basePlaceId: objectIdSchema,
  coveredPlaceIds: z.array(objectIdSchema).max(50).default([]),
  coveredDistricts: z
    .array(z.string().trim().min(1).max(100))
    .max(30)
    .default([]),
  maxDistanceKm: z.number().min(0).max(500).optional(),
  vehicleType: z.enum(vehicleTypes),
  vehicleModel: z.string().trim().min(1).max(80),
  seats: z.number().int().min(1).max(20),
  isAC: z.boolean(),
  ratePerKm: z.number().min(0).max(500),
  dayRate: z.number().min(0).max(100_000),
  photos: z.array(photoUrlSchema).max(6).default([]),
  bio: z.string().trim().max(300).optional(),
  languages: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
});

export const createDriverProfileSchema = profileFieldsSchema;

export const updateDriverProfileSchema = profileFieldsSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const toggleActiveSchema = z.object({
  isActive: z.boolean().optional(),
});

export const driverSearchQuerySchema = z.object({
  placeId: objectIdSchema,
  vehicleType: z.enum(vehicleTypes).optional(),
  minSeats: z.coerce.number().int().min(1).optional(),
  ac: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  page: z.coerce.number().int().min(1).default(1),
});

export const driverIdParamSchema = z.object({
  id: objectIdSchema,
});

export { vehicleTypes };