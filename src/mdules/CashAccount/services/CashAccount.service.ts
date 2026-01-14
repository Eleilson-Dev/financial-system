import { injectable } from "tsyringe";
import { prisma } from "../../../config/database.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { getOpenCompetency } from "../../../shared/utils/getOpenCompetency.js";

@injectable()
export class CashAccountService {
  showBalance = async () => {
    const result = await prisma.$transaction(async (tx) => {
      const balance = await tx.cashAccount.findMany();

      return balance;
    });

    return result;
  };

  cashAdjustment = async (
    adjustmentData: any,
    companyId: string,
    userId: string
  ) => {
    try {
      const { month, year } = await getOpenCompetency(companyId);

      const result = await prisma.$transaction(async (tx) => {
        const cashAccount = await tx.cashAccount.findUnique({
          where: { companyId },
        });

        if (!cashAccount) {
          throw new AppError(
            500,
            "Erro estrutural: empresa sem conta financeira"
          );
        }

        const balance = await tx.cashAccount.update({
          where: { id: cashAccount?.id },
          data: { balance: { increment: adjustmentData.amount } },
        });

        await tx.cashAccountTransaction.create({
          data: {
            cashAccountId: cashAccount.id,
            amount: adjustmentData.amount,
            type: "ADJUSTMENT",
            description: "Ajuste de caixa",
            performedById: userId,
            direction: "IN",
            referenceMonth: month,
            referenceYear: year,
          },
        });

        return balance;
      });

      return result;
    } catch (error) {
      console.log(error);
      throw new AppError(
        400,
        "Erro ao tentar fazer ajuste financeiro ao caixa"
      );
    }
  };

  showAccountHistory = async () => {
    const result = await prisma.$transaction(async (tx) => {
      const AccountHistory = await tx.cashAccountTransaction.findMany({
        orderBy: { createdAt: "desc" },
      });

      return AccountHistory;
    });

    return result;
  };
}
