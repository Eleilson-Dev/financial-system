import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../errors/AppError.js";

export class RequireOpenCash {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const { userId, companyId } = res.locals.encodedToken;

    const cashOpen = await prisma.cashRegister.findFirst({
      where: {
        status: "OPEN",
        companyId,
        openedById: userId,
      },
    });

    if (!cashOpen) {
      throw new AppError(400, "This user does not have an open cash register.");
    }

    res.locals.cashOpenData = { userId, cashOpen: cashOpen.id };

    return next();
  }
}
