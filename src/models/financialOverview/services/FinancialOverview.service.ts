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

  getWeeklyGraph = async (companyId: string) => {
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
    );

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    startOfWeek.setDate(startOfWeek.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const days = Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      entry: 0,
      exit: 0,
    }));

    const result = await prisma.$transaction(async (tx) => {
      const transactions = await tx.cashAccountTransaction.findMany({
        where: {
          cashAccount: { companyId },
          createdAt: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
      });

      for (const t of transactions) {
        const date = new Date(
          new Date(t.createdAt).toLocaleString("en-US", {
            timeZone: "America/Sao_Paulo",
          }),
        );

        let dayIndex = date.getDay();
        dayIndex = dayIndex === 0 ? 7 : dayIndex;

        const index = dayIndex - 1;
        const dayItem = days[index];

        if (!dayItem) continue;

        if (t.direction === "IN") {
          dayItem.entry += Number(t.amount);
        }

        if (t.direction === "OUT") {
          dayItem.exit += Number(t.amount);
        }
      }

      const currentMaxEntry = Math.max(...days.map((d) => d.entry));
      const currentMaxExit = Math.max(...days.map((d) => d.exit));

      const maxEntryDb = await tx.cashAccountTransaction.aggregate({
        _max: { amount: true },
        where: {
          direction: "IN",
          cashAccount: { companyId },
        },
      });

      const maxExitDb = await tx.cashAccountTransaction.aggregate({
        _max: { amount: true },
        where: {
          direction: "OUT",
          cashAccount: { companyId },
        },
      });

      const maxEntry = Math.max(
        Number(maxEntryDb._max.amount ?? 0),
        currentMaxEntry,
      );

      const maxExit = Math.max(
        Number(maxExitDb._max.amount ?? 0),
        currentMaxExit,
      );

      return {
        days,
        maxEntry,
        maxExit,
      };
    });

    return result;
  };

  getRecentTransactions = async (companyId: string) => {
    const result = prisma.$transaction(async (tx) => {
      const transactions = await tx.cashAccountTransaction.findMany({
        where: { cashAccount: { companyId } },
        take: 25,
        orderBy: {
          createdAt: "desc",
        },
      });

      return transactions;
    });

    return result;
  };
}
