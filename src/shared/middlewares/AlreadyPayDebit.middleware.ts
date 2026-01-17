import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../errors/AppError.js";
import { Prisma } from "../../../generated/prisma/client.js";

export class AlreadyPayDebit {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const { custumerId } = req.params;
    const { amount } = req.body;

    const amountDecimal = new Prisma.Decimal(amount);

    if (!custumerId) {
      throw new AppError(400, "Cliente não informado");
    }

    const custumer = await prisma.customer.findUnique({
      where: { id: custumerId },
      include: {
        account: true,
      },
    });

    if (!custumer) {
      throw new AppError(404, "Cliente não encontrado");
    }

    if (custumer.account?.balance.lessThan(amountDecimal)) {
      throw new AppError(
        400,
        "Valor informado é maior que a dívida do cliente"
      );
    }

    if (custumer.account?.balance.equals(0)) {
      throw new AppError(400, "Cliente não possui dívida em aberto");
    }

    next();
  }
}
