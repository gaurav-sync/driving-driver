import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useMemo } from "react";
import { appEnv } from "../config/env";

WebBrowser.maybeCompleteAuthSession();

/**
 * Google ID token for backend /api/auth/google.
 * Configure Web + Android client IDs in Google Cloud Console.
 */
export function useGoogleSignIn() {
  const webClientId = appEnv.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const androidClientId = appEnv.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId,
    androidClientId: androidClientId ?? webClientId,
    responseType: "id_token",
    selectAccount: true,
  });

  const isReady = Boolean(request) && Boolean(webClientId);

  const idToken = useMemo(() => {
    if (response?.type !== "success") return null;
    return response.params.id_token ?? response.authentication?.idToken ?? null;
  }, [response]);

  return {
    isReady,
    isConfigured: Boolean(webClientId),
    promptAsync,
    response,
    idToken,
  };
}