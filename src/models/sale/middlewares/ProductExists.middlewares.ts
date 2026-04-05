import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../../config/db/database.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { parseBarcode, type ParsedBarcode } from "../utils/parseBarcode.js";

export class ProductExists {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const items = req.body.items;
    const { companyId } = res.locals.encodedToken;

    if (!items || !Array.isArray(items)) {
      throw new AppError(400, "Items not provided or invalid");
    }

    for (const item of items) {
      const parsed: ParsedBarcode = parseBarcode(item.barcode);
      const productCode = parsed.productCode;

      const product = await prisma.product.findUnique({
        where: {
          barcode_companyId: {
            barcode: productCode,
            companyId,
          },
        },
      });

      if (!product) {
        throw new AppError(
          404,
          `Product not found for barcode ${item.barcode}`,
        );
      }

      item.parsedBarcode = parsed;

      if (product.barcode === "00000" && product.price.equals(0)) {
        if (!item.unitPrice) {
          throw new AppError(
            400,
            `Unit price is required for Avulso product (barcode 00000)`,
          );
        }
      }
    }

    next();
  }
}
