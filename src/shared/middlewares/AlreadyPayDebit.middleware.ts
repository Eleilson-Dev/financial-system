import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../errors/AppError.js";
import { Prisma } from "../../../generated/prisma/client.js";

export class AlreadyPayDebit {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const { customerId } = req.params;
    const { amount } = req.body;

    const amountDecimal = new Prisma.Decimal(amount);

    if (!customerId) {
      throw new AppError(400, "Customer not informed");
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        account: true,
      },
    });

    if (!customer) {
      throw new AppError(404, "Customer not found");
    }

    if (customer.account?.balance.lessThan(amountDecimal)) {
      throw new AppError(
        400,
        "The reported value is greater than the customer's debt.",
      );
    }

    if (customer.account?.balance.equals(0)) {
      throw new AppError(400, "The customer has no outstanding debt.");
    }

    next();
  }
}
