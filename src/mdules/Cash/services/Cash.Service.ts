import { injectable } from "tsyringe";
import { prisma } from "../../../config/database.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class CashService {
  openCash = async (openingAmount: number, encodedToken: any) => {
    try {
      const cash = await prisma.cashRegister.create({
        data: {
          openingAmount: openingAmount,
          companyId: encodedToken.companyId,
          openedById: encodedToken.userId,
        },
      });

      return cash;
    } catch (error) {
      console.log(error);
      throw new AppError(400, "Erro ao abrir um novo caixa");
    }
  };

  showOpenCash = async (companyId: string) => {
    const response = await prisma.cashRegister.findMany({
      where: { status: "OPEN", companyId },
      include: { sales: true },
    });

    return response;
  };

  showCloseCash = async (companyId: string) => {
    const response = await prisma.cashRegister.findMany({
      where: { status: "CLOSED", companyId },
      include: { sales: true },
    });

    return response;
  };

  closeCash = async (cashData: any) => {
    try {
      const { userId, cashOpen } = cashData;

      const totalSalesAggregate = await prisma.sale.aggregate({
        where: { cashRegisterId: cashOpen },
        _sum: { amount: true },
      });

      const totalSales = Number(totalSalesAggregate._sum.amount ?? 0);

      const closedCash = await prisma.cashRegister.update({
        where: { id: cashOpen },
        data: {
          closingAmount: totalSales,
          closedAt: new Date(),
          closedById: userId,
          status: "CLOSED",
        },
      });

      return closedCash;
    } catch (error) {
      console.log(error);
      throw new AppError(400, "erro ao tentar fechar o caixa");
    }
  };
}
