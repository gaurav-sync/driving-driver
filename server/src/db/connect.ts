import mongoose from "mongoose";
import { env } from "../config/env.js";

export async function connectDb(): Promise<void> {
  if (!env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Copy server/.env.example to server/.env and add your Atlas connection string."
    );
  }
  await mongoose.connect(env.MONGODB_URI);
  console.log("Connected to MongoDB");
}