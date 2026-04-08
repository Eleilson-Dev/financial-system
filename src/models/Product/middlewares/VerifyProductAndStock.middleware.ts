import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../../config/db/database.js";
import { AppError } from "../../../shared/errors/AppError.js";
import {
  parseBarcode,
  type ParsedBarcode,
} from "../../../shared/utils/parseBarcode.js";

export class VerifyProductAndStock {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const { barcode, quantity: queryQuantity } = req.query as {
      barcode?: string;
      quantity?: string;
    };

    const { companyId } = res.locals.encodedToken;

    if (!barcode) {
      throw new AppError(400, "Barcode is required");
    }

    let parsed: ParsedBarcode | null = null;
    let quantity: number;
    let productCode = barcode;

    const bodyQuantity = queryQuantity ? Number(queryQuantity) : undefined;

    if (barcode.startsWith("2")) {
      parsed = parseBarcode(barcode);

      if (parsed.type !== "weighted") {
        throw new AppError(400, "Invalid weighted barcode");
      }

      quantity = parsed.weight;
      productCode = parsed.productCode;
    } else {
      if (!bodyQuantity || bodyQuantity <= 0) {
        throw new AppError(400, "Quantity is required and must be > 0");
      }

      quantity = bodyQuantity;
    }

    const product = await prisma.product.findFirst({
      where: { barcode: productCode, companyId },
    });

    if (!product) {
      throw new AppError(404, `Product not found for barcode ${productCode}`);
    }

    const stock = product.stock?.toNumber() ?? 0;

    if (quantity > stock) {
      throw new AppError(
        400,
        `Insufficient stock for product ${product.name}. Available: ${stock}`,
      );
    }

    res.locals.product = product;
    res.locals.quantity = quantity;

    if (parsed) res.locals.parsedBarcode = parsed;

    next();
  }
}
