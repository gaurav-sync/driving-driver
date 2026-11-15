import { Pressable, StyleSheet, Text, View } from "react-native";
import { useI18n } from "../i18n/I18nContext";
import type { Locale } from "../i18n/messages";

const options: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "mr", label: "मराठी" },
  { code: "hi", label: "हिंदी" },
];

export function LanguagePicker() {
  const { locale, setLocale } = useI18n();
  return (
    <View style={styles.row}>
      {options.map((o) => (
        <Pressable
          key={o.code}
          onPress={() => setLocale(o.code)}
          style={[styles.chip, locale === o.code && styles.chipOn]}
        >
          <Text style={[styles.text, locale === o.code && styles.textOn]}>
            {o.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, marginVertical: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  chipOn: { borderColor: "#1565C0", backgroundColor: "#E3F2FD" },
  text: { fontSize: 14, color: "#333" },
  textOn: { color: "#1565C0", fontWeight: "600" },
});