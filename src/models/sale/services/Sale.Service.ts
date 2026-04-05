import { injectable } from "tsyringe";
import { prisma } from "../../../config/db/database.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { getOpenCompetency } from "../../../shared/utils/getOpenCompetency.js";
import { buildCashRegisterUpdate } from "../../../shared/utils/buildCashRegisterUpdate.js";
import { Prisma } from "../../../../generated/prisma/client.js";
import { io } from "../../../server.js";

interface TSaleItemInput {
  productId?: string; // produto cadastrado ou undefined se avulso
  name?: string; // usado para avulso
  categoryId?: string; // usado para snapshot
  categoryName?: string; // usado para avulso
  quantity: number;
  unitPrice: number;
}

interface TCreateSaleSchema {
  amount: number;
  paymentMethod: "CASH" | "DEBIT" | "CREDIT" | "PIX" | "ACCOUNT";
  items: TSaleItemInput[];
}

@injectable()
export class SaleService {
  getAllSales = async (companyId: string) => {
    try {
      const { month, year } = await getOpenCompetency(companyId);

      const result = await prisma.$transaction(async (tx) => {
        const allSales = await tx.sale.findMany({
          where: { companyId, referenceMonth: month, referenceYear: year },
        });

        return allSales;
      });

      return result;
    } catch (error) {
      console.log(error);
      throw new AppError(500, "Error retrieving all sales.");
    }
  };

  registerSale = async (saleData: TCreateSaleSchema, resLocals: any) => {
    try {
      const { companyId, userId, cashRegisterId } = resLocals;
      const { month, year } = await getOpenCompetency(companyId);

      const result = await prisma.$transaction(async (tx) => {
        const productsMap = new Map();

        for (const item of saleData.items) {
          if (item.productId) {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
              include: { category: true },
            });

            if (!product) throw new AppError(400, "Product not found");

            const quantityDecimal = new Prisma.Decimal(item.quantity);

            if (product.stock !== null) {
              if (product.stock.lessThan(quantityDecimal)) {
                throw new AppError(
                  400,
                  `Insufficient stock for product ${product.name}`,
                );
              }
            }

            productsMap.set(item.productId, product);
          }
        }

        const sale = await tx.sale.create({
          data: {
            amount: new Prisma.Decimal(saleData.amount),
            paymentMethod: saleData.paymentMethod,
            referenceMonth: month,
            referenceYear: year,
            companyId,
            createdById: userId,
            items: {
              create: saleData.items.map((item) => {
                const product = productsMap.get(item.productId);

                const quantityDecimal = new Prisma.Decimal(item.quantity);
                const unitPriceDecimal = new Prisma.Decimal(item.unitPrice);

                return {
                  productId: item.productId || null,
                  nameSnapshot: item.name || product?.name || "Venda Avulsa",
                  categoryId: item.categoryId || product?.categoryId || null,
                  categoryNameSnapshot:
                    item.categoryName || product?.category?.name || "Avulso",
                  quantity: quantityDecimal,
                  unitPrice: unitPriceDecimal,
                  total: quantityDecimal.times(unitPriceDecimal),
                };
              }),
            },
          },
          include: { items: true },
        });

        for (const item of saleData.items) {
          const product = productsMap.get(item.productId);

          if (!product) continue;

          const quantityDecimal = new Prisma.Decimal(item.quantity);

          await tx.product.update({
            where: { id: product.id },
            data: {
              stock: { decrement: quantityDecimal },
            },
          });

          await tx.stockMovement.create({
            data: {
              productId: product.id,
              type: "SALE",
              quantity: quantityDecimal,
              unitType: product.stockType,
            },
          });
        }

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

        const cashAccount = await tx.cashAccount.update({
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

      io.to(companyId).emit("financial:updated");

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
}
