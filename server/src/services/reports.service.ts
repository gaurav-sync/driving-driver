import mongoose from "mongoose";
import { Report } from "../models/Report.js";
import { DriverProfile } from "../models/DriverProfile.js";
import { toObjectId } from "../utils/objectId.js";
import type { z } from "zod";
import type { createReportSchema } from "../schemas/report.schema.js";

export type ReportRecord = {
  id: string;
  driverId: string;
  driverName: string;
  reportedBy: string;
  reporterName: string;
  reason: string;
  note?: string;
  status: string;
  createdAt?: Date;
};

export type FlaggedDriver = {
  driverId: string;
  driverName: string;
  openReportCount: number;
};

export async function createReport(
  customerUserId: string,
  data: z.infer<typeof createReportSchema>
): Promise<ReportRecord> {
  const driver = await DriverProfile.findById(toObjectId(data.driverId))
    .select("fullName status")
    .lean<{ _id: mongoose.Types.ObjectId; fullName: string; status: string } | null>();

  if (!driver || driver.status !== "approved") {
    throw new Error("driver_not_found");
  }

  const existing = await Report.findOne({
    driverId: driver._id,
    reportedBy: toObjectId(customerUserId),
  }).lean();

  if (existing) {
    throw new Error("already_reported");
  }

  const doc = await Report.create({
    driverId: driver._id,
    reportedBy: toObjectId(customerUserId),
    reason: data.reason,
    note: data.note,
    status: "open",
  });

  return {
    id: doc._id.toString(),
    driverId: driver._id.toString(),
    driverName: driver.fullName,
    reportedBy: customerUserId,
    reporterName: "",
    reason: doc.reason,
    note: doc.note,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}

const ADMIN_REPORTS_PAGE = 50;

export async function listOpenReportsForAdmin(page = 1): Promise<{
  reports: ReportRecord[];
  flaggedDrivers: FlaggedDriver[];
  page: number;
  totalPages: number;
  total: number;
}> {
  const filter = { status: "open" as const };
  const total = await Report.countDocuments(filter);
  const totalPages = total === 0 ? 0 : Math.ceil(total / ADMIN_REPORTS_PAGE);
  const skip = (page - 1) * ADMIN_REPORTS_PAGE;

  const rows = await Report.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(ADMIN_REPORTS_PAGE)
    .populate("driverId", "fullName")
    .populate("reportedBy", "name")
    .lean<
      {
        _id: mongoose.Types.ObjectId;
        driverId: { _id: mongoose.Types.ObjectId; fullName: string };
        reportedBy: { _id: mongoose.Types.ObjectId; name: string };
        reason: string;
        note?: string;
        status: string;
        createdAt?: Date;
      }[]
    >();

  const reports: ReportRecord[] = rows.map((r) => ({
    id: r._id.toString(),
    driverId: r.driverId._id.toString(),
    driverName: r.driverId.fullName,
    reportedBy: r.reportedBy._id.toString(),
    reporterName: r.reportedBy.name,
    reason: r.reason,
    note: r.note,
    status: r.status,
    createdAt: r.createdAt,
  }));

  const flaggedAgg = await Report.aggregate<{
    _id: mongoose.Types.ObjectId;
    count: number;
  }>([
    { $match: { status: "open" } },
    { $group: { _id: "$driverId", count: { $sum: 1 } } },
    { $match: { count: { $gte: 3 } } },
    { $sort: { count: -1 } },
  ]);

  const flaggedIds = flaggedAgg.map((f) => f._id);
  const driverNames =
    flaggedIds.length > 0
      ? await DriverProfile.find({ _id: { $in: flaggedIds } })
          .select("fullName")
          .lean<{ _id: mongoose.Types.ObjectId; fullName: string }[]>()
      : [];

  const nameById = new Map(
    driverNames.map((d) => [d._id.toString(), d.fullName])
  );

  const flaggedDrivers: FlaggedDriver[] = flaggedAgg.map((f) => ({
    driverId: f._id.toString(),
    driverName: nameById.get(f._id.toString()) ?? "",
    openReportCount: f.count,
  }));

  return { reports, flaggedDrivers, page, totalPages, total };
}

export async function resolveReport(
  reportId: string
): Promise<ReportRecord | null> {
  const doc = await Report.findOneAndUpdate(
    { _id: toObjectId(reportId), status: "open" },
    { $set: { status: "resolved" } },
    { new: true }
  )
    .populate("driverId", "fullName")
    .populate("reportedBy", "name")
    .lean<{
      _id: mongoose.Types.ObjectId;
      driverId: { _id: mongoose.Types.ObjectId; fullName: string };
      reportedBy: { _id: mongoose.Types.ObjectId; name: string };
      reason: string;
      note?: string;
      status: string;
      createdAt?: Date;
    } | null>();

  if (!doc) return null;

  return {
    id: doc._id.toString(),
    driverId: doc.driverId._id.toString(),
    driverName: doc.driverId.fullName,
    reportedBy: doc.reportedBy._id.toString(),
    reporterName: doc.reportedBy.name,
    reason: doc.reason,
    note: doc.note,
    status: doc.status,
    createdAt: doc.createdAt,
  };
}