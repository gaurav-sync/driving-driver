import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { verifyGoogleIdToken } from "../services/googleAuth.service.js";
import {
  createGoogleUser,
  findByGoogleAuth,
  findByEmail,
  linkGoogleAuthIfNeeded,
  toPublicUser,
} from "../services/user.service.js";
import { signAccessToken } from "../utils/jwt.js";
import { phoneSchema } from "../utils/phone.js";

const signupRoles = ["customer", "driver"] as const;

const googleAuthBodySchema = z.object({
  idToken: z.string().min(1),
  role: z.enum(signupRoles).optional(),
  name: z.string().trim().min(1).max(100).optional(),
  phone: phoneSchema.optional(),
});

export const authRouter = Router();

authRouter.post(
  "/google",
  validate({ body: googleAuthBodySchema }),
  async (req, res, next) => {
    try {
      const body = req.body as z.infer<typeof googleAuthBodySchema>;
      let googleProfile;
      try {
        googleProfile = await verifyGoogleIdToken(body.idToken);
      } catch {
        res.status(401).json({ error: "invalid_google_token" });
        return;
      }

      const existing =
        (await findByGoogleAuth(googleProfile.sub)) ??
        (await findByEmail(googleProfile.email));

      if (existing) {
        try {
          await linkGoogleAuthIfNeeded(
            existing._id.toString(),
            googleProfile.sub
          );
        } catch (err) {
          if (err instanceof Error && err.message === "auth_provider_mismatch") {
            res.status(409).json({ error: "account_linked_elsewhere" });
            return;
          }
          throw err;
        }
        const token = signAccessToken({
          sub: existing._id.toString(),
          email: existing.email,
          role: existing.role,
        });
        res.json({
          token,
          user: toPublicUser(existing),
        });
        return;
      }

      const name = body.name ?? googleProfile.name;
      const missing: string[] = [];
      if (!body.role) missing.push("role");
      if (!name) missing.push("name");
      if (!body.phone) missing.push("phone");

      if (missing.length > 0) {
        res.status(422).json({
          needsProfile: true,
          email: googleProfile.email,
          suggestedName: googleProfile.name,
          missing,
        });
        return;
      }

      const user = await createGoogleUser({
        authId: googleProfile.sub,
        email: googleProfile.email,
        name: name!,
        phone: body.phone!,
        role: body.role,
      });

      const token = signAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      res.status(201).json({ token, user });
    } catch (err) {
      if (err instanceof Error && err.message === "role_required") {
        res.status(422).json({
          needsProfile: true,
          missing: ["role"],
        });
        return;
      }
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code: number }).code === 11000
      ) {
        res.status(409).json({ error: "email_already_registered" });
        return;
      }
      next(err);
    }
  }
);