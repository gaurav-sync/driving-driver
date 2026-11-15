import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from "react-native";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary";
  style?: ViewStyle;
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = "primary",
  style,
}: Props) {
  const isPrimary = variant === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#fff" : "#1565C0"} />
      ) : (
        <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelSecondary]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    width: "100%",
  },
  primary: {
    backgroundColor: "#1565C0",
  },
  secondary: {
    backgroundColor: "#E3F2FD",
    borderWidth: 1,
    borderColor: "#1565C0",
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.9,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
  },
  labelPrimary: {
    color: "#fff",
  },
  labelSecondary: {
    color: "#1565C0",
  },
});