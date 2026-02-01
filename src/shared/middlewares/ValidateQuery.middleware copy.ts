import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ZodError } from "zod";

export class ValidateQuery {
  static execute<T>(schema: ZodType<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        res.locals.query = schema.parse(req.query);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).json({
            message: "Erro de validação",
            issues: error.issues,
          });
        }
        next(error);
      }
    };
  }
}
