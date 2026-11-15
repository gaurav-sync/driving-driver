import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FormField } from "../components/FormField";
import { PrimaryButton } from "../components/PrimaryButton";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types/auth";
import { ApiError } from "../api/http";

export function RoleDetailsScreen() {
  const { state, completeProfile } = useAuth();
  const suggestedName =
    state.status === "needsProfile" ? state.suggestedName ?? "" : "";
  const email = state.status === "needsProfile" ? state.email : "";

  const [role, setRole] = useState<UserRole>("customer");
  const [name, setName] = useState(suggestedName);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  if (state.status !== "needsProfile") {
    return null;
  }

  const onSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Missing details", "Please enter your name and phone number.");
      return;
    }
    if (role !== "customer" && role !== "driver") {
      Alert.alert("Choose a role", "Select Customer or Driver.");
      return;
    }
    setBusy(true);
    try {
      await completeProfile({
        role,
        name: name.trim(),
        phone: phone.trim(),
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 0
            ? "Could not reach the server."
            : `Could not save profile (${err.message}).`
          : "Could not save profile.";
      Alert.alert("Error", message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Your details</Text>
        <Text style={styles.hint}>Signed in as {email}</Text>

        <Text style={styles.section}>I am a</Text>
        <View style={styles.roleRow}>
          <RoleChip
            label="Customer"
            selected={role === "customer"}
            onPress={() => setRole("customer")}
          />
          <RoleChip
            label="Driver"
            selected={role === "driver"}
            onPress={() => setRole("driver")}
          />
        </View>

        <FormField
          label="Full name"
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          autoCapitalize="words"
        />
        <FormField
          label="Mobile number"
          value={phone}
          onChangeText={setPhone}
          placeholder="10-digit mobile"
          keyboardType="phone-pad"
        />

        <PrimaryButton label="Continue" onPress={onSubmit} loading={busy} />
      </ScrollView>
    </SafeAreaView>
  );
}

function RoleChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  scroll: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 8 },
  hint: { fontSize: 16, color: "#555", marginBottom: 20 },
  section: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  roleRow: { flexDirection: "row", gap: 12, marginBottom: 8 },
  chip: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
  },
  chipSelected: {
    borderColor: "#1565C0",
    backgroundColor: "#E3F2FD",
  },
  chipText: { fontSize: 18, fontWeight: "600", color: "#333" },
  chipTextSelected: { color: "#1565C0" },
});