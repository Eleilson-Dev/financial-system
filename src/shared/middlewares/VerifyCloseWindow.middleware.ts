import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";

export class VerifyCloseWindow {
  static execute(req: Request, res: Response, next: NextFunction) {
    const { status, daysRemaining } = res.locals.monthlyClosureStatus;

    const MIN_DAYS_BEFORE_CLOSE = 10;

    if (status === "OPEN" && daysRemaining > MIN_DAYS_BEFORE_CLOSE) {
      throw new AppError(
        409,
        `You can only close the month within the last ${MIN_DAYS_BEFORE_CLOSE} days of the competency.`,
      );
    }

    next();
  }
}
