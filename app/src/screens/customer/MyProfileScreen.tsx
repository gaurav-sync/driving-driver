import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { updateMe } from "../../api/auth";
import { ApiError } from "../../api/http";
import { FormField } from "../../components/FormField";
import { PrimaryButton } from "../../components/PrimaryButton";
import { useAuth } from "../../hooks/useAuth";
import type { CustomerStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<CustomerStackParamList, "MyProfile">;

export function MyProfileScreen(_props: Props) {
  const { state, signOut, refreshUser } = useAuth();
  if (state.status !== "signedIn") return null;

  const { user, token } = state;
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    try {
      await updateMe(token, { name: name.trim(), phone: phone.trim(), email: email.trim() });
      await refreshUser();
      Alert.alert("Saved", "Your profile was updated.");
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof ApiError ? err.message : "Could not save profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const onSignOut = async () => {
    await signOut();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>My profile</Text>
        <FormField label="Name" value={name} onChangeText={setName} />
        <FormField
          label="Mobile"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <PrimaryButton label="Save" onPress={onSave} loading={saving} />
        <PrimaryButton
          label="Sign out"
          onPress={onSignOut}
          variant="secondary"
          style={styles.signOut}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  scroll: { padding: 24 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 20 },
  signOut: { marginTop: 16 },
});