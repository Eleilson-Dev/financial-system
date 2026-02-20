import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/db/database.js";
import { AppError } from "../errors/AppError.js";
import dayjs from "dayjs";

export class ResolveOpenCompetency {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const { companyId } = res.locals.encodedToken;

    const lastClosed = await prisma.monthlyClosure.findFirst({
      where: { companyId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    let month: number;
    let year: number;

    if (!lastClosed) {
      const oldestRecord = await prisma.cashRegisterEntry.findFirst({
        where: { cashRegister: { companyId } },
        orderBy: [{ referenceYear: "asc" }, { referenceMonth: "asc" }],
      });

      if (!oldestRecord) {
        throw new AppError(400, "There are no records to close.");
      }

      month = oldestRecord.referenceMonth;
      year = oldestRecord.referenceYear;
    } else {
      const nextCompetency = dayjs()
        .year(lastClosed.year)
        .month(lastClosed.month - 1)
        .add(1, "month");

      month = nextCompetency.month() + 1;
      year = nextCompetency.year();
    }

    res.locals.openCompetency = { month, year };

    return next();
  }
}
