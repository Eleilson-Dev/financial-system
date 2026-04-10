import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../../config/db/database.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { normalizeText } from "../../../shared/utils/normalizeText.js";

export class ValidateCategoryExistence {
  static async execute(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const { companyId } = res.locals.encodedToken;

      if (!name || typeof name !== "string") {
        throw new AppError(400, "Name is required");
      }

      const nameNormalized = normalizeText(name);

      const categoryExists = await prisma.productCategory.findFirst({
        where: {
          companyId,
          nameNormalized,
        },
      });

      if (categoryExists) {
        throw new AppError(
          400,
          "There is already a category with that name for this company.",
        );
      }

      res.locals.nameNormalized = nameNormalized;

      next();
    } catch (error) {
      next(error);
    }
  }
}
