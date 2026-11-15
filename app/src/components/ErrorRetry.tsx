import { StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "./PrimaryButton";

type Props = {
  message: string;
  onRetry: () => void;
};

export function ErrorRetry({ message, onRetry }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{message}</Text>
      <PrimaryButton label="Retry" onPress={onRetry} variant="secondary" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 24, alignItems: "center", gap: 16 },
  text: { fontSize: 17, color: "#444", textAlign: "center", lineHeight: 24 },
});