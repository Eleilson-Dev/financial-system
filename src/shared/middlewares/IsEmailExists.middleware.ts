import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../errors/AppError.js";

export class IsEmailExits {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const email = req.body.email.toLowerCase();

    const response = await prisma.user.findFirst({
      where: { email },
    });

    if (response) {
      throw new AppError(409, "Email already exits");
    }

    next();
  }
}
