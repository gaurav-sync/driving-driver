import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FormField } from "../../../components/FormField";
import { useRegistration } from "../../../context/RegistrationContext";
import type { DriverStackParamList } from "../../../navigation/types";
import { RegStepLayout } from "./RegStepLayout";

type Props = NativeStackScreenProps<DriverStackParamList, "RegPersonal">;

export function RegPersonalScreen({ navigation }: Props) {
  const { draft, setDraft } = useRegistration();

  return (
    <RegStepLayout
      step={1}
      total={6}
      title="Personal details"
      onNext={() => navigation.navigate("RegAreas")}
      nextDisabled={!draft.fullName.trim() || !draft.phone.trim()}
    >
      <FormField
        label="Full name (shown to customers)"
        value={draft.fullName}
        onChangeText={(t) => setDraft((d) => ({ ...d, fullName: t }))}
      />
      <FormField
        label="Mobile (shown on your profile page)"
        value={draft.phone}
        onChangeText={(t) => setDraft((d) => ({ ...d, phone: t }))}
        keyboardType="phone-pad"
      />
    </RegStepLayout>
  );
}