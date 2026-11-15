import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { UserRole } from "../models/User.js";

const TOKEN_TTL = "30d";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export function signAccessToken(payload: AccessTokenPayload): string {
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded !== "object" || decoded === null) {
    throw new jwt.JsonWebTokenError("Invalid token payload");
  }
  const { sub, email, role } = decoded as AccessTokenPayload;
  if (!sub || !email || !role) {
    throw new jwt.JsonWebTokenError("Invalid token payload");
  }
  return { sub, email, role };
}