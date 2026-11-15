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
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { vehicleTypeOptions } from "../../api/drivers";
import { PlaceSearchPicker } from "../../components/PlaceSearchPicker";
import { PrimaryButton } from "../../components/PrimaryButton";
import { LanguagePicker } from "../../components/LanguagePicker";
import { useI18n } from "../../i18n/I18nContext";
import type { CustomerStackParamList } from "../../navigation/types";
import type { Place } from "../../types/place";
import type { VehicleType } from "../../types/driver";

type Props = NativeStackScreenProps<CustomerStackParamList, "SearchHome">;

export function SearchHomeScreen({ navigation }: Props) {
  const { t } = useI18n();
  const [place, setPlace] = useState<Place | null>(null);
  const [vehicleType, setVehicleType] = useState<VehicleType | "">("");
  const [minSeats, setMinSeats] = useState(0);
  const [acOnly, setAcOnly] = useState(false);

  const onSearch = () => {
    if (!place) {
      Alert.alert("Choose a place", "Pick your town or village from the list.");
      return;
    }
    navigation.navigate("Results", {
      placeId: place.id,
      placeName: place.name,
      district: place.district,
      vehicleType: vehicleType || undefined,
      minSeats: minSeats > 0 ? minSeats : undefined,
      ac: acOnly || undefined,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("findDriver")}</Text>
        <Pressable
          onPress={() => navigation.navigate("MyProfile")}
          style={styles.profileLink}
        >
          <Text style={styles.profileLinkText}>Profile</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <PlaceSearchPicker selected={place} onSelect={setPlace} />

        <Text style={styles.section}>Filters (optional)</Text>

        <Text style={styles.filterLabel}>Vehicle type</Text>
        <View style={styles.chips}>
          {vehicleTypeOptions.map((opt) => (
            <Pressable
              key={opt.label}
              onPress={() => setVehicleType(opt.value)}
              style={[
                styles.chip,
                vehicleType === opt.value && styles.chipOn,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  vehicleType === opt.value && styles.chipTextOn,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.filterLabel}>Minimum seats</Text>
        <View style={styles.seatRow}>
          {[0, 4, 6, 7].map((n) => (
            <Pressable
              key={n}
              style={[styles.seatChip, minSeats === n && styles.chipOn]}
              onPress={() => setMinSeats(n)}
            >
              <Text
                style={[styles.chipText, minSeats === n && styles.chipTextOn]}
              >
                {n === 0 ? "Any" : `${n}+`}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.acRow}
          onPress={() => setAcOnly((v) => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acOnly }}
        >
          <View style={[styles.checkbox, acOnly && styles.checkboxOn]} />
          <Text style={styles.acLabel}>AC only</Text>
        </Pressable>

        <LanguagePicker />
        <PrimaryButton label={t("searchDrivers")} onPress={onSearch} style={styles.searchBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  headerTitle: { fontSize: 22, fontWeight: "800" },
  profileLink: { padding: 8 },
  profileLinkText: { fontSize: 17, color: "#1565C0", fontWeight: "600" },
  scroll: { padding: 20, paddingBottom: 40 },
  section: { fontSize: 18, fontWeight: "700", marginTop: 24, marginBottom: 12 },
  filterLabel: { fontSize: 15, fontWeight: "600", marginBottom: 8, marginTop: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 4,
  },
  chipOn: { borderColor: "#1565C0", backgroundColor: "#E3F2FD" },
  chipText: { fontSize: 14, color: "#333" },
  chipTextOn: { color: "#1565C0", fontWeight: "600" },
  seatRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  seatChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  acRow: { flexDirection: "row", alignItems: "center", marginTop: 16, gap: 12 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#1565C0",
  },
  checkboxOn: { backgroundColor: "#1565C0" },
  acLabel: { fontSize: 17 },
  searchBtn: { marginTop: 28 },
});