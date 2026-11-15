import type { Request, Response, NextFunction } from "express";
import { z, type ZodType } from "zod";

type RequestParts = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

export function validate(schemas: RequestParts) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Request["query"];
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Request["params"];
      }
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          error: "validation_error",
          details: err.flatten(),
        });
        return;
      }
      next(err);
    }
  };
}