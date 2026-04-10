import { injectable } from "tsyringe";
import { prisma } from "../../../config/db/database.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { getOpenCompetency } from "../../../shared/utils/getOpenCompetency.js";
import { buildCashRegisterUpdate } from "../../../shared/utils/buildCashRegisterUpdate.js";
import { Prisma } from "../../../../generated/prisma/client.js";
import { io } from "../../../server.js";
import { parseBarcode } from "../../../shared/utils/parseBarcode.js";

interface TCreateSaleSchema {
  paymentMethod: "CASH" | "DEBIT" | "CREDIT" | "PIX" | "ACCOUNT";
  items: {
    barcode: string;
    quantity: number;
    unitPrice: number;
  }[];
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
        const itemsData: any[] = [];

        for (const item of saleData.items) {
          const parsed = parseBarcode(item.barcode);

          const product = await tx.product.findFirst({
            where: { barcode: parsed.productCode, companyId },
            include: { category: true },
          });

          if (!product) throw new AppError(400, "Product not found");

          let quantity: Prisma.Decimal;
          let unitPrice: Prisma.Decimal;

          if (product.stockType === "KG") {
            if (parsed.type !== "weighted") {
              throw new AppError(400, "Invalid barcode for weighted product");
            }

            quantity = new Prisma.Decimal(parsed.weight);
            unitPrice = product.price;
          } else {
            const requestedQuantity = item.quantity ? Number(item.quantity) : 1;
            quantity = new Prisma.Decimal(requestedQuantity);
            unitPrice = product.price;

            if (
              product.barcode === "00000" &&
              product.price.equals(new Prisma.Decimal(0))
            ) {
              if (!item.unitPrice) {
                throw new AppError(
                  400,
                  "Unit price is required for Avulso product",
                );
              }
              unitPrice = new Prisma.Decimal(item.unitPrice);
            } else {
              unitPrice = product.price;
            }
          }

          if (product.stock !== null) {
            if (product.stock.lessThan(quantity)) {
              throw new AppError(
                400,
                `Insufficient stock for product ${product.name}`,
              );
            }
          }

          itemsData.push({
            product,
            quantity,
            unitPrice,
          });
        }

        const totalAmount = itemsData.reduce((acc, item) => {
          return acc.plus(item.quantity.times(item.unitPrice));
        }, new Prisma.Decimal(0));

        const sale = await tx.sale.create({
          data: {
            amount: totalAmount,
            paymentMethod: saleData.paymentMethod,
            referenceMonth: month,
            referenceYear: year,
            companyId,
            createdById: userId,
            items: {
              create: itemsData.map(({ product, quantity, unitPrice }) => ({
                productId: product.id,
                nameSnapshot: product.name,
                categoryId: product.categoryId,
                categoryNameSnapshot: product.category?.name || "Avulso",
                quantity,
                unitPrice,
                total: quantity.times(unitPrice),
              })),
            },
          },
          include: { items: true },
        });

        for (const item of itemsData) {
          const { product, quantity } = item;

          await tx.product.update({
            where: { id: product.id },
            data: {
              stock: { decrement: quantity },
            },
          });

          await tx.stockMovement.create({
            data: {
              productId: product.id,
              type: "SALE",
              quantity: quantity,
              unitType: product.stockType,
            },
          });
        }

        await tx.cashRegisterEntry.create({
          data: {
            amount: totalAmount,
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
            balance: { increment: totalAmount },
          },
        });

        await tx.cashAccountTransaction.create({
          data: {
            cashAccountId: cashAccount.id,
            amount: totalAmount,
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
          data: buildCashRegisterUpdate(saleData.paymentMethod, totalAmount),
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
