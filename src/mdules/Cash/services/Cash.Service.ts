import { injectable } from "tsyringe";
import { prisma } from "../../../config/database.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class CashService {
  openCash = async (amount: number, encodedToken: any) => {
    try {
      const cash = await prisma.cashRegister.create({
        data: {
          openingAmount: amount,
          expectedCashAmount: amount,
          companyId: encodedToken.companyId,
          openedById: encodedToken.userId,
        },
        include: { entries: true },
      });

      return cash;
    } catch (error) {
      console.log(error);
      throw new AppError(400, "Erro ao abrir um novo caixa");
    }
  };

  showOpenCashById = async (companyId: string, userId: string) => {
    const response = await prisma.cashRegister.findMany({
      where: { status: "OPEN", companyId, openedById: userId },
      include: {
        entries: {
          take: 40,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return response;
  };

  showCloseCash = async (companyId: string) => {
    const response = await prisma.cashRegister.findMany({
      where: { status: "CLOSED", companyId },
      orderBy: { closedAt: "desc" },
    });

    return response;
  };

  closeCash = async (cashData: any, countedCashAmount: any) => {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const { userId, cashOpen } = cashData;

        const cashRegister = await tx.cashRegister.findUnique({
          where: { id: cashOpen },
          select: {
            openingAmount: true,
            expectedCashAmount: true,
            totalCash: true,
            status: true,
          },
        });

        if (!cashRegister) {
          throw new AppError(404, "Cash not found");
        }

        if (cashRegister.status !== "OPEN") {
          throw new AppError(400, "Cash already closed");
        }

        const closingAmount = cashRegister.openingAmount.plus(
          cashRegister.totalCash,
        );

        const difference =
          countedCashAmount - Number(cashRegister.expectedCashAmount);

        const closeCash = await tx.cashRegister.update({
          where: { id: cashOpen },
          data: {
            cashDifference: difference,
            countedCashAmount: countedCashAmount,
            closingAmount,
            closedAt: new Date(),
            closedById: userId,
            status: "CLOSED",
          },
        });

        return closeCash;
      });

      return result;
    } catch (error) {
      console.log(error);
      throw new AppError(400, "erro ao tentar fechar o caixa");
    }
  };
}
