import { apiFetch } from "./http";

export async function createReport(
  token: string,
  body: { driverId: string; reason: string; note?: string }
): Promise<void> {
  await apiFetch("/api/reports", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}