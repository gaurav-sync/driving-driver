import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PlaceSearchPicker } from "../../../components/PlaceSearchPicker";
import { useRegistration } from "../../../context/RegistrationContext";
import type { DriverStackParamList } from "../../../navigation/types";
import type { Place } from "../../../types/place";
import { RegStepLayout } from "./RegStepLayout";

type Props = NativeStackScreenProps<DriverStackParamList, "RegAreas">;

export function RegAreasScreen({ navigation }: Props) {
  const { draft, setDraft } = useRegistration();

  const setBase = (place: Place) => {
    setDraft((d) => ({
      ...d,
      basePlaceId: place.id,
      basePlaceName: place.name,
    }));
  };

  const addCovered = (place: Place) => {
    setDraft((d) => {
      if (d.coveredPlaceIds.includes(place.id)) return d;
      return {
        ...d,
        coveredPlaceIds: [...d.coveredPlaceIds, place.id],
        coveredPlaceNames: [...(d.coveredPlaceNames ?? []), place.name],
      };
    });
  };

  const removeCovered = (id: string) => {
    setDraft((d) => {
      const idx = d.coveredPlaceIds.indexOf(id);
      if (idx === -1) return d;
      return {
        ...d,
        coveredPlaceIds: d.coveredPlaceIds.filter((x) => x !== id),
        coveredPlaceNames: (d.coveredPlaceNames ?? []).filter((_, i) => i !== idx),
      };
    });
  };

  return (
    <RegStepLayout
      step={2}
      total={6}
      title="Base place & areas"
      onNext={() => navigation.navigate("RegVehicle")}
      nextDisabled={!draft.basePlaceId}
    >
      <PlaceSearchPicker
        selected={
          draft.basePlaceId
            ? {
                id: draft.basePlaceId,
                name: draft.basePlaceName ?? "",
                altNames: [],
                type: "town",
                state: "Maharashtra",
                district: "",
                taluka: "",
                lgdCode: "",
              }
            : null
        }
        onSelect={setBase}
      />

      <Text style={styles.subhead}>Other towns you travel to (optional)</Text>
      <PlaceSearchPicker selected={null} onSelect={addCovered} />
      <View style={styles.chips}>
        {draft.coveredPlaceIds.map((id, i) => (
          <Pressable key={id} onPress={() => removeCovered(id)} style={styles.chip}>
            <Text style={styles.chipText}>
              {(draft.coveredPlaceNames ?? [])[i] ?? id} ×
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.subhead}>Districts you cover (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Solapur, Pune"
        value={(draft.coveredDistricts ?? []).join(", ")}
        onChangeText={(t) =>
          setDraft((d) => ({
            ...d,
            coveredDistricts: t
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          }))
        }
      />
    </RegStepLayout>
  );
}

const styles = StyleSheet.create({
  subhead: { fontSize: 16, fontWeight: "600", marginTop: 20, marginBottom: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  chip: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  chipText: { fontSize: 15, color: "#1565C0" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 14,
    fontSize: 17,
  },
});