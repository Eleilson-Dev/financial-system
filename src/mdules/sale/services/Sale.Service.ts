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

        await tx.cashAccount.upsert({
          where: { companyId },
          create: {
            companyId,
            balance: saleData.amount,
          },
          update: {
            balance: {
              increment: saleData.amount,
            },
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
