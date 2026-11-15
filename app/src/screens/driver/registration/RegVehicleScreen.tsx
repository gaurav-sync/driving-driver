import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { vehicleTypeOptions } from "../../../api/drivers";
import { FormField } from "../../../components/FormField";
import { useRegistration } from "../../../context/RegistrationContext";
import type { DriverStackParamList } from "../../../navigation/types";
import type { VehicleType } from "../../../types/driver";
import { RegStepLayout } from "./RegStepLayout";

type Props = NativeStackScreenProps<DriverStackParamList, "RegVehicle">;

export function RegVehicleScreen({ navigation }: Props) {
  const { draft, setDraft } = useRegistration();

  return (
    <RegStepLayout
      step={3}
      total={6}
      title="Vehicle"
      onNext={() => navigation.navigate("RegRates")}
      nextDisabled={!draft.vehicleModel.trim()}
    >
      <Text style={styles.label}>Vehicle type</Text>
      <View style={styles.chips}>
        {vehicleTypeOptions
          .filter((o) => o.value !== "")
          .map((opt) => (
            <Pressable
              key={opt.value}
              style={[
                styles.chip,
                draft.vehicleType === opt.value && styles.chipOn,
              ]}
              onPress={() =>
                setDraft((d) => ({
                  ...d,
                  vehicleType: opt.value as VehicleType,
                }))
              }
            >
              <Text style={styles.chipText}>{opt.label}</Text>
            </Pressable>
          ))}
      </View>
      <FormField
        label="Model"
        value={draft.vehicleModel}
        onChangeText={(t) => setDraft((d) => ({ ...d, vehicleModel: t }))}
        placeholder="e.g. Swift Dzire"
      />
      <Text style={styles.label}>Seats</Text>
      <View style={styles.row}>
        {[4, 5, 6, 7, 8].map((n) => (
          <Pressable
            key={n}
            style={[styles.seat, draft.seats === n && styles.chipOn]}
            onPress={() => setDraft((d) => ({ ...d, seats: n }))}
          >
            <Text style={styles.chipText}>{n}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        style={styles.acRow}
        onPress={() => setDraft((d) => ({ ...d, isAC: !d.isAC }))}
      >
        <View style={[styles.box, draft.isAC && styles.boxOn]} />
        <Text style={styles.acText}>Air conditioning (AC)</Text>
      </Pressable>
    </RegStepLayout>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  chipOn: { borderColor: "#1565C0", backgroundColor: "#E3F2FD" },
  chipText: { fontSize: 15 },
  row: { flexDirection: "row", gap: 8, marginBottom: 16 },
  seat: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  acRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 },
  box: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#1565C0",
    borderRadius: 6,
  },
  boxOn: { backgroundColor: "#1565C0" },
  acText: { fontSize: 17 },
});