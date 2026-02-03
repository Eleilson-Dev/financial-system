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
      include: { entries: true },
    });

    return response;
  };

  closeCash = async (cashData: any) => {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const { userId, cashOpen } = cashData;

        const cashRegister = await tx.cashRegister.findUnique({
          where: { id: cashOpen },
          select: {
            openingAmount: true,
            totalCash: true,
            status: true,
          },
        });

        if (!cashRegister) {
          throw new AppError(404, "Caixa não encontrado");
        }

        if (cashRegister.status !== "OPEN") {
          throw new AppError(400, "Caixa já está fechado");
        }

        const closingAmount = cashRegister.openingAmount.plus(
          cashRegister.totalCash,
        );

        const closeCash = await tx.cashRegister.update({
          where: { id: cashOpen },
          data: {
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
