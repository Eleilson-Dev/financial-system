import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../errors/AppError.js";

export class VerifyAdm {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const { userId, companyId, role } = res.locals.encodedToken;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (role !== "OWNER" && role !== "ADMIN") {
      throw new AppError(403, "Forbidden: user must be OWNER or ADM");
    }

    next();
  }
}
