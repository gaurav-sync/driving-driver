export const VEHICLE_TYPES = [
  "hatchback",
  "sedan",
  "suv",
  "innova",
  "tempo traveller",
  "other",
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number];

export type DriverListItem = {
  id: string;
  fullName: string;
  vehicleType: string;
  vehicleModel: string;
  seats: number;
  isAC: boolean;
  ratePerKm: number;
  dayRate: number;
  photo: string | null;
  basePlace: { id: string; name: string; taluka: string };
};

export type DriverPublicDetail = DriverListItem & {
  phone: string;
  photos: string[];
  bio?: string;
  languages: string[];
  coveredPlaces: { id: string; name: string }[];
  coveredDistricts: string[];
  maxDistanceKm?: number;
};

export type DriverSearchParams = {
  placeId: string;
  vehicleType?: VehicleType;
  minSeats?: number;
  ac?: boolean;
  page?: number;
};

export type DriverSearchResult = {
  drivers: DriverListItem[];
  page: number;
  totalPages: number;
  total: number;
};