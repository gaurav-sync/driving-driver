import type { Place } from "../types/place";
import { apiFetch } from "./http";

export async function searchPlaces(query: string): Promise<Place[]> {
  const q = encodeURIComponent(query.trim());
  if (!q) return [];
  const res = await apiFetch<{ places: Place[] }>(`/api/places?q=${q}`);
  return res.places;
}