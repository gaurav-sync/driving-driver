import type { RequestHandler } from "express";
import { rateLimit, type Options } from "express-rate-limit";
import helmetPkg from "helmet";

type HelmetFactory = () => RequestHandler;

/** NodeNext + some bundlers expose helmet as default or namespace; normalize at runtime. */
function resolveHelmet(mod: unknown): HelmetFactory {
  if (typeof mod === "function") {
    return mod as HelmetFactory;
  }
  const withDefault = mod as { default?: HelmetFactory };
  if (typeof withDefault.default === "function") {
    return withDefault.default;
  }
  throw new Error("helmet export not found");
}

export const helmetMiddleware = resolveHelmet(helmetPkg);

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
} satisfies Partial<Options>);