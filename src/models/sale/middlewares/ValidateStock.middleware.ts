import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../../config/db/database.js";
import { AppError } from "../../../shared/errors/AppError.js";
import {
  parseBarcode,
  type ParsedBarcode,
} from "../../../shared/utils/parseBarcode.js";
import { Prisma } from "../../../../generated/prisma/client.js";

export class ValidateStock {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const items = req.body.items;
    const { companyId } = res.locals.encodedToken;

    console.log(JSON.stringify(req.body, null, 2));

    if (!items || !Array.isArray(items)) {
      throw new AppError(400, "Items not provided or invalid");
    }

    for (const item of items) {
      if (!item.barcode) continue;

      const parsed: ParsedBarcode = parseBarcode(item.barcode);
      const productCode = parsed.productCode;

      const product = await prisma.product.findUnique({
        where: { barcode_companyId: { barcode: productCode, companyId } },
      });

      if (!product)
        throw new AppError(
          404,
          `Product not found for barcode ${item.barcode}`,
        );

      const isAvulso = product.barcode === "00000";

      const quantity =
        parsed.type === "weighted"
          ? new Prisma.Decimal(parsed.weight)
          : new Prisma.Decimal(isAvulso ? 1 : Number(item.quantity ?? 1));

      const unitPrice =
        isAvulso && product.price.equals(new Prisma.Decimal(0))
          ? new Prisma.Decimal(item.unitPrice ?? 0)
          : product.price;

      const stock = product.stock ?? new Prisma.Decimal(0);
      if (!isAvulso && stock.lessThan(quantity)) {
        throw new AppError(
          400,
          `Insufficient stock for product ${product.name}. Available: ${stock.toString()}, requested: ${quantity.toString()}`,
        );
      }

      item.calculatedQuantity = quantity;
      item.quantity = quantity.toNumber();
      item.productId = product.id;
      item.unitPrice = unitPrice;
    }

    next();
  }
}
