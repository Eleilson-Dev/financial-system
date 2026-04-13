import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../../config/db/database.js";
import { AppError } from "../../../shared/errors/AppError.js";

export class ValidateProductBarcode {
  static async execute(req: Request, res: Response, next: NextFunction) {
    try {
      const { barcode } = req.body;
      const { companyId } = res.locals.encodedToken;

      if (!barcode || typeof barcode !== "string") {
        throw new AppError(400, "Barcode is required");
      }

      const productExists = await prisma.product.findFirst({
        where: {
          barcode,
          companyId,
        },
      });

      if (productExists) {
        throw new AppError(400, "A product with this barcode already exists.");
      }

      next();
    } catch (error) {
      next(error);
    }
  }
}
