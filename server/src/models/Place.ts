import mongoose, { type InferSchemaType, Schema } from "mongoose";

const placeTypes = ["village", "town", "city"] as const;

const placeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    altNames: { type: [String], default: [] },
    type: { type: String, enum: placeTypes, required: true },
    state: { type: String, required: true, trim: true, index: true },
    district: { type: String, required: true, trim: true, index: true },
    taluka: { type: String, required: true, trim: true, index: true },
    lgdCode: { type: String, required: true, trim: true, unique: true },
  },
  { timestamps: false }
);

placeSchema.index({ name: "text", altNames: "text" });

export type PlaceDocument = InferSchemaType<typeof placeSchema>;
export type PlaceType = (typeof placeTypes)[number];

export const Place =
  mongoose.models.Place ?? mongoose.model("Place", placeSchema);