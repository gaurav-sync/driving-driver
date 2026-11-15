import mongoose from "mongoose";
import { DriverProfile } from "../models/DriverProfile.js";
import { Place } from "../models/Place.js";
import { toObjectId } from "../utils/objectId.js";
import type { z } from "zod";
import type {
  createDriverProfileSchema,
  driverSearchQuerySchema,
  updateDriverProfileSchema,
} from "../schemas/driverProfile.schema.js";

const PAGE_SIZE = 20;

type PopulatedBasePlace = { _id: mongoose.Types.ObjectId; name: string; district: string; taluka: string };

type ProfileDoc = {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  fullName: string;
  phone: string;
  basePlaceId: PopulatedBasePlace | mongoose.Types.ObjectId;
  coveredPlaceIds: (PopulatedBasePlace | mongoose.Types.ObjectId)[];
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
  status: string;
  statusNote?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

function refId(value: PopulatedBasePlace | mongoose.Types.ObjectId): string {
  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }
  return value._id.toString();
}

function placeSummary(place: PopulatedBasePlace | mongoose.Types.ObjectId) {
  if (place && typeof place === "object" && "name" in place) {
    return {
      id: place._id.toString(),
      name: place.name,
      district: place.district,
      taluka: place.taluka,
    };
  }
  return { id: refId(place) };
}

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

export type DriverOwnProfile = DriverPublicDetail & {
  status: string;
  statusNote?: string;
  isActive: boolean;
  basePlaceId: string;
  coveredPlaceIds: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

function toListItem(doc: ProfileDoc): DriverListItem {
  const base = doc.basePlaceId;
  const basePlace = placeSummary(base);
  return {
    id: doc._id.toString(),
    fullName: doc.fullName,
    vehicleType: doc.vehicleType,
    vehicleModel: doc.vehicleModel,
    seats: doc.seats,
    isAC: doc.isAC,
    ratePerKm: doc.ratePerKm,
    dayRate: doc.dayRate,
    photo: doc.photos[0] ?? null,
    basePlace: {
      id: basePlace.id,
      name: basePlace.name ?? "",
      taluka:
        typeof base === "object" && "taluka" in base ? base.taluka ?? "" : "",
    },
  };
}

function toPublicDetail(doc: ProfileDoc): DriverPublicDetail {
  const list = toListItem(doc);
  const coveredPlaces = doc.coveredPlaceIds.map((p) => {
    const s = placeSummary(p);
    return { id: s.id, name: s.name ?? "" };
  });
  return {
    ...list,
    phone: doc.phone,
    photos: doc.photos,
    bio: doc.bio,
    languages: doc.languages,
    coveredPlaces,
    coveredDistricts: doc.coveredDistricts,
    maxDistanceKm: doc.maxDistanceKm,
  };
}

function toOwnProfile(doc: ProfileDoc): DriverOwnProfile {
  const detail = toPublicDetail(doc);
  return {
    ...detail,
    status: doc.status,
    statusNote: doc.statusNote,
    isActive: doc.isActive,
    basePlaceId: refId(doc.basePlaceId),
    coveredPlaceIds: doc.coveredPlaceIds.map((p) => refId(p)),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function assertPlacesExist(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const count = await Place.countDocuments({
    _id: { $in: ids.map(toObjectId) },
  });
  if (count !== ids.length) {
    throw new Error("invalid_place");
  }
}

export async function createDriverProfile(
  userId: string,
  data: z.infer<typeof createDriverProfileSchema>
): Promise<DriverOwnProfile> {
  const existing = await DriverProfile.findOne({ userId: toObjectId(userId) });
  if (existing) {
    throw new Error("profile_exists");
  }

  const placeIds = [data.basePlaceId, ...data.coveredPlaceIds];
  await assertPlacesExist(placeIds);

  const doc = await DriverProfile.create({
    userId: toObjectId(userId),
    ...data,
    basePlaceId: toObjectId(data.basePlaceId),
    coveredPlaceIds: data.coveredPlaceIds.map(toObjectId),
    status: "pending",
    isActive: true,
  });

  const populated = await DriverProfile.findById(doc._id)
    .populate("basePlaceId", "name district taluka")
    .populate("coveredPlaceIds", "name district taluka")
    .lean<ProfileDoc | null>();

  if (!populated) throw new Error("not_found");
  return toOwnProfile(populated);
}

export async function updateDriverProfile(
  userId: string,
  data: z.infer<typeof updateDriverProfileSchema>
): Promise<DriverOwnProfile | null> {
  const profile = await DriverProfile.findOne({ userId: toObjectId(userId) });
  if (!profile) return null;

  const placeIds: string[] = [];
  if (data.basePlaceId) placeIds.push(data.basePlaceId);
  if (data.coveredPlaceIds) placeIds.push(...data.coveredPlaceIds);
  await assertPlacesExist(placeIds);

  const patch: Record<string, unknown> = { ...data };
  if (data.basePlaceId) patch.basePlaceId = toObjectId(data.basePlaceId);
  if (data.coveredPlaceIds) {
    patch.coveredPlaceIds = data.coveredPlaceIds.map(toObjectId);
  }

  await DriverProfile.updateOne({ _id: profile._id }, { $set: patch });

  const populated = await DriverProfile.findById(profile._id)
    .populate("basePlaceId", "name district taluka")
    .populate("coveredPlaceIds", "name district taluka")
    .lean<ProfileDoc | null>();

  return populated ? toOwnProfile(populated) : null;
}

export async function getOwnDriverProfile(
  userId: string
): Promise<DriverOwnProfile | null> {
  const doc = await DriverProfile.findOne({ userId: toObjectId(userId) })
    .populate("basePlaceId", "name district taluka")
    .populate("coveredPlaceIds", "name district taluka")
    .lean<ProfileDoc | null>();
  return doc ? toOwnProfile(doc) : null;
}

export async function setDriverActive(
  userId: string,
  isActive?: boolean
): Promise<DriverOwnProfile | null> {
  const profile = await DriverProfile.findOne({ userId: toObjectId(userId) });
  if (!profile) return null;

  const next =
    typeof isActive === "boolean" ? isActive : !profile.isActive;
  await DriverProfile.updateOne({ _id: profile._id }, { $set: { isActive: next } });

  return getOwnDriverProfile(userId);
}

export async function searchDrivers(
  query: z.infer<typeof driverSearchQuerySchema>
): Promise<{ drivers: DriverListItem[]; page: number; totalPages: number; total: number }> {
  const place = await Place.findById(query.placeId).lean<{
    _id: mongoose.Types.ObjectId;
    district: string;
  } | null>();
  if (!place) {
    return { drivers: [], page: query.page, totalPages: 0, total: 0 };
  }

  const placeOid = toObjectId(query.placeId);
  const coverage = {
    $or: [
      { basePlaceId: placeOid },
      { coveredPlaceIds: placeOid },
      { coveredDistricts: place.district },
    ],
  };

  const filters: Record<string, unknown> = {
    status: "approved",
    isActive: true,
    ...coverage,
  };

  if (query.vehicleType) filters.vehicleType = query.vehicleType;
  if (query.minSeats) filters.seats = { $gte: query.minSeats };
  if (query.ac === true) filters.isAC = true;

  const total = await DriverProfile.countDocuments(filters);
  const totalPages = total === 0 ? 0 : Math.ceil(total / PAGE_SIZE);
  const skip = (query.page - 1) * PAGE_SIZE;

  const docs = await DriverProfile.find(filters)
    .populate("basePlaceId", "name district taluka")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(PAGE_SIZE)
    .lean<ProfileDoc[]>();

  return {
    drivers: docs.map(toListItem),
    page: query.page,
    totalPages,
    total,
  };
}

export async function getApprovedDriverById(
  id: string
): Promise<DriverPublicDetail | null> {
  const doc = await DriverProfile.findOne({
    _id: toObjectId(id),
    status: "approved",
    isActive: true,
  })
    .populate("basePlaceId", "name district taluka")
    .populate("coveredPlaceIds", "name district taluka")
    .lean<ProfileDoc | null>();

  return doc ? toPublicDetail(doc) : null;
}