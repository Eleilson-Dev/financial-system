import type { NextFunction, Request, Response } from "express";
import { getMonthlyClosureStatus } from "../utils/getMonthlyClosureStatus.js";

export class AttachMonthlyClosureStatus {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const { role, companyId } = res.locals.encodedToken;

    // Operator não vê
    if (role !== "OWNER" && role !== "ADMIN") {
      return next();
    }

    const status = await getMonthlyClosureStatus(companyId);

    // injeta globalmente
    res.locals.monthlyClosureStatus = status;

    next();
  }
}
