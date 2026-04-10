import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../../config/db/database.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class ValidateCategoryById {
  static async execute(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.body;
      const encodedToken = res.locals.encodedToken;

      if (!categoryId) {
        throw new AppError(400, "CategoryId is required");
      }

      const category = await prisma.productCategory.findFirst({
        where: {
          id: categoryId,
          companyId: encodedToken.companyId,
        },
      });

      if (!category) {
        throw new AppError(404, "Category not found");
      }

      res.locals.category = category;

      next();
    } catch (error) {
      next(error);
    }
  }
}
