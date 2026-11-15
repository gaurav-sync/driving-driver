import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  createDriverProfile,
  updateDriverProfile,
} from "../../../api/driverProfile";
import { formatVehicleType } from "../../../api/drivers";
import { ApiError } from "../../../api/http";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { useRegistration } from "../../../context/RegistrationContext";
import { useAuth } from "../../../hooks/useAuth";
import type { DriverStackParamList } from "../../../navigation/types";
import type { DriverProfilePayload } from "../../../types/driverProfile";

type Props = NativeStackScreenProps<DriverStackParamList, "RegReview">;

export function RegReviewScreen({ navigation }: Props) {
  const { draft, mode } = useRegistration();
  const { state } = useAuth();
  const [busy, setBusy] = useState(false);

  const payload: DriverProfilePayload = {
    fullName: draft.fullName.trim(),
    phone: draft.phone.trim(),
    basePlaceId: draft.basePlaceId,
    coveredPlaceIds: draft.coveredPlaceIds,
    coveredDistricts: draft.coveredDistricts,
    maxDistanceKm: draft.maxDistanceKm,
    vehicleType: draft.vehicleType,
    vehicleModel: draft.vehicleModel.trim(),
    seats: draft.seats,
    isAC: draft.isAC,
    ratePerKm: draft.ratePerKm,
    dayRate: draft.dayRate,
    photos: draft.photos ?? [],
    bio: draft.bio?.trim() || undefined,
    languages: draft.languages ?? [],
  };

  const onSubmit = async () => {
    if (state.status !== "signedIn") return;
    setBusy(true);
    try {
      if (mode === "edit") {
        await updateDriverProfile(state.token, payload);
      } else {
        await createDriverProfile(state.token, payload);
      }
      Alert.alert(
        "Submitted",
        mode === "create"
          ? "Your profile is pending admin approval."
          : "Profile updated.",
        [{ text: "OK", onPress: () => navigation.navigate("DriverHome") }]
      );
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof ApiError ? err.message : "Could not save profile."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>Review & submit</Text>
      <Text style={styles.line}>{payload.fullName} · {payload.phone}</Text>
      <Text style={styles.line}>
        Base: {draft.basePlaceName ?? payload.basePlaceId}
      </Text>
      <Text style={styles.line}>
        {formatVehicleType(payload.vehicleType)} {payload.vehicleModel} ·{" "}
        {payload.seats} seats · {payload.isAC ? "AC" : "Non-AC"}
      </Text>
      <Text style={styles.line}>
        ₹{payload.ratePerKm}/km · ₹{payload.dayRate}/day
      </Text>
      <Text style={styles.line}>
        Photos: {(payload.photos ?? []).length}
      </Text>
      <PrimaryButton
        label={mode === "edit" ? "Save changes" : "Submit for approval"}
        onPress={onSubmit}
        loading={busy}
        style={styles.btn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 16 },
  line: { fontSize: 17, marginBottom: 8, color: "#333" },
  btn: { marginTop: 24 },
});