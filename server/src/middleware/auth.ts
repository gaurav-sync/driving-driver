import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../utils/jwt.js";
import type { UserRole } from "../models/User.js";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  try {
    const payload = verifyAccessToken(token);
    req.auth = {
      userId: payload.sub,
      role: payload.role,
      email: payload.email,
    };
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    next(err);
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    next();
  };
}