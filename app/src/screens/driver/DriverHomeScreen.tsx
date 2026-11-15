import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { getMyDriverProfile, setDriverActive } from "../../api/driverProfile";
import { ApiError } from "../../api/http";
import { profileToDraft, useRegistration } from "../../context/RegistrationContext";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ErrorRetry } from "../../components/ErrorRetry";
import { useAuth } from "../../hooks/useAuth";
import type { DriverStackParamList } from "../../navigation/types";
import type { DriverOwnProfile } from "../../types/driverProfile";

type Props = NativeStackScreenProps<DriverStackParamList, "DriverHome">;

const statusLabel: Record<string, string> = {
  pending: "Pending admin approval",
  approved: "Approved — visible to customers",
  rejected: "Rejected",
  suspended: "Suspended",
};

export function DriverHomeScreen({ navigation }: Props) {
  const { state, signOut } = useAuth();
  const { resetDraft, setMode } = useRegistration();
  const [profile, setProfile] = useState<DriverOwnProfile | null | undefined>(
    undefined
  );
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  const token = state.status === "signedIn" ? state.token : "";

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const p = await getMyDriverProfile(token);
      setProfile(p);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 0
          ? "Could not load your profile."
          : "Something went wrong."
      );
      setProfile(null);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onToggleActive = async (value: boolean) => {
    if (!token) return;
    setToggling(true);
    try {
      const updated = await setDriverActive(token, value);
      setProfile(updated);
    } catch {
      setError("Could not update active status.");
    } finally {
      setToggling(false);
    }
  };

  const startRegistration = (edit: boolean) => {
    setMode(edit ? "edit" : "create");
    if (edit && profile) {
      resetDraft(profileToDraft(profile));
    } else {
      const user = state.status === "signedIn" ? state.user : null;
      resetDraft({
        fullName: user?.name ?? "",
        phone: user?.phone ?? "",
      });
    }
    navigation.navigate("RegPersonal");
  };

  if (profile === undefined && !error) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error && profile === null) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorRetry message={error} onRetry={load} />
      </SafeAreaView>
    );
  }

  const hasProfile = Boolean(profile);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Driver home</Text>
        {state.status === "signedIn" ? (
          <Text style={styles.greet}>Hi, {state.user.name}</Text>
        ) : null}

        {!hasProfile ? (
          <>
            <Text style={styles.body}>
              List your car and contact details so customers in your area can
              find you and call directly.
            </Text>
            <PrimaryButton
              label="Register as driver"
              onPress={() => startRegistration(false)}
            />
          </>
        ) : (
          <>
            <View style={[styles.badge, badgeStyle(profile!.status)]}>
              <Text style={styles.badgeText}>
                {statusLabel[profile!.status] ?? profile!.status}
              </Text>
            </View>
            {profile!.statusNote ? (
              <Text style={styles.note}>{profile!.statusNote}</Text>
            ) : null}

            {profile!.status === "approved" ? (
              <View style={styles.row}>
                <Text style={styles.activeLabel}>Show in search</Text>
                <Switch
                  value={profile!.isActive}
                  onValueChange={onToggleActive}
                  disabled={toggling}
                />
              </View>
            ) : null}

            <PrimaryButton
              label="Edit profile"
              onPress={() => startRegistration(true)}
              variant="secondary"
            />
            <PrimaryButton
              label="Customer preview"
              onPress={() => navigation.navigate("DriverPreview")}
            />
          </>
        )}

        <Pressable onPress={signOut} style={styles.signOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function badgeStyle(status: string) {
  if (status === "approved") return styles.badgeOk;
  if (status === "rejected" || status === "suspended") return styles.badgeBad;
  return styles.badgePending;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 24, gap: 16 },
  title: { fontSize: 28, fontWeight: "800" },
  greet: { fontSize: 18, color: "#444" },
  body: { fontSize: 17, lineHeight: 26, color: "#444" },
  badge: { padding: 14, borderRadius: 12 },
  badgeText: { fontSize: 17, fontWeight: "700" },
  badgePending: { backgroundColor: "#FFF8E1" },
  badgeOk: { backgroundColor: "#E8F5E9" },
  badgeBad: { backgroundColor: "#FFEBEE" },
  note: { fontSize: 15, color: "#B71C1C", lineHeight: 22 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  activeLabel: { fontSize: 18, fontWeight: "600" },
  signOut: { marginTop: "auto", alignItems: "center", padding: 12 },
  signOutText: { fontSize: 16, color: "#1565C0", fontWeight: "600" },
});