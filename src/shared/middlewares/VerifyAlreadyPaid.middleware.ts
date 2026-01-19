import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../errors/AppError.js";
import { getCurrentCompetency } from "../utils/getCurrentCompetency.js";

export class VerifyAlreadyPaid {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const { month, year } = getCurrentCompetency();

    const { employeeId } = req.params;

    const { userId, companyId, role } = res.locals.encodedToken;

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

    const salary = employee.salary.toNumber();

    if (!salary || salary <= 0) {
      throw new AppError(400, "Employee does not have a valid salary.");
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
      throw new AppError(409, "Salary has already been paid this month.");
    }

    res.locals = { companyId, salary, employeeId, userId };

    next();
  }
}
