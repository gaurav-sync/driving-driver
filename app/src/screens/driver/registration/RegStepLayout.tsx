import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "../../../components/PrimaryButton";

type Props = {
  step: number;
  total: number;
  title: string;
  children: React.ReactNode;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
};

export function RegStepLayout({
  step,
  total,
  title,
  children,
  onNext,
  nextLabel = "Next",
  nextDisabled,
}: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.progress}>
        Step {step} of {total}
      </Text>
      <Text style={styles.title}>{title}</Text>
      <ScrollView contentContainerStyle={styles.scroll}>{children}</ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label={nextLabel}
          onPress={onNext}
          disabled={nextDisabled}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  progress: { paddingHorizontal: 20, paddingTop: 8, fontSize: 14, color: "#666" },
  title: {
    fontSize: 24,
    fontWeight: "800",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  scroll: { padding: 20, paddingBottom: 24 },
  footer: { padding: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#ddd" },
});