import type { DriverOwnProfile, DriverProfilePayload } from "../types/driverProfile";
import { ApiError, apiFetch } from "./http";

export async function getMyDriverProfile(
  token: string
): Promise<DriverOwnProfile | null> {
  try {
    const res = await apiFetch<{ profile: DriverOwnProfile }>(
      "/api/drivers/profile",
      { token }
    );
    return res.profile;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function createDriverProfile(
  token: string,
  body: DriverProfilePayload
): Promise<DriverOwnProfile> {
  const res = await apiFetch<{ profile: DriverOwnProfile }>(
    "/api/drivers/profile",
    { method: "POST", token, body: JSON.stringify(body) }
  );
  return res.profile;
}

export async function updateDriverProfile(
  token: string,
  body: Partial<DriverProfilePayload>
): Promise<DriverOwnProfile> {
  const res = await apiFetch<{ profile: DriverOwnProfile }>(
    "/api/drivers/profile",
    { method: "PUT", token, body: JSON.stringify(body) }
  );
  return res.profile;
}

export async function setDriverActive(
  token: string,
  isActive?: boolean
): Promise<DriverOwnProfile> {
  const res = await apiFetch<{ profile: DriverOwnProfile }>(
    "/api/drivers/profile/active",
    {
      method: "PATCH",
      token,
      body: JSON.stringify(
        isActive === undefined ? {} : { isActive }
      ),
    }
  );
  return res.profile;
}

export type SignedUpload = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  uploadUrl: string;
};

export async function getUploadSign(token: string): Promise<SignedUpload> {
  return apiFetch<SignedUpload>("/api/uploads/sign", {
    method: "POST",
    token,
  });
}