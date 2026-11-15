import type {
  DriverPublicDetail,
  DriverSearchParams,
  DriverSearchResult,
  VehicleType,
} from "../types/driver";
import { apiFetch } from "./http";

function buildSearchQuery(params: DriverSearchParams): string {
  const parts = [`placeId=${encodeURIComponent(params.placeId)}`];
  if (params.vehicleType) {
    parts.push(`vehicleType=${encodeURIComponent(params.vehicleType)}`);
  }
  if (params.minSeats) {
    parts.push(`minSeats=${params.minSeats}`);
  }
  if (params.ac === true) {
    parts.push("ac=true");
  }
  parts.push(`page=${params.page ?? 1}`);
  return parts.join("&");
}

export async function searchDrivers(
  params: DriverSearchParams
): Promise<DriverSearchResult> {
  return apiFetch<DriverSearchResult>(
    `/api/drivers?${buildSearchQuery(params)}`
  );
}

export async function getDriverById(id: string): Promise<DriverPublicDetail> {
  const res = await apiFetch<{ driver: DriverPublicDetail }>(
    `/api/drivers/${encodeURIComponent(id)}`
  );
  return res.driver;
}

export function formatVehicleType(label: string): string {
  return label
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const vehicleTypeOptions: { value: VehicleType | ""; label: string }[] =
  [
    { value: "", label: "Any vehicle" },
    { value: "hatchback", label: "Hatchback" },
    { value: "sedan", label: "Sedan" },
    { value: "suv", label: "SUV" },
    { value: "innova", label: "Innova" },
    { value: "tempo traveller", label: "Tempo Traveller" },
    { value: "other", label: "Other" },
  ];