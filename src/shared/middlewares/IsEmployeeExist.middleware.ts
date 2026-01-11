import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../errors/AppError.js";

export class IsEmployeeExist {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const { employeeId } = req.query;
    const { companyId } = res.locals.encodedToken;

    if (!employeeId || typeof employeeId !== "string") {
      return res.status(400).json({
        message: "employeeId é obrigatório e deve ser uma string",
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
      throw new AppError(404, "Funcionário não encontrado ou inativo");
    }

    next();
  }
}
