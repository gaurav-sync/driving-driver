import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { searchDrivers } from "../../api/drivers";
import { ApiError } from "../../api/http";
import { DriverCard } from "../../components/DriverCard";
import { ErrorRetry } from "../../components/ErrorRetry";
import type { CustomerStackParamList } from "../../navigation/types";
import type { DriverListItem } from "../../types/driver";

type Props = NativeStackScreenProps<CustomerStackParamList, "Results">;

export function ResultsScreen({ navigation, route }: Props) {
  const { placeId, placeName, district, vehicleType, minSeats, ac } =
    route.params;
  const [drivers, setDrivers] = useState<DriverListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(
    async (pageNum: number, append: boolean) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      setError(null);
      try {
        const res = await searchDrivers({
          placeId,
          vehicleType,
          minSeats,
          ac,
          page: pageNum,
        });
        setDrivers((prev) =>
          append ? [...prev, ...res.drivers] : res.drivers
        );
        setPage(res.page);
        setTotalPages(res.totalPages);
      } catch (err) {
        setError(
          err instanceof ApiError && err.status === 0
            ? "Could not load drivers. Check your connection."
            : "Could not load drivers."
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [placeId, vehicleType, minSeats, ac]
  );

  useEffect(() => {
    loadPage(1, false);
  }, [loadPage]);

  const onEndReached = () => {
    if (loadingMore || loading || page >= totalPages) return;
    loadPage(page + 1, true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <Text style={styles.title}>Drivers near {placeName}</Text>
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : error ? (
        <ErrorRetry message={error} onRetry={() => loadPage(1, false)} />
      ) : (
        <FlatList
          data={drivers}
          keyExtractor={(d) => d.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <DriverCard
              driver={item}
              onPress={() =>
                navigation.navigate("DriverDetail", { driverId: item.id })
              }
            />
          )}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={styles.footer} />
            ) : undefined
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No drivers found here yet</Text>
              <Text style={styles.emptyBody}>
                Try removing filters, or search a larger nearby town in{" "}
                {district} district.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f5f5" },
  title: {
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  list: { padding: 16, paddingBottom: 32 },
  loader: { marginTop: 40 },
  footer: { marginVertical: 16 },
  empty: { padding: 24, alignItems: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  emptyBody: { fontSize: 16, color: "#555", textAlign: "center", lineHeight: 24 },
});