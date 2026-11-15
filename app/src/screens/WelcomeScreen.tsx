import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LanguagePicker } from "../components/LanguagePicker";
import { PrimaryButton } from "../components/PrimaryButton";
import { useI18n } from "../i18n/I18nContext";
import { useAuth } from "../hooks/useAuth";
import { useGoogleSignIn } from "../hooks/useGoogleSignIn";
import { ApiError } from "../api/http";

export function WelcomeScreen() {
  const { t } = useI18n();
  const { signInWithGoogleIdToken } = useAuth();
  const { isConfigured, isReady, promptAsync, idToken, response } =
    useGoogleSignIn();
  const [busy, setBusy] = useState(false);
  const handledToken = useRef<string | null>(null);

  useEffect(() => {
    if (!idToken || handledToken.current === idToken) return;
    handledToken.current = idToken;
    (async () => {
      setBusy(true);
      try {
        await signInWithGoogleIdToken(idToken);
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.status === 0
              ? "Could not reach the server. Check your internet and API URL."
              : `Sign-in failed (${err.message}).`
            : "Sign-in failed. Please try again.";
        Alert.alert("Sign-in error", message);
      } finally {
        setBusy(false);
      }
    })();
  }, [idToken, signInWithGoogleIdToken]);

  useEffect(() => {
    if (response?.type === "error") {
      Alert.alert("Google Sign-In", "Google sign-in was cancelled or failed.");
    }
  }, [response]);

  const onGooglePress = async () => {
    if (!isConfigured) {
      Alert.alert(
        "Not configured",
        "Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to app/.env and restart Expo."
      );
      return;
    }
    try {
      await promptAsync();
    } catch {
      Alert.alert("Google Sign-In", "Could not open Google sign-in.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <LanguagePicker />
        <Text style={styles.title}>{t("appName")}</Text>
        <Text style={styles.subtitle}>{t("welcomeTagline")}</Text>
        <PrimaryButton
          label={t("continueGoogle")}
          onPress={onGooglePress}
          loading={busy}
          disabled={!isReady || busy}
        />
        {!isConfigured ? (
          <Text style={styles.warn}>Google client ID is not set in app/.env</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    gap: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    color: "#444",
    textAlign: "center",
    marginBottom: 12,
  },
  warn: {
    fontSize: 14,
    color: "#B71C1C",
    textAlign: "center",
  },
});