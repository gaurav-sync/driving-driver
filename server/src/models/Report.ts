import mongoose, { type InferSchemaType, Schema } from "mongoose";

const reportStatuses = ["open", "resolved"] as const;

const reportSchema = new Schema(
  {
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "DriverProfile",
      required: true,
      index: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: { type: String, required: true, trim: true },
    note: { type: String, trim: true },
    status: {
      type: String,
      enum: reportStatuses,
      default: "open",
      index: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

reportSchema.index({ driverId: 1, reportedBy: 1 }, { unique: true });

export type ReportDocument = InferSchemaType<typeof reportSchema>;

export const Report =
  mongoose.models.Report ?? mongoose.model("Report", reportSchema);