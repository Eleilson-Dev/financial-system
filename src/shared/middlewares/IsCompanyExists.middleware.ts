import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/db/database.js";
import { AppError } from "../errors/AppError.js";

export class IsCompanyExists {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const document = req.body?.company?.document;

    if (!document) {
      throw new AppError(400, "Company document is required");
    }

    const company = await prisma.company.findUnique({
      where: { document },
    });

    if (company) {
      throw new AppError(409, "Company already exists");
    }

    next();
  }
}
