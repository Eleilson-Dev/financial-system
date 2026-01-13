import { injectable } from "tsyringe";
import { prisma } from "../../../config/database.js";
import type { TCreateSaleSchema } from "../schema/schema.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class SaleService {
  registerSale = async (saleData: TCreateSaleSchema, resLocals: any) => {
    try {
      const { companyId, userId, cashRegisterId } = resLocals;

      const result = await prisma.$transaction(async (tx) => {
        const sale = await tx.sale.create({
          data: {
            amount: saleData.amount,
            paymentMethod: saleData.paymentMethod,
            cashRegisterId,
            companyId,
            createdById: userId,
          },
        });

        const cashAccount = await tx.cashAccount.findUnique({
          where: { companyId },
        });

        if (!cashAccount) {
          throw new AppError(
            500,
            "Erro estrutural: empresa sem conta financeira"
          );
        }

        await tx.cashAccount.update({
          where: { companyId },
          data: {
            balance: { increment: saleData.amount },
          },
        });

        await tx.cashAccountTransaction.create({
          data: {
            cashAccountId: cashAccount.id,
            amount: saleData.amount,
            type: "INCOME",
            description: "Venda registrada",
            performedById: userId,
            direction: "IN",
            referenceId: sale.id,
          },
        });

        await tx.cashRegister.update({
          where: { id: cashRegisterId },
          data: {
            totalSales: {
              increment: saleData.amount,
            },
          },
        });

        return sale;
      });

      return result;
    } catch (error) {
      console.log(error);
      throw new AppError(500, "Erro ao registrar venda");
    }
  };
}
