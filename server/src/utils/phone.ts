import { z } from "zod";

/** Normalize Indian mobile numbers to 10 digits (no country code). */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length === 10) {
    return digits;
  }
  return digits;
}

export const phoneSchema = z
  .string()
  .trim()
  .min(1)
  .transform(normalizePhone)
  .refine((v) => /^[6-9]\d{9}$/.test(v), {
    message: "Enter a valid 10-digit Indian mobile number",
  });