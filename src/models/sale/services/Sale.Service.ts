import { injectable } from "tsyringe";
import { prisma } from "../../../config/db/database.js";
import type { TCreateSaleSchema } from "../schema/schema.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { getOpenCompetency } from "../../../shared/utils/getOpenCompetency.js";
import { buildCashRegisterUpdate } from "../../../shared/utils/buildCashRegisterUpdate.js";
import { Prisma } from "../../../../generated/prisma/client.js";
import bcrypt from "bcrypt";

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

  deleteSale = async (saleId: string, companyId: string, userId: string) => {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const sale = await tx.sale.findFirst({
          where: {
            id: saleId,
            companyId,
          },
        });

        if (!sale || sale.companyId !== companyId) {
          throw new AppError(404, "Sale not found");
        }

        const openCash = await tx.cashRegister.findFirst({
          where: {
            companyId,
            openedById: userId,
            status: "OPEN",
          },
        });

        if (!openCash) {
          throw new AppError(400, "No open cash register found");
        }

        await tx.cashRegisterEntry.deleteMany({
          where: {
            referenceType: "SALE",
            referenceId: saleId,
          },
        });

        await tx.cashAccountTransaction.deleteMany({
          where: {
            referenceId: saleId,
            type: "SALE",
          },
        });

        await tx.cashAccount.update({
          where: { companyId },
          data: {
            balance: { decrement: sale.amount },
          },
        });

        await tx.cashRegister.update({
          where: { id: openCash.id },
          data: buildCashRegisterUpdate(
            sale.paymentMethod,
            new Prisma.Decimal(-sale.amount),
          ),
        });

        await tx.sale.delete({
          where: { id: saleId },
        });

        return { message: "Sale deleted successfully" };
      });

      return result;
    } catch (error) {
      console.log(error);
      throw new AppError(500, "Error deleting sale");
    }
  };

  getSalesAmount = async (companyId: string) => {
    try {
      const { month, year } = await getOpenCompetency(companyId);

      const previousMonth = month === 1 ? 12 : month - 1;
      const previousYear = month === 1 ? year - 1 : year;

      const result = await prisma.$transaction(async (tx) => {
        const salesThisMonth = await tx.sale.aggregate({
          _sum: {
            amount: true,
          },
          where: { companyId, referenceMonth: month, referenceYear: year },
        });

        const salesPreviousMonth = await tx.sale.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            companyId,
            referenceMonth: previousMonth,
            referenceYear: previousYear,
          },
        });

        return {
          currentAmount: Number(salesThisMonth._sum.amount) ?? 0,
          previousAmount: Number(salesPreviousMonth._sum.amount) ?? 0,
        };
      });

      return {
        amount: result.currentAmount,
        reference: { month, year },
        previousAmount: result.previousAmount,
        previousReference: { month: previousMonth, year: previousYear },
      };
    } catch (error) {
      console.log(error);
      throw new AppError(500, "Error registering sale");
    }
  };
}
