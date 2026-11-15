import crypto from "node:crypto";
import { env } from "../config/env.js";

export type SignedUpload = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  uploadUrl: string;
};

function assertCloudinaryConfig(): {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
} {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("cloudinary_not_configured");
  }
  return {
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    apiSecret: CLOUDINARY_API_SECRET,
  };
}

/** Signed params for direct client upload (unsigned preset avoided for tighter control). */
export function createVehiclePhotoUploadSign(userId: string): SignedUpload {
  const { cloudName, apiKey, apiSecret } = assertCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `local-drivers/vehicles/${userId}`;

  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder,
  };

  const sorted = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(sorted + apiSecret)
    .digest("hex");

  return {
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  };
}