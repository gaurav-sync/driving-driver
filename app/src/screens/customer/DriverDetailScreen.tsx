import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { formatVehicleType, getDriverById } from "../../api/drivers";
import { ApiError } from "../../api/http";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ErrorRetry } from "../../components/ErrorRetry";
import type { CustomerStackParamList } from "../../navigation/types";
import type { DriverPublicDetail } from "../../types/driver";

type Props = NativeStackScreenProps<CustomerStackParamList, "DriverDetail">;

const CAROUSEL_WIDTH = Dimensions.get("window").width;

export function DriverDetailScreen({ navigation, route }: Props) {
  const { driverId } = route.params;
  const [driver, setDriver] = useState<DriverPublicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDriver(await getDriverById(driverId));
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 0
          ? "Could not load profile. Check your connection."
          : "Driver not found or unavailable."
      );
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    load();
  }, [load]);

  const onCall = () => {
    if (!driver?.phone) return;
    Linking.openURL(`tel:${driver.phone}`);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !driver) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorRetry message={error ?? "Not found"} onRetry={load} />
      </SafeAreaView>
    );
  }

  const photos = driver.photos.length > 0 ? driver.photos : driver.photo ? [driver.photo] : [];

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {photos.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.carousel}
          >
            {photos.map((uri, i) => (
              <Image
                key={`${uri}-${i}`}
                source={{ uri }}
                style={styles.carouselImage}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.carouselImage, styles.noPhoto]}>
            <Text style={styles.noPhotoText}>No photos</Text>
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.name}>{driver.fullName}</Text>
          <Text style={styles.line}>
            {formatVehicleType(driver.vehicleType)} · {driver.vehicleModel}
          </Text>
          <Text style={styles.line}>
            {driver.seats} seats · {driver.isAC ? "AC" : "Non-AC"}
          </Text>
          <Text style={styles.rates}>
            ₹{driver.ratePerKm}/km · ₹{driver.dayRate}/day
          </Text>
          <Text style={styles.town}>
            Base: {driver.basePlace.name}, {driver.basePlace.taluka}
          </Text>

          {driver.coveredPlaces.length > 0 || driver.coveredDistricts.length > 0 ? (
            <>
              <Text style={styles.section}>Areas covered</Text>
              {driver.coveredPlaces.length > 0 ? (
                <Text style={styles.body}>
                  {driver.coveredPlaces.map((p) => p.name).join(", ")}
                </Text>
              ) : null}
              {driver.coveredDistricts.length > 0 ? (
                <Text style={styles.body}>
                  Districts: {driver.coveredDistricts.join(", ")}
                </Text>
              ) : null}
            </>
          ) : null}

          {driver.languages.length > 0 ? (
            <>
              <Text style={styles.section}>Languages</Text>
              <Text style={styles.body}>{driver.languages.join(", ")}</Text>
            </>
          ) : null}

          {driver.bio ? (
            <>
              <Text style={styles.section}>About</Text>
              <Text style={styles.body}>{driver.bio}</Text>
            </>
          ) : null}

          <PrimaryButton label="Call driver" onPress={onCall} style={styles.call} />

          <Pressable
            onPress={() =>
              navigation.navigate("ReportDriver", {
                driverId: driver.id,
                driverName: driver.fullName,
              })
            }
            style={styles.report}
          >
            <Text style={styles.reportText}>Report this driver</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { paddingBottom: 32 },
  carousel: { maxHeight: 240 },
  carouselImage: {
    width: CAROUSEL_WIDTH,
    height: 240,
    backgroundColor: "#eee",
  },
  noPhoto: { alignItems: "center", justifyContent: "center" },
  noPhotoText: { color: "#888" },
  content: { padding: 20 },
  name: { fontSize: 26, fontWeight: "800", marginBottom: 8 },
  line: { fontSize: 17, color: "#444", marginBottom: 4 },
  rates: { fontSize: 20, fontWeight: "700", color: "#1565C0", marginVertical: 10 },
  town: { fontSize: 16, color: "#555", marginBottom: 16 },
  section: { fontSize: 17, fontWeight: "700", marginTop: 12, marginBottom: 6 },
  body: { fontSize: 16, color: "#444", lineHeight: 24 },
  call: { marginTop: 24 },
  report: { marginTop: 20, alignItems: "center", padding: 12 },
  reportText: { fontSize: 16, color: "#B71C1C", fontWeight: "600" },
});