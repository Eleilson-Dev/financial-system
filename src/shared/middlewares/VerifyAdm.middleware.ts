import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/db/database.js";
import { AppError } from "../errors/AppError.js";

export class VerifyAdmin {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const { userId, companyId, role } = res.locals.encodedToken;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError(401, "No users logged in");
    }

    if (role !== "OWNER" && role !== "ADMIN") {
      throw new AppError(403, "Forbidden: user must be OWNER or ADMIN");
    }

    next();
  }
}
