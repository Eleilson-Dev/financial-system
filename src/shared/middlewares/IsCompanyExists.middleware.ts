import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/db/database.js";
import { AppError } from "../errors/AppError.js";

export class IsCompanyExits {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const response = await prisma.company.findFirst({
      where: { document: req.body.document },
    });

    if (response) {
      throw new AppError(409, "Company already exits");
    }

    next();
  }
}
