/**
 * One-time (re-runnable) import of places CSV into MongoDB.
 *
 * Default file: scripts/data/places-seed.csv (Karmala taluka sample + format for full LGD export).
 * Override: PLACES_CSV_PATH=/path/to/lgd-cleaned.csv
 *
 * CSV columns (header required):
 * name,type,state,district,taluka,lgdCode,altNames
 * altNames: pipe-separated alternate spellings (optional)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import mongoose from "mongoose";
import { config as loadDotenv } from "dotenv";
import { z } from "zod";
import { Place } from "../src/models/Place.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: path.resolve(__dirname, "../.env") });

const rowSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(["village", "town", "city"]),
  state: z.string().trim().min(1),
  district: z.string().trim().min(1),
  taluka: z.string().trim().min(1),
  lgdCode: z.string().trim().min(1),
  altNames: z.string().optional(),
});

function parseAltNames(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

function readCsv(filePath: string): z.infer<typeof rowSchema>[] {
  const content = fs.readFileSync(filePath, "utf8");
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as Record<string, string>[];

  return records.map((row, index) => {
    const parsed = rowSchema.safeParse({
      name: row.name ?? row.Name ?? row.VILLAGE_NAME,
      type: (row.type ?? row.Type ?? "village").toLowerCase(),
      state: row.state ?? row.State ?? row.STATE_NAME,
      district: row.district ?? row.District ?? row.DISTRICT_NAME,
      taluka: row.taluka ?? row.Taluka ?? row.SUB_DISTRICT_NAME,
      lgdCode: String(row.lgdCode ?? row.LGD_CODE ?? row.lgd_code ?? "").trim(),
      altNames: row.altNames ?? row.alt_names,
    });
    if (!parsed.success) {
      throw new Error(
        `Invalid row ${index + 2}: ${JSON.stringify(parsed.error.flatten())}`
      );
    }
    return parsed.data;
  });
}

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Set MONGODB_URI in server/.env");
    process.exit(1);
  }

  const defaultCsv = path.resolve(__dirname, "data/places-seed.csv");
  const csvPath = process.env.PLACES_CSV_PATH
    ? path.resolve(process.env.PLACES_CSV_PATH)
    : defaultCsv;

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }

  const rows = readCsv(csvPath);
  console.log(`Importing ${rows.length} places from ${csvPath}`);

  await mongoose.connect(uri);

  let upserted = 0;
  for (const row of rows) {
    await Place.updateOne(
      { lgdCode: row.lgdCode },
      {
        $set: {
          name: row.name,
          type: row.type,
          state: row.state,
          district: row.district,
          taluka: row.taluka,
          altNames: parseAltNames(row.altNames),
        },
      },
      { upsert: true }
    );
    upserted += 1;
  }

  const count = await Place.countDocuments();
  console.log(`Done. Processed ${upserted} rows. Total places in DB: ${count}.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});