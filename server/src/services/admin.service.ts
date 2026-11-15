import mongoose from "mongoose";
import { DriverProfile } from "../models/DriverProfile.js";
import { toObjectId } from "../utils/objectId.js";
import type { z } from "zod";
import type {
  adminDriversQuerySchema,
  adminSetDriverStatusSchema,
} from "../schemas/admin.schema.js";
import type { ProfileStatus } from "../models/DriverProfile.js";

const ADMIN_PAGE_SIZE = 20;

type AdminDriverRow = {
  id: string;
  fullName: string;
  phone: string;
  status: string;
  statusNote?: string;
  isActive: boolean;
  vehicleType: string;
  vehicleModel: string;
  seats: number;
  isAC: boolean;
  ratePerKm: number;
  dayRate: number;
  photos: string[];
  bio?: string;
  languages: string[];
  basePlace: { id: string; name: string; district: string; taluka: string };
  coveredDistricts: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

type ProfileDoc = {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  phone: string;
  status: string;
  statusNote?: string;
  isActive: boolean;
  vehicleType: string;
  vehicleModel: string;
  seats: number;
  isAC: boolean;
  ratePerKm: number;
  dayRate: number;
  photos: string[];
  bio?: string;
  languages: string[];
  coveredDistricts: string[];
  basePlaceId: {
    _id: mongoose.Types.ObjectId;
    name: string;
    district: string;
    taluka: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
};

function toAdminRow(doc: ProfileDoc): AdminDriverRow {
  return {
    id: doc._id.toString(),
    fullName: doc.fullName,
    phone: doc.phone,
    status: doc.status,
    statusNote: doc.statusNote,
    isActive: doc.isActive,
    vehicleType: doc.vehicleType,
    vehicleModel: doc.vehicleModel,
    seats: doc.seats,
    isAC: doc.isAC,
    ratePerKm: doc.ratePerKm,
    dayRate: doc.dayRate,
    photos: doc.photos,
    bio: doc.bio,
    languages: doc.languages,
    basePlace: {
      id: doc.basePlaceId._id.toString(),
      name: doc.basePlaceId.name,
      district: doc.basePlaceId.district,
      taluka: doc.basePlaceId.taluka,
    },
    coveredDistricts: doc.coveredDistricts,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function listDriversForAdmin(
  query: z.infer<typeof adminDriversQuerySchema>
): Promise<{
  drivers: AdminDriverRow[];
  page: number;
  totalPages: number;
  total: number;
}> {
  const filter = { status: query.status };
  const total = await DriverProfile.countDocuments(filter);
  const totalPages = total === 0 ? 0 : Math.ceil(total / ADMIN_PAGE_SIZE);
  const skip = (query.page - 1) * ADMIN_PAGE_SIZE;

  const docs = await DriverProfile.find(filter)
    .populate("basePlaceId", "name district taluka")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(ADMIN_PAGE_SIZE)
    .lean<ProfileDoc[]>();

  return {
    drivers: docs.map(toAdminRow),
    page: query.page,
    totalPages,
    total,
  };
}

export async function setDriverStatus(
  driverProfileId: string,
  data: z.infer<typeof adminSetDriverStatusSchema>
): Promise<AdminDriverRow | null> {
  const update: {
    $set: { status: ProfileStatus; statusNote?: string };
    $unset?: { statusNote: 1 };
  } = { $set: { status: data.status as ProfileStatus } };

  if (data.status === "rejected" || data.status === "suspended") {
    update.$set.statusNote = data.reason;
  } else {
    update.$unset = { statusNote: 1 };
  }

  const doc = await DriverProfile.findByIdAndUpdate(
    toObjectId(driverProfileId),
    update,
    { new: true, runValidators: true }
  )
    .populate("basePlaceId", "name district taluka")
    .lean<ProfileDoc | null>();

  return doc ? toAdminRow(doc) : null;
}

export async function getDriverForAdmin(
  driverProfileId: string
): Promise<AdminDriverRow | null> {
  const doc = await DriverProfile.findById(toObjectId(driverProfileId))
    .populate("basePlaceId", "name district taluka")
    .populate("coveredPlaceIds", "name")
    .lean<ProfileDoc | null>();

  return doc ? toAdminRow(doc) : null;
}