import type { VehicleType } from "./driver";

export type DriverOwnProfile = {
  id: string;
  fullName: string;
  phone: string;
  vehicleType: string;
  vehicleModel: string;
  seats: number;
  isAC: boolean;
  ratePerKm: number;
  dayRate: number;
  photo: string | null;
  photos: string[];
  bio?: string;
  languages: string[];
  basePlace: { id: string; name: string; taluka: string };
  coveredPlaces: { id: string; name: string }[];
  coveredDistricts: string[];
  maxDistanceKm?: number;
  status: string;
  statusNote?: string;
  isActive: boolean;
  basePlaceId: string;
  coveredPlaceIds: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type DriverProfilePayload = {
  fullName: string;
  phone: string;
  basePlaceId: string;
  coveredPlaceIds: string[];
  coveredDistricts: string[];
  maxDistanceKm?: number;
  vehicleType: VehicleType;
  vehicleModel: string;
  seats: number;
  isAC: boolean;
  ratePerKm: number;
  dayRate: number;
  photos: string[];
  bio?: string;
  languages: string[];
};

export type RegistrationDraft = DriverProfilePayload & {
  basePlaceName?: string;
  coveredPlaceNames?: string[];
};