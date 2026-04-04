import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../../config/db/database.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class ValidateCategoryExistence {
  static async execute(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const encodedToken = res.locals.encodedToken;

      const normalizedInput = name.replace(/\s+/g, "").toLowerCase();

      const allCategories = await prisma.productCategory.findMany({
        where: { companyId: encodedToken.companyId },
      });

      const duplicate = allCategories.find(
        (cat) => cat.name.replace(/\s+/g, "").toLowerCase() === normalizedInput,
      );

      if (duplicate) {
        throw new AppError(
          400,
          "There is already a category with that name for this company.",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  }
}
