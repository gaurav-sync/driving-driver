import mongoose, { type InferSchemaType, Schema, Types } from "mongoose";

const vehicleTypes = [
  "hatchback",
  "sedan",
  "suv",
  "innova",
  "tempo traveller",
  "other",
] as const;

const profileStatuses = ["pending", "approved", "rejected", "suspended"] as const;

const driverProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    basePlaceId: {
      type: Schema.Types.ObjectId,
      ref: "Place",
      required: true,
      index: true,
    },
    coveredPlaceIds: [{ type: Schema.Types.ObjectId, ref: "Place" }],
    coveredDistricts: [{ type: String, trim: true }],
    maxDistanceKm: { type: Number },
    vehicleType: { type: String, enum: vehicleTypes, required: true },
    vehicleModel: { type: String, required: true, trim: true },
    seats: { type: Number, required: true, min: 1 },
    isAC: { type: Boolean, required: true },
    ratePerKm: { type: Number, required: true, min: 0 },
    dayRate: { type: Number, required: true, min: 0 },
    photos: { type: [String], default: [], validate: [(v: string[]) => v.length <= 6, "Max 6 photos"] },
    bio: { type: String, maxlength: 300, trim: true },
    languages: { type: [String], default: [] },
    status: {
      type: String,
      enum: profileStatuses,
      default: "pending",
      index: true,
    },
    /** Admin rejection or suspension message shown to driver (optional). */
    statusNote: { type: String, trim: true, maxlength: 500 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

driverProfileSchema.index({ coveredPlaceIds: 1 });
driverProfileSchema.index({ coveredDistricts: 1 });

export type DriverProfileDocument = InferSchemaType<typeof driverProfileSchema>;
export type VehicleType = (typeof vehicleTypes)[number];
export type ProfileStatus = (typeof profileStatuses)[number];

export const DriverProfile =
  mongoose.models.DriverProfile ??
  mongoose.model("DriverProfile", driverProfileSchema);

export type ObjectId = Types.ObjectId;