import { injectable } from "tsyringe";
import { AppError } from "../../../shared/errors/AppError.js";
import { prisma } from "../../../config/database.js";
import type { TCreateExpenseSchema } from "../schema/schema.js";
import { getOpenCompetency } from "../../../shared/utils/getOpenCompetency.js";

@injectable()
export class ExpenseService {
  registerExpense = async (
    expenseData: TCreateExpenseSchema,
    userId: string,
    companyId: string,
  ) => {
    try {
      const { month, year } = await getOpenCompetency(companyId);
      const result = await prisma.$transaction(async (tx) => {
        const expense = await tx.expense.create({
          data: {
            createdById: userId,
            companyId: companyId,
            amount: expenseData.amount,
            description: expenseData.description,
            category: expenseData.category,
            referenceMonth: month,
            referenceYear: year,
          },
        });

        const cashAccount = await tx.cashAccount.findUnique({
          where: { companyId },
        });

        if (!cashAccount) {
          throw new AppError(
            500,
            "Structural error: company without a financial account.",
          );
        }

        await tx.cashAccount.update({
          where: { companyId },
          data: {
            balance: { decrement: expenseData.amount },
          },
        });

        const cashAccountTransaction = await tx.cashAccountTransaction.create({
          data: {
            cashAccountId: cashAccount.id,
            amount: expenseData.amount,
            type: "EXPENSE",
            description: "Despesa registrada",
            performedById: userId,
            direction: "OUT",
            referenceId: expense.id,
            referenceMonth: month,
            referenceYear: year,
          },
        });

        return [expense, cashAccountTransaction];
      });

      return result;
    } catch (error) {
      console.log(error);
      throw new AppError(400, "Erro ao tentar criar uma despesa");
    }
  };
}
