import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Local Drivers</Text>
      <ActivityIndicator size="large" color="#1565C0" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1565C0",
  },
});