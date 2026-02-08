import { injectable } from "tsyringe";
import { prisma } from "../../../config/database.js";
import type { TCreateSaleSchema } from "../schema/schema.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { getOpenCompetency } from "../../../shared/utils/getOpenCompetency.js";
import { buildCashRegisterUpdate } from "../../../shared/utils/buildCashRegisterUpdate.js";
import { Prisma } from "../../../../generated/prisma/client.js";

@injectable()
export class SaleService {
  registerSale = async (saleData: TCreateSaleSchema, resLocals: any) => {
    try {
      const { companyId, userId, cashRegisterId } = resLocals;
      const { month, year } = await getOpenCompetency(companyId);

      const result = await prisma.$transaction(async (tx) => {
        const sale = await tx.sale.create({
          data: {
            amount: saleData.amount,
            paymentMethod: saleData.paymentMethod,
            referenceMonth: month,
            referenceYear: year,
            companyId,
            createdById: userId,
          },
        });

        await tx.cashRegisterEntry.create({
          data: {
            amount: saleData.amount,
            direction: "IN",
            paymentMethod: saleData.paymentMethod,
            description: "Venda registrada",
            cashRegisterId,
            referenceMonth: month,
            referenceYear: year,
            referenceType: "SALE",
            referenceId: sale.id,
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
            balance: { increment: saleData.amount },
          },
        });

        await tx.cashAccountTransaction.create({
          data: {
            cashAccountId: cashAccount.id,
            amount: saleData.amount,
            type: "SALE",
            description: "Venda registrada",
            performedById: userId,
            direction: "IN",
            referenceId: sale.id,
            referenceMonth: month,
            referenceYear: year,
          },
        });

        const data = buildCashRegisterUpdate(
          saleData.paymentMethod,
          new Prisma.Decimal(saleData.amount),
        );

        await tx.cashRegister.update({
          where: { id: cashRegisterId },
          data: buildCashRegisterUpdate(
            saleData.paymentMethod,
            new Prisma.Decimal(saleData.amount),
          ),
        });

        return sale;
      });

      return result;
    } catch (error) {
      console.log(error);
      throw new AppError(500, "Error registering sale");
    }
  };
}
