import type { VehicleType } from "../types/driver";

export type AuthStackParamList = {
  Welcome: undefined;
  RoleDetails: undefined;
};

export type CustomerStackParamList = {
  SearchHome: undefined;
  Results: {
    placeId: string;
    placeName: string;
    district: string;
    vehicleType?: VehicleType;
    minSeats?: number;
    ac?: boolean;
  };
  DriverDetail: { driverId: string };
  MyProfile: undefined;
  ReportDriver: { driverId: string; driverName: string };
};

export type DriverStackParamList = {
  DriverHome: undefined;
  RegPersonal: undefined;
  RegAreas: undefined;
  RegVehicle: undefined;
  RegRates: undefined;
  RegPhotos: undefined;
  RegReview: undefined;
  DriverPreview: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  CustomerMain: undefined;
  DriverMain: undefined;
};