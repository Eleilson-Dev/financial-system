import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../errors/AppError.js";

export class VerifySalaryPayment {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const { companyId, salary } = res.locals;

    if (!companyId || salary === undefined) {
      throw new AppError(400, "Dados insuficientes para verificar pagamento");
    }

    const cashAccount = await prisma.cashAccount.findUnique({
      where: { companyId },
    });

    if (!cashAccount) {
      throw new AppError(400, "Conta financeira da empresa não encontrada");
    }

    if (cashAccount.balance.toNumber() < salary) {
      throw new AppError(400, "Saldo insuficiente para pagar o salário");
    }

    next();
  }
}
