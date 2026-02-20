import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/db/database.js";
import bcrypt from "bcrypt";
import { AppError } from "../errors/AppError.js";

export class ValidatePrivilegedPassword {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const { password } = req.body;
    const { companyId } = res.locals.encodedToken;

    if (!password) {
      throw new AppError(400, "Password is required");
    }

    const privilegedUsers = await prisma.user.findMany({
      where: {
        companyId,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    let authorizedUser = null;

    for (const user of privilegedUsers) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        authorizedUser = user;
        break;
      }
    }

    if (!authorizedUser) {
      throw new AppError(403, "Invalid credentials");
    }

    res.locals.authorizedUser = authorizedUser;

    return next();
  }
}
