import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../shared/errors/AppError.js";

export class CleanSaleItems {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const items = req.body.items;

    if (!items || !Array.isArray(items)) {
      throw new AppError(400, "Items not provided or invalid");
    }

    req.body.items = items.map((item: any) => {
      const cleaned: any = {
        barcode: item.barcode,
      };

      if (item.quantity !== undefined && !isNaN(item.quantity)) {
        cleaned.quantity = item.quantity;
      }

      if (item.unitPrice !== undefined && !isNaN(item.unitPrice)) {
        cleaned.unitPrice = item.unitPrice;
      }

      if (item.parsedBarcode) {
        cleaned.parsedBarcode = item.parsedBarcode;
      }

      return cleaned;
    });

    next();
  }
}
