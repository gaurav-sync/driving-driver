import type { ExpoConfig, ConfigContext } from "expo/config";

/** Bakes production API URL into release APK (set in EAS env or app/.env). */
export default ({ config }: ConfigContext): ExpoConfig => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const extra: Record<string, unknown> = { ...(config.extra ?? {}) };
  if (apiUrl) {
    extra.apiUrl = apiUrl;
  }
  if (process.env.EAS_PROJECT_ID) {
    extra.eas = {
      ...(typeof extra.eas === "object" && extra.eas ? extra.eas : {}),
      projectId: process.env.EAS_PROJECT_ID,
    };
  }

  return {
    ...config,
    name: "Local Drivers",
    slug: "local-drivers",
    android: {
      ...config.android,
      package: "com.localdrivers.karmala",
    },
    extra,
  };
};