import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { useRegistration } from "../../../context/RegistrationContext";
import { useAuth } from "../../../hooks/useAuth";
import type { DriverStackParamList } from "../../../navigation/types";
import { compressAndUploadVehiclePhoto } from "../../../utils/uploadPhoto";
import { RegStepLayout } from "./RegStepLayout";

type Props = NativeStackScreenProps<DriverStackParamList, "RegPhotos">;

export function RegPhotosScreen({ navigation }: Props) {
  const { draft, setDraft } = useRegistration();
  const { state } = useAuth();
  const [uploading, setUploading] = useState(false);

  const pickPhoto = async () => {
    if ((draft.photos ?? []).length >= 6) {
      Alert.alert("Limit", "Maximum 6 photos.");
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission", "Allow photo access to add vehicle pictures.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });
    if (result.canceled || !result.assets[0]) return;
    if (state.status !== "signedIn") return;
    setUploading(true);
    try {
      const url = await compressAndUploadVehiclePhoto(
        state.token,
        result.assets[0].uri
      );
      setDraft((d) => ({ ...d, photos: [...(d.photos ?? []), url] }));
    } catch {
      Alert.alert(
        "Upload failed",
        "Check Cloudinary settings on the server or try another photo."
      );
    } finally {
      setUploading(false);
    }
  };

  const remove = (uri: string) => {
    setDraft((d) => ({
      ...d,
      photos: (d.photos ?? []).filter((p) => p !== uri),
    }));
  };

  return (
    <RegStepLayout
      step={5}
      total={6}
      title="Vehicle photos"
      onNext={() => navigation.navigate("RegReview")}
      nextLabel="Review"
    >
      <Text style={styles.hint}>Up to 6 JPEG photos (~1 MB each after compression).</Text>
      <PrimaryButton
        label={uploading ? "Uploading…" : "Add photo from gallery"}
        onPress={pickPhoto}
        loading={uploading}
        variant="secondary"
      />
      <ScrollView horizontal style={styles.row}>
        {(draft.photos ?? []).map((uri) => (
          <Pressable key={uri} onPress={() => remove(uri)} style={styles.thumbWrap}>
            <Image source={{ uri }} style={styles.thumb} />
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        ))}
      </ScrollView>
      {(draft.photos ?? []).length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Photos help customers trust you.</Text>
        </View>
      ) : null}
    </RegStepLayout>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 15, color: "#555", marginBottom: 12 },
  row: { marginTop: 16, flexDirection: "row" },
  thumbWrap: { marginRight: 12, alignItems: "center" },
  thumb: { width: 100, height: 80, borderRadius: 8, backgroundColor: "#eee" },
  remove: { fontSize: 12, color: "#B71C1C", marginTop: 4 },
  empty: { marginTop: 24 },
  emptyText: { fontSize: 16, color: "#888" },
});