import mongoose from "mongoose";
import { env } from "../config/env.js";

declare global {
  // eslint-disable-next-line no-var
  var __mongoConnectPromise: Promise<typeof mongoose> | undefined;
}

export async function connectDb(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Add it in Vercel/Render env or server/.env."
    );
  }

  if (globalThis.__mongoConnectPromise) {
    await globalThis.__mongoConnectPromise;
    return;
  }

  globalThis.__mongoConnectPromise = mongoose.connect(env.MONGODB_URI);
  await globalThis.__mongoConnectPromise;
  console.log("Connected to MongoDB");
}