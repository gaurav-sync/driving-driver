import { StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "phone-pad" | "email-address";
  autoCapitalize?: "none" | "words" | "sentences";
};

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#222",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    backgroundColor: "#fafafa",
  },
});