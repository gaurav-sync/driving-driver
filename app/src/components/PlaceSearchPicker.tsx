import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { searchPlaces } from "../api/places";
import { ApiError } from "../api/http";
import type { Place } from "../types/place";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

type Props = {
  selected: Place | null;
  onSelect: (place: Place) => void;
};

export function PlaceSearchPicker({ selected, onSelect }: Props) {
  const [query, setQuery] = useState(selected?.name ?? "");
  const debounced = useDebouncedValue(query, 400);
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (debounced.trim().length < 1) {
      setResults([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const places = await searchPlaces(debounced);
        if (!cancelled) setResults(places);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError && err.status === 0
              ? "Could not load places. Check connection."
              : "Could not load places."
          );
          setResults([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Town / village</Text>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Start typing — e.g. Karmala"
        placeholderTextColor="#999"
        autoCapitalize="words"
        accessibilityLabel="Search place"
      />
      {selected ? (
        <Text style={styles.selected}>
          Selected: {selected.name}, {selected.taluka}
        </Text>
      ) : null}
      {loading ? <ActivityIndicator style={styles.loader} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        style={styles.list}
        nestedScrollEnabled
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => {
              onSelect(item);
              setQuery(item.name);
              setResults([]);
            }}
          >
            <Text style={styles.rowTitle}>{item.name}</Text>
            <Text style={styles.rowSub}>
              {item.taluka}, {item.district}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          debounced.length >= 2 && !loading && !error ? (
            <Text style={styles.empty}>No places found. Try another spelling.</Text>
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    backgroundColor: "#fafafa",
  },
  selected: {
    marginTop: 8,
    fontSize: 15,
    color: "#1565C0",
    fontWeight: "600",
  },
  loader: { marginVertical: 8 },
  error: { color: "#B71C1C", marginTop: 8, fontSize: 15 },
  list: { maxHeight: 200, marginTop: 8 },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  rowTitle: { fontSize: 17, fontWeight: "600" },
  rowSub: { fontSize: 14, color: "#666", marginTop: 2 },
  empty: { padding: 12, fontSize: 15, color: "#666" },
});