import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/db/database.js";
import { AppError } from "../errors/AppError.js";

export class IsEmployeeExist {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const { employeeId } = req.params;
    const { companyId } = res.locals.encodedToken;

    if (!employeeId || typeof employeeId !== "string") {
      return res.status(400).json({
        message: "employeeId is required and must be a string.",
      });
    }

    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        companyId,
        isActive: true,
      },
    });

    if (!employee) {
      throw new AppError(404, "Employee not found or inactive");
    }

    next();
  }
}
