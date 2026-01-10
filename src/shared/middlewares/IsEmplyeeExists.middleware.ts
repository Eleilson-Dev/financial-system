import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../errors/AppError.js";

export class IsEmployeeExists {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const employee = await prisma.employee.findUnique({
      where: { cpf: req.body.cpf },
    });

    if (employee) {
      throw new AppError(409, "emplyoee already registered");
    }

    next();
  }
}
