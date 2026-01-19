import { injectable } from "tsyringe";
import { prisma } from "../../../config/database.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { getCompetencyPeriod } from "../../../shared/utils/getCompetencyPeriod.js";
import dayjs from "dayjs";

interface CloseMonthParams {
  companyId: string;
  userId: string;
  month: number;
  year: number;
}

@injectable()
export class MonthlyClosureService {
  closeMonth = async ({ companyId, userId, month, year }: CloseMonthParams) => {
    const result = await prisma.$transaction(async (tx) => {
      const alreadyClosed = await tx.monthlyClosure.findFirst({
        where: { companyId, month, year },
      });

      if (alreadyClosed) {
        throw new AppError(409, "This month has already closed.");
      }

      const { start, end } = getCompetencyPeriod(month, year);

      const [inflow, expenses, salaries] = await Promise.all([
        tx.cashRegisterEntry.aggregate({
          where: {
            direction: "IN",
            referenceMonth: month,
            referenceYear: year,
            cashRegister: { companyId },
          },
          _sum: { amount: true },
        }),
        tx.expense.aggregate({
          where: {
            companyId,
            referenceMonth: month,
            referenceYear: year,
          },
          _sum: { amount: true },
        }),
        prisma.salaryPayment.aggregate({
          where: {
            companyId,
            referenceMonth: month,
            referenceYear: year,
          },
          _sum: { amount: true },
        }),
      ]);

      const totalRevenue = Number(inflow._sum.amount ?? 0);
      const totalExpenses = Number(expenses._sum.amount ?? 0);
      const totalSalaries = Number(salaries._sum.amount ?? 0);

      const profit = totalRevenue - (totalExpenses + totalSalaries);

      const expectedCloseDate = dayjs()
        .year(year)
        .month(month)
        .date(5)
        .endOf("day");

      const isEarlyClosure = dayjs().isBefore(expectedCloseDate);

      const closure = await prisma.monthlyClosure.create({
        data: {
          month,
          year,
          periodStart: start,
          periodEnd: end,
          totalRevenue,
          totalExpenses,
          totalSalaries,
          profit,
          isEarlyClosure,
          companyId,
          closedById: userId,
        },
      });

      return closure;
    });

    return result;
  };

  showMonthClosed = async (companyId: string) => {
    const result = await prisma.$transaction(async (tx) => {
      const allClosingMonths = await tx.monthlyClosure.findMany({
        where: { companyId },
      });

      return allClosingMonths;
    });

    return result;
  };
}
