import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../errors/AppError.js";

export class IsCashOpen {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const { companyId } = res.locals.encodedToken;

    const response = await prisma.cashRegister.findFirst({
      where: { status: "OPEN", companyId },
    });

    console.log(response);

    response ? (res.locals.cashRegisterId = response.id) : null;

    if (response) {
      throw new AppError(409, "There is already an open cash register");
    }

    next();
  }
}
