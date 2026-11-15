import { StyleSheet, Text, TextInput } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FormField } from "../../../components/FormField";
import { useRegistration } from "../../../context/RegistrationContext";
import type { DriverStackParamList } from "../../../navigation/types";
import { RegStepLayout } from "./RegStepLayout";

type Props = NativeStackScreenProps<DriverStackParamList, "RegRates">;

export function RegRatesScreen({ navigation }: Props) {
  const { draft, setDraft } = useRegistration();

  return (
    <RegStepLayout
      step={4}
      total={6}
      title="Rates & languages"
      onNext={() => navigation.navigate("RegPhotos")}
    >
      <FormField
        label="Rate per km (₹)"
        value={String(draft.ratePerKm)}
        onChangeText={(t) =>
          setDraft((d) => ({ ...d, ratePerKm: Number(t) || 0 }))
        }
        keyboardType="phone-pad"
      />
      <FormField
        label="Day rate (₹)"
        value={String(draft.dayRate)}
        onChangeText={(t) =>
          setDraft((d) => ({ ...d, dayRate: Number(t) || 0 }))
        }
        keyboardType="phone-pad"
      />
      <FormField
        label="Languages (comma separated)"
        value={(draft.languages ?? []).join(", ")}
        onChangeText={(t) =>
          setDraft((d) => ({
            ...d,
            languages: t
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          }))
        }
      />
      <Text style={styles.label}>Short bio (optional, max 300)</Text>
      <TextInput
        style={styles.bio}
        multiline
        maxLength={300}
        value={draft.bio ?? ""}
        onChangeText={(t) => setDraft((d) => ({ ...d, bio: t }))}
        placeholder="A few lines about your service"
      />
    </RegStepLayout>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  bio: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 14,
    fontSize: 17,
    minHeight: 100,
    textAlignVertical: "top",
  },
});