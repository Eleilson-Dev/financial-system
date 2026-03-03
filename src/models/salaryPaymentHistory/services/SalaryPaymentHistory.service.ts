import { injectable } from "tsyringe";
import { prisma } from "../../../config/db/database.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { Prisma } from "../../../../generated/prisma/client.js";

@injectable()
export class SalaryPaymentHistoryService {
  salaryIncrease = async (
    employeeId: string,
    newSalaryData: any,
    userId: string,
  ) => {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new AppError(404, "Employee not found");
    }

    const oldSalary = employee.salary;

    if (oldSalary.lte(0)) {
      throw new AppError(400, "Employee does not have a valid salary.");
    }

    const newSalary = new Prisma.Decimal(newSalaryData);

    if (newSalary.lte(oldSalary)) {
      throw new AppError(
        400,
        "The new salary should be higher than the current salary.",
      );
    }

    const increaseValue = newSalary.minus(oldSalary);

    const result = await prisma.$transaction(async (tx) => {
      const history = await tx.employeeSalaryHistory.create({
        data: {
          employeeId,
          oldSalary,
          newSalary,
          increase: increaseValue,
          reason: "Aumento salarial",
          changedById: userId,
        },
      });

      const employeeUpdated = await tx.employee.update({
        where: { id: employeeId },
        data: { salary: newSalary },
      });

      return { history, employeeUpdated };
    });

    return result;
  };
}
