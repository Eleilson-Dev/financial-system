import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../errors/AppError.js";

export class VerifySalaryPayment {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const { companyId } = res.locals.encodedToken;
    const salary = res.locals.employeeSalary;

    if (!companyId || salary === undefined) {
      throw new AppError(400, "Insufficient data to verify payment.");
    }

    const cashAccount = await prisma.cashAccount.findUnique({
      where: { companyId },
    });

    if (!cashAccount) {
      throw new AppError(400, "Company financial account not found.");
    }

    if (cashAccount.balance.toNumber() < salary) {
      throw new AppError(400, "Insufficient funds to pay the salary.");
    }

    next();
  }
}
