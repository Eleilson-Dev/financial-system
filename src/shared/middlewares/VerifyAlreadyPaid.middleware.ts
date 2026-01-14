import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../errors/AppError.js";
import { getCurrentCompetency } from "../utils/getCurrentCompetency.js";

export class VerifyAlreadyPaid {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const { month, year } = getCurrentCompetency();

    const { employeeId } = req.query;

    const { userId, companyId, role } = res.locals.encodedToken;

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

    const salary = employee.salary.toNumber();

    if (!salary || salary <= 0) {
      throw new AppError(400, "Funcionário não possui salário válido");
    }

    const alreadyPaid = await prisma.salaryPayment.findFirst({
      where: {
        employeeId,
        companyId,
        referenceMonth: month,
        referenceYear: year,
      },
    });

    if (alreadyPaid) {
      throw new AppError(409, "Salário já foi pago este mês");
    }

    res.locals = { companyId, salary, employeeId, userId };

    next();
  }
}
