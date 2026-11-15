import { User, type UserRole } from "../models/User.js";
import { env } from "../config/env.js";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt?: Date;
};

type UserRecord = {
  _id: { toString(): string };
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt?: Date;
};

function userDocToRecord(doc: {
  _id: { toString(): string };
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt?: Date;
}): UserRecord {
  return {
    _id: doc._id,
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    role: doc.role,
    createdAt: doc.createdAt,
  };
}

export function toPublicUser(doc: UserRecord): PublicUser {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    role: doc.role,
    createdAt: doc.createdAt,
  };
}

export async function findByGoogleAuth(authId: string): Promise<UserRecord | null> {
  return User.findOne({ authProvider: "google", authId }).lean() as Promise<UserRecord | null>;
}

export async function findByEmail(email: string): Promise<UserRecord | null> {
  return User.findOne({ email: email.toLowerCase() }).lean() as Promise<UserRecord | null>;
}

function resolveSignupRole(email: string, requested?: UserRole): UserRole {
  const admins = (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (admins.includes(email.toLowerCase())) {
    return "admin";
  }
  if (requested === "customer" || requested === "driver") {
    return requested;
  }
  throw new Error("role_required");
}

export async function createGoogleUser(input: {
  authId: string;
  email: string;
  name: string;
  phone: string;
  role?: UserRole;
}): Promise<PublicUser> {
  const role = resolveSignupRole(input.email, input.role);
  const doc = await User.create({
    name: input.name,
    email: input.email,
    phone: input.phone,
    role,
    authProvider: "google",
    authId: input.authId,
  });
  return toPublicUser(userDocToRecord(doc));
}

export async function linkGoogleAuthIfNeeded(
  userId: string,
  authId: string
): Promise<void> {
  const current = await User.findById(userId)
    .select("authId authProvider")
    .lean<{ authId?: string | null } | null>();
  if (!current) return;
  if (current.authId && current.authId !== authId) {
    throw new Error("auth_provider_mismatch");
  }
  if (!current.authId) {
    await User.updateOne(
      { _id: userId },
      { $set: { authProvider: "google", authId } }
    );
  }
}

export async function updateUserProfile(
  userId: string,
  patch: { name?: string; phone?: string; email?: string }
): Promise<PublicUser | null> {
  const doc = await User.findByIdAndUpdate(
    userId,
    { $set: patch },
    { new: true, runValidators: true }
  );
  return doc ? toPublicUser(userDocToRecord(doc)) : null;
}

export async function getUserById(userId: string): Promise<PublicUser | null> {
  const doc = await User.findById(userId).lean<UserRecord | null>();
  if (!doc) return null;
  return toPublicUser(doc);
}