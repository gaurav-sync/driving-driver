import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { getUserById, updateUserProfile } from "../services/user.service.js";
import { phoneSchema } from "../utils/phone.js";

const updateMeSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    phone: phoneSchema.optional(),
    email: z.string().trim().email().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const meRouter = Router();

meRouter.use(requireAuth);

meRouter.get("/", async (req, res, next) => {
  try {
    const user = await getUserById(req.auth!.userId);
    if (!user) {
      res.status(404).json({ error: "not_found" });
      return;
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

meRouter.put(
  "/",
  validate({ body: updateMeSchema }),
  async (req, res, next) => {
    try {
      const body = req.body as z.infer<typeof updateMeSchema>;
      try {
        const user = await updateUserProfile(req.auth!.userId, body);
        if (!user) {
          res.status(404).json({ error: "not_found" });
          return;
        }
        res.json({ user });
      } catch (err) {
        if (
          err &&
          typeof err === "object" &&
          "code" in err &&
          (err as { code: number }).code === 11000
        ) {
          res.status(409).json({ error: "email_already_in_use" });
          return;
        }
        throw err;
      }
    } catch (err) {
      next(err);
    }
  }
);