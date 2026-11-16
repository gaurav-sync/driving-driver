import type { RequestHandler } from "express";
import serverless from "serverless-http";
import { createApp } from "../src/createApp.js";
import { connectDb } from "../src/db/connect.js";

const app = createApp();
let dbPromise: Promise<void> | null = null;

const ensureDb: RequestHandler = async (_req, _res, next) => {
  try {
    if (!dbPromise) {
      dbPromise = connectDb();
    }
    await dbPromise;
    next();
  } catch (err) {
    next(err);
  }
};

app.use(ensureDb);

export default serverless(app);