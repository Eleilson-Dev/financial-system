import { injectable } from "tsyringe";
import { AppError } from "../../../shared/errors/AppError.js";
import { prisma } from "../../../config/database.js";
import { getOpenCompetency } from "../../../shared/utils/getOpenCompetency.js";

@injectable()
export class CustomerService {
  showAllCustomer = async (companyId: string) => {
    const result = prisma.$transaction(async (tx) => {
      const allCustomers = await tx.customer.findMany({
        where: { companyId },
        include: { account: true },
      });

      return allCustomers;
    });

    return result;
  };

  registerCustomer = async (custumerData: any, companyId: string) => {
    try {
      const result = prisma.$transaction(async (tx) => {
        const custumer = await tx.customer.create({
          data: {
            companyId,
            name: custumerData.name,
            cpf: custumerData.cpf,
            phone: custumerData.phone,
          },
          include: { account: true },
        });

        const custumerAccount = await tx.customerAccount.create({
          data: { customerId: custumer.id, balance: 0, companyId },
        });

        return [custumer, custumerAccount];
      });

      return result;
    } catch (error) {
      console.log(error);
      throw new AppError(400, "Erro ao tentar registrar um cliente");
    }
  };

  creditSale = async (customerId: string, amount: number) => {
    try {
      const result = prisma.$transaction(async (tx) => {
        const account = await tx.customerAccount.findUnique({
          where: { customerId },
        });

        if (!account) {
          throw new AppError(404, "Conta do cliente não encontrada");
        }

        const updatedAccount = await tx.customerAccount.update({
          where: { id: account.id },
          data: {
            balance: {
              increment: amount,
            },
          },
        });

        const transaction = await tx.customerAccountTransaction.create({
          data: {
            customerAccountId: account.id,
            amount,
            direction: "OUT",
            description: "Venda a prazo",
          },
        });

        return { updatedAccount, transaction };
      });

      return result;
    } catch (error) {
      console.log(error);
      throw new AppError(400, "Erro ao tentar registrar venda a prazo");
    }
  };

  payDebt = async (
    customerId: string,
    amountPaid: number,
    companyId: string,
    userId: string
  ) => {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const custumer = await tx.customer.findUnique({
          where: { id: customerId },
        });

        const customerAccount = await tx.customerAccount.findUnique({
          where: { customerId },
        });

        if (!customerAccount) {
          throw new AppError(404, "Conta do cliente não encontrada");
        }

        const customerAccountUpdated = await tx.customerAccount.update({
          where: { id: customerAccount.id },
          data: { balance: { decrement: amountPaid } },
        });

        const customerAccountTransaction =
          await tx.customerAccountTransaction.create({
            data: {
              customerAccountId: customerAccount.id,
              amount: amountPaid,
              direction: "IN",
              description: `Pagamento recebido - NOME: ${custumer?.name} CPF: ${custumer?.cpf}`,
              referenceId: customerAccount.id,
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

        const { month, year } = await getOpenCompetency(companyId);

        const cashAccountTransaction = await tx.cashAccountTransaction.create({
          data: {
            cashAccountId: cashAccount.id,
            amount: amountPaid,
            direction: "IN",
            type: "INCOME",
            description: `Pagamento de recebido - NOME: ${custumer?.name} CPF: ${custumer?.cpf}`,
            referenceMonth: month,
            referenceYear: year,
            performedById: userId,
            referenceId: customerAccountTransaction.id,
          },
        });

        return [
          customerAccountUpdated,
          customerAccountTransaction,
          cashAccountTransaction,
        ];
      });

      return result;
    } catch (error) {
      throw new AppError(
        400,
        "Erro ao tentar realizar o pagamento de valor pendente"
      );
    }
  };
}
