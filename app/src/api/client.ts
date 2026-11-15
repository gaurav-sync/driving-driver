import { appEnv } from "../config/env";

/** Base URL for REST calls (Step 6+). */
export const API_BASE_URL = appEnv.EXPO_PUBLIC_API_URL.replace(/\/$/, "");