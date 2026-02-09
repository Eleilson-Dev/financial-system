import type { NextFunction, Request, Response } from "express";
import { getMonthlyClosureStatus } from "../utils/getMonthlyClosureStatus.js";

export class AttachMonthlyClosureStatus {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const { role, companyId } = res.locals.encodedToken;

    if (role !== "OWNER" && role !== "ADMIN") {
      return next();
    }

    const closureStatus = await getMonthlyClosureStatus(companyId);
    res.locals.monthlyClosureStatus = closureStatus;

    res.locals.openCompetency = {
      month: closureStatus.month,
      year: closureStatus.year,
    };

    next();
  }
}
