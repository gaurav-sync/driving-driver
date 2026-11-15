import * as ImageManipulator from "expo-image-manipulator";
import { getUploadSign } from "../api/driverProfile";

/** Compress on device (~≤1MB target) and upload to Cloudinary. */
export async function compressAndUploadVehiclePhoto(
  token: string,
  localUri: string
): Promise<string> {
  const manipulated = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: 1200 } }],
    { compress: 0.72, format: ImageManipulator.SaveFormat.JPEG }
  );

  const sign = await getUploadSign(token);
  const form = new FormData();
  form.append("file", {
    uri: manipulated.uri,
    type: "image/jpeg",
    name: "vehicle.jpg",
  } as unknown as Blob);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  form.append("signature", sign.signature);
  form.append("folder", sign.folder);

  const response = await fetch(sign.uploadUrl, {
    method: "POST",
    body: form,
  });
  const json = (await response.json()) as { secure_url?: string; error?: { message: string } };
  if (!response.ok || !json.secure_url) {
    throw new Error(json.error?.message ?? "upload_failed");
  }
  return json.secure_url;
}