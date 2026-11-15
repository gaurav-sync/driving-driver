import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createReport } from "../../api/reports";
import { ApiError } from "../../api/http";
import { FormField } from "../../components/FormField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useAuth } from "../../hooks/useAuth";
import type { CustomerStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<CustomerStackParamList, "ReportDriver">;

export function ReportDriverScreen({ navigation, route }: Props) {
  const { driverId, driverName } = route.params;
  const { state } = useAuth();
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (state.status !== "signedIn") return;
    if (reason.trim().length < 3) {
      Alert.alert("Reason required", "Please describe the issue in a few words.");
      return;
    }
    setBusy(true);
    try {
      await createReport(state.token, {
        driverId,
        reason: reason.trim(),
        note: note.trim() || undefined,
      });
      Alert.alert("Thank you", "Your report was sent to the admin.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message === "already_reported"
            ? "You already reported this driver."
            : err.status === 0
              ? "Could not reach the server."
              : "Could not submit report."
          : "Could not submit report.";
      Alert.alert("Report", message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Report driver</Text>
        <Text style={styles.sub}>Reporting: {driverName}</Text>
        <FormField
          label="Reason"
          value={reason}
          onChangeText={setReason}
          placeholder="What went wrong?"
        />
        <FormField
          label="Details (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="More information"
        />
        <PrimaryButton label="Submit report" onPress={onSubmit} loading={busy} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  scroll: { padding: 24 },
  title: { fontSize: 24, fontWeight: "800" },
  sub: { fontSize: 16, color: "#555", marginBottom: 20, marginTop: 8 },
});