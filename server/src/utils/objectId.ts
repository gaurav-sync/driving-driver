import mongoose from "mongoose";
import { z } from "zod";

export const objectIdSchema = z
  .string()
  .refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid id",
  });

export function toObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}