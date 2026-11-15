import Constants from "expo-constants";
import { z } from "zod";

/**
 * Expo inlines EXPO_PUBLIC_* at build time. Validate early so misconfiguration is obvious.
 */
const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z
    .string()
    .url()
    .default("http://10.0.2.2:3000"),
  /** Web client ID — must match server GOOGLE_CLIENT_ID for token verification */
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: z.string().optional(),
  /** Android OAuth client ID (Google Cloud Console → Android app) */
  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: z.string().optional(),
  /** @deprecated use EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID */
  EXPO_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
});

function parseEnv() {
  const extraUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  const fromExtra =
    extraUrl &&
    !extraUrl.includes("REPLACE") &&
    !extraUrl.includes("onrender.com/REPLACE")
      ? extraUrl
      : undefined;
  const raw = {
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL ?? fromExtra,
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ??
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID:
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    EXPO_PUBLIC_GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  };
  return envSchema.parse(raw);
}

export const appEnv = parseEnv();