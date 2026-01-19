import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/database.js";

export class VerifyToken {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const authorization = req.headers.authorization;
    const token = authorization?.replace("Bearer", "").trim();

    if (!token) {
      throw new AppError(401, "Token is required");
    }

    let encodedToken: any;

    encodedToken = jwt.verify(token, process.env.JWT_SECRET as string);

    const { userId, companyId } = encodedToken;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!user || !company) {
      throw new AppError(
        401,
        "Your session is no longer valid. Please log in again.",
      );
    }

    try {
      res.locals.encodedToken = encodedToken;
      next();
    } catch (error: any) {
      const errorMap: Record<string, { status: number; message: string }> = {
        TokenExpiredError: { status: 401, message: "Token expired" },
        JsonWebTokenError: { status: 400, message: "Token is not valid" },
      };

      const { status, message } = errorMap[error.name] || {
        status: 500,
        message: "Internal Server Error",
      };

      throw new AppError(status, message);
    }
  }
}
