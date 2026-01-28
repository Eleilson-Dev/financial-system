import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../errors/AppError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class VerifyLoginUser {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const email = req.body.email.toLowerCase();

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new AppError(404, "Email or password does not match");
    }

    if (req.body.password) {
      const compare = await bcrypt.compare(
        req.body.password,
        user.password as string,
      );

      if (!compare) {
        throw new AppError(401, "Email or password does not match");
      }
    }

    const accessToken = jwt.sign(
      {
        userId: user.id,
        companyId: user.companyId,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" },
    );

    res.locals.userLoginResult = {
      userId: user.id,
      userName: user.name,
      companyId: user.companyId,
      role: user.role,
      accessToken,
    };

    next();
  }
}
