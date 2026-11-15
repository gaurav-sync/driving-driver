import React, { createContext, useContext, useMemo, useState } from "react";
import type { RegistrationDraft } from "../types/driverProfile";
import type { VehicleType } from "../types/driver";

const emptyDraft = (): RegistrationDraft => ({
  fullName: "",
  phone: "",
  basePlaceId: "",
  coveredPlaceIds: [],
  coveredDistricts: [],
  vehicleType: "sedan",
  vehicleModel: "",
  seats: 4,
  isAC: true,
  ratePerKm: 12,
  dayRate: 3500,
  photos: [],
  languages: ["Marathi", "Hindi"],
  bio: "",
});

type RegistrationContextValue = {
  draft: RegistrationDraft;
  setDraft: React.Dispatch<React.SetStateAction<RegistrationDraft>>;
  resetDraft: (from?: Partial<RegistrationDraft>) => void;
  mode: "create" | "edit";
  setMode: (m: "create" | "edit") => void;
};

const RegistrationContext = createContext<RegistrationContextValue | null>(null);

export function RegistrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [draft, setDraft] = useState<RegistrationDraft>(emptyDraft());
  const [mode, setMode] = useState<"create" | "edit">("create");

  const value = useMemo(
    () => ({
      draft,
      setDraft,
      mode,
      setMode,
      resetDraft: (from?: Partial<RegistrationDraft>) => {
        setDraft({ ...emptyDraft(), ...from });
      },
    }),
    [draft, mode]
  );

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const ctx = useContext(RegistrationContext);
  if (!ctx) throw new Error("useRegistration requires RegistrationProvider");
  return ctx;
}

export function profileToDraft(profile: {
  fullName: string;
  phone: string;
  basePlaceId: string;
  basePlace: { name: string };
  coveredPlaceIds: string[];
  coveredPlaces: { id: string; name: string }[];
  coveredDistricts: string[];
  maxDistanceKm?: number;
  vehicleType: string;
  vehicleModel: string;
  seats: number;
  isAC: boolean;
  ratePerKm: number;
  dayRate: number;
  photos: string[];
  bio?: string;
  languages: string[];
}): RegistrationDraft {
  return {
    fullName: profile.fullName,
    phone: profile.phone,
    basePlaceId: profile.basePlaceId,
    basePlaceName: profile.basePlace.name,
    coveredPlaceIds: profile.coveredPlaceIds,
    coveredPlaceNames: profile.coveredPlaces.map((p) => p.name),
    coveredDistricts: profile.coveredDistricts,
    maxDistanceKm: profile.maxDistanceKm,
    vehicleType: profile.vehicleType as VehicleType,
    vehicleModel: profile.vehicleModel,
    seats: profile.seats,
    isAC: profile.isAC,
    ratePerKm: profile.ratePerKm,
    dayRate: profile.dayRate,
    photos: profile.photos,
    bio: profile.bio ?? "",
    languages: profile.languages,
  };
}