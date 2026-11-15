import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { getDriverById } from "../../api/drivers";
import { getMyDriverProfile } from "../../api/driverProfile";
import { DriverCard } from "../../components/DriverCard";
import { ErrorRetry } from "../../components/ErrorRetry";
import { useAuth } from "../../hooks/useAuth";
import type { DriverStackParamList } from "../../navigation/types";
import type { DriverListItem } from "../../types/driver";

type Props = NativeStackScreenProps<DriverStackParamList, "DriverPreview">;

export function DriverPreviewScreen(_props: Props) {
  const { state } = useAuth();
  const [item, setItem] = useState<DriverListItem | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (state.status !== "signedIn") return;
    setLoading(true);
    setError(null);
    try {
      const mine = await getMyDriverProfile(state.token);
      if (!mine) {
        setError("No profile yet.");
        setLoading(false);
        return;
      }
      if (mine.status === "approved" && mine.isActive) {
        try {
          const publicView = await getDriverById(mine.id);
          setItem(publicView);
          setNote("This is how customers see you in search.");
        } catch {
          setItem(profileAsListItem(mine));
          setNote("Approved — preview from your profile.");
        }
      } else {
        setItem(profileAsListItem(mine));
        setNote(
          mine.status === "pending"
            ? "Customers will see your listing after admin approval."
            : "Your profile is not visible in search right now."
        );
      }
    } catch {
      setError("Could not load preview.");
    } finally {
      setLoading(false);
    }
  }, [state]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorRetry message={error ?? "No data"} onRetry={load} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Customer preview</Text>
      {note ? <Text style={styles.note}>{note}</Text> : null}
      <DriverCard driver={item} onPress={() => {}} />
      <Text style={styles.footer}>Phone appears only on the full profile page.</Text>
    </SafeAreaView>
  );
}

function profileAsListItem(mine: {
  id: string;
  fullName: string;
  vehicleType: string;
  vehicleModel: string;
  seats: number;
  isAC: boolean;
  ratePerKm: number;
  dayRate: number;
  photos: string[];
  basePlace: { id: string; name: string; taluka: string };
}): DriverListItem {
  return {
    id: mine.id,
    fullName: mine.fullName,
    vehicleType: mine.vehicleType,
    vehicleModel: mine.vehicleModel,
    seats: mine.seats,
    isAC: mine.isAC,
    ratePerKm: mine.ratePerKm,
    dayRate: mine.dayRate,
    photo: mine.photos[0] ?? null,
    basePlace: mine.basePlace,
  };
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  note: { fontSize: 16, color: "#555", marginBottom: 16, lineHeight: 22 },
  footer: { fontSize: 14, color: "#666", marginTop: 12, textAlign: "center" },
});