import mongoose, { type InferSchemaType, Schema } from "mongoose";

const roles = ["customer", "driver", "admin"] as const;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, enum: roles, required: true },
    /** e.g. google, phone (OTP added later) */
    authProvider: { type: String, trim: true },
    /** Provider-specific id (Google sub, phone E.164, etc.) */
    authId: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

userSchema.index({ authProvider: 1, authId: 1 });

export type UserDocument = InferSchemaType<typeof userSchema>;
export type UserRole = (typeof roles)[number];

export const User = mongoose.models.User ?? mongoose.model("User", userSchema);