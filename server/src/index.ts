import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { connectDb } from "./db/connect.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.routes.js";
import { meRouter } from "./routes/me.routes.js";
import { driversRouter } from "./routes/drivers.routes.js";
import { placesRouter } from "./routes/places.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { reportsRouter } from "./routes/reports.routes.js";
import { uploadsRouter } from "./routes/uploads.routes.js";

const app = express();

app.use(helmet());
app.use(express.json({ limit: "1mb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminCandidates = [
  path.resolve(__dirname, "admin"),
  path.resolve(__dirname, "../admin"),
];
const adminDir =
  adminCandidates.find((d) => fs.existsSync(d)) ?? adminCandidates[1];
app.use("/admin", express.static(adminDir));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "local-drivers-api",
    env: env.NODE_ENV,
  });
});

app.use("/api/places", placesRouter);
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/me", meRouter);
app.use("/api/drivers", driversRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/admin", adminRouter);

app.use(errorHandler);

async function main(): Promise<void> {
  await connectDb();
  app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});