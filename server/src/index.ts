import { env } from "./config/env.js";
import { createApp } from "./createApp.js";
import { connectDb } from "./db/connect.js";

const app = createApp();

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