import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { DriverListItem } from "../types/driver";
import { formatVehicleType } from "../api/drivers";

type Props = {
  driver: DriverListItem;
  onPress: () => void;
};

export function DriverCard({ driver, onPress }: Props) {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View ${driver.fullName}`}
    >
      {driver.photo ? (
        <Image source={{ uri: driver.photo }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder]}>
          <Text style={styles.photoPlaceholderText}>No photo</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.name}>{driver.fullName}</Text>
        <Text style={styles.model}>
          {formatVehicleType(driver.vehicleType)} · {driver.vehicleModel}
        </Text>
        <Text style={styles.meta}>
          {driver.seats} seats {driver.isAC ? "· AC" : "· Non-AC"}
        </Text>
        <Text style={styles.rates}>
          ₹{driver.ratePerKm}/km · ₹{driver.dayRate}/day
        </Text>
        <Text style={styles.town}>{driver.basePlace.name}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 12,
    overflow: "hidden",
  },
  photo: { width: 110, height: 130, backgroundColor: "#eee" },
  photoPlaceholder: { alignItems: "center", justifyContent: "center" },
  photoPlaceholderText: { fontSize: 12, color: "#888" },
  body: { flex: 1, padding: 12, justifyContent: "center" },
  name: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  model: { fontSize: 15, color: "#444" },
  meta: { fontSize: 14, color: "#555", marginTop: 4 },
  rates: { fontSize: 16, fontWeight: "600", color: "#1565C0", marginTop: 6 },
  town: { fontSize: 14, color: "#666", marginTop: 4 },
});