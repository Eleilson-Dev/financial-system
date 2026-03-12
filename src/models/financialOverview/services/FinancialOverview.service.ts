import { injectable } from "tsyringe";
import { getOpenCompetency } from "../../../shared/utils/getOpenCompetency.js";
import { prisma } from "../../../config/db/database.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class FinancialOverviewService {
  getFinancialSummary = async (companyId: string) => {
    try {
      const { month, year } = await getOpenCompetency(companyId);

      const result = await prisma.$transaction(async (tx) => {
        const cashAccount = await tx.cashAccount.findFirst({
          where: { companyId },
        });

        const revenue = await tx.cashAccountTransaction.aggregate({
          _sum: { amount: true },
          where: {
            direction: "IN",
            type: { in: ["SALE", "INCOME"] },
            referenceMonth: month,
            referenceYear: year,
            cashAccount: { companyId },
          },
        });

        const expenses = await tx.cashAccountTransaction.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            direction: "OUT",
            type: { in: ["EXPENSE", "SALARY_PAYMENT"] },
            referenceMonth: month,
            referenceYear: year,
            cashAccount: {
              companyId,
            },
          },
        });

        const totalSalaries = await tx.employee.aggregate({
          _sum: { salary: true },
          where: { companyId },
        });

        const paidSalaries = await tx.salaryPayment.aggregate({
          _sum: { amount: true },
          where: {
            companyId,
            referenceMonth: month,
            referenceYear: year,
          },
        });

        const salesRevenue = await tx.cashAccountTransaction.aggregate({
          _sum: { amount: true },
          where: {
            direction: "IN",
            type: "SALE",
            referenceMonth: month,
            referenceYear: year,
            cashAccount: { companyId },
          },
        });

        const salesCount = await tx.cashAccountTransaction.count({
          where: {
            direction: "IN",
            type: "SALE",
            referenceMonth: month,
            referenceYear: year,
            cashAccount: { companyId },
          },
        });

        const salariesToPay =
          Number(totalSalaries._sum.salary ?? 0) -
          Number(paidSalaries._sum.amount ?? 0);

        const balance = Number(cashAccount?.balance ?? 0);
        const totalRevenue = Number(revenue._sum.amount ?? 0);
        const totalSalesRevenue = Number(salesRevenue._sum.amount ?? 0);
        const totalExpenses = Number(expenses._sum.amount ?? 0);
        const profit = totalRevenue - totalExpenses;

        const ticketAverage = totalSalesRevenue / salesCount;

        return {
          balance,
          salariesToPay,
          totalRevenue,
          totalExpenses,
          salesCount,
          ticketAverage,
          profit,
        };
      });

      return {
        ...result,
        reference: { month, year },
      };
    } catch (error) {
      console.log(error);
      throw new AppError(500, "Error getting summary");
    }
  };

  getMonthlyGraph = async (companyId: string) => {
    const { month: currentMonth, year } = await getOpenCompetency(companyId);

    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
      profit: 0,
    }));

    const result = await prisma.$transaction(async (tx) => {
      const closedMonths = await tx.monthlyClosure.findMany({
        where: { companyId, year },
      });

      for (const closed of closedMonths) {
        const index = closed.month - 1;
        const monthItem = months[index];

        if (monthItem) {
          monthItem.revenue = Number(closed.totalRevenue);
          monthItem.profit = Number(closed.profit);
        }
      }

      const alreadyClosed = closedMonths.find((m) => m.month === currentMonth);

      if (!alreadyClosed) {
        const revenue = await tx.cashAccountTransaction.aggregate({
          _sum: { amount: true },
          where: {
            direction: "IN",
            type: { in: ["SALE", "INCOME"] },
            referenceMonth: currentMonth,
            referenceYear: year,
            cashAccount: { companyId },
          },
        });

        const expenses = await tx.cashAccountTransaction.aggregate({
          _sum: { amount: true },
          where: {
            direction: "OUT",
            type: { in: ["EXPENSE", "SALARY_PAYMENT"] },
            referenceMonth: currentMonth,
            referenceYear: year,
            cashAccount: { companyId },
          },
        });

        const totalRevenue = Number(revenue._sum.amount ?? 0);
        const totalExpenses = Number(expenses._sum.amount ?? 0);

        const currentMonthData = months[currentMonth - 1];

        if (currentMonthData) {
          currentMonthData.revenue = totalRevenue;
          currentMonthData.profit = totalRevenue - totalExpenses;
        }
      }

      const maxRevenue = await tx.monthlyClosure.aggregate({
        _max: { totalRevenue: true },
        where: { companyId },
      });

      const maxProfit = await tx.monthlyClosure.aggregate({
        _max: { profit: true },
        where: { companyId },
      });

      const maxRevenueValue = Math.max(
        Number(maxRevenue._max.totalRevenue ?? 0),
        months[currentMonth - 1]?.revenue ?? 0,
      );

      const maxProfitValue = Math.max(
        Number(maxProfit._max.profit ?? 0),
        months[currentMonth - 1]?.profit ?? 0,
      );

      return {
        months,
        maxRevenue: maxRevenueValue,
        maxProfit: maxProfitValue,
      };
    });

    return result;
  };
}
