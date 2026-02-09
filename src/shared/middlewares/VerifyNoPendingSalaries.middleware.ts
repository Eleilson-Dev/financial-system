import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../errors/AppError.js";
import { getOpenCompetency } from "../utils/getOpenCompetency.js";

export class VerifyNoPendingSalaries {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const { companyId } = res.locals.encodedToken;

    const { month, year } = await getOpenCompetency(companyId);

    const unpaidCount = await prisma.employee.count({
      where: {
        companyId,
        isActive: true,
        salary: {
          gt: 0,
        },
        salaryPayments: {
          none: {
            referenceMonth: month,
            referenceYear: year,
          },
        },
      },
    });

    console.log(unpaidCount);

    if (unpaidCount > 0) {
      throw new AppError(
        409,
        "There are outstanding salaries this month. Please pay them all before closing",
      );
    }

    res.locals.closureCompetency = { month, year };

    next();
  }
}
