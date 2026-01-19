import { injectable } from "tsyringe";
import { AppError } from "../../../shared/errors/AppError.js";
import { prisma } from "../../../config/database.js";
import { getOpenCompetency } from "../../../shared/utils/getOpenCompetency.js";
import { buildCashRegisterUpdate } from "../../../shared/utils/buildCashRegisterUpdate.js";
import { Prisma } from "../../../../generated/prisma/client.js";

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

  showCustomer = async (companyId: string, customerId: string) => {
    const result = prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: customerId, companyId },
        include: { account: true, customerDebts: true },
      });

      return customer;
    });

    return result;
  };

  registerCustomer = async (customerData: any, companyId: string) => {
    try {
      const result = prisma.$transaction(async (tx) => {
        const customer = await tx.customer.create({
          data: {
            companyId,
            name: customerData.name,
            cpf: customerData.cpf,
            phone: customerData.phone,
          },
          include: { account: true },
        });

        const customerAccount = await tx.customerAccount.create({
          data: { customerId: customer.id, balance: 0, companyId },
        });

        return [customer, customerAccount];
      });

      return result;
    } catch (error) {
      console.log(error);
      throw new AppError(400, "Erro ao tentar registrar um cliente");
    }
  };

  creditSale = async (
    customerId: string,
    amount: number,
    companyId: string,
  ) => {
    try {
      const result = prisma.$transaction(async (tx) => {
        const account = await tx.customerAccount.findUnique({
          where: { customerId },
        });

        if (!account) {
          throw new AppError(404, "Customer account not found.");
        }

        const updatedAccount = await tx.customerAccount.update({
          where: { id: account.id },
          data: {
            balance: {
              increment: amount,
            },
          },
        });

        const { month, year } = await getOpenCompetency(companyId);

        const customerDebt = await tx.customerDebt.create({
          data: {
            customerId,
            referenceMonth: month,
            referenceYear: year,
            amount: amount,
            description: "Venda a prazo",
          },
        });

        const transaction = await tx.customerAccountTransaction.create({
          data: {
            customerAccountId: account.id,
            amount,
            direction: "OUT",
            description: "Venda a prazo",
            referenceMonth: month,
            referenceYear: year,
            referenceType: "DEBT",
            referenceId: customerDebt.id,
          },
        });

        return { updatedAccount, customerDebt, transaction };
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
    userId: string,
    cashRegisterId: string,
    paymentMethod: any,
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
          throw new AppError(404, "Customer account not found.");
        }

        const customerAccountUpdated = await tx.customerAccount.update({
          where: { id: customerAccount.id },
          data: { balance: { decrement: amountPaid } },
        });

        const { month, year } = await getOpenCompetency(companyId);

        const customerDebt = await tx.customerDebt.create({
          data: {
            customerId,
            referenceMonth: month,
            referenceYear: year,
            amount: amountPaid,
            description: `Pagamento recebido`,
          },
        });

        await tx.cashRegisterEntry.create({
          data: {
            amount: amountPaid,
            direction: "IN",
            paymentMethod: paymentMethod,
            description: `Pagamento recebido - NOME: ${custumer?.name} CPF: ${custumer?.cpf}`,
            cashRegisterId,
            referenceMonth: month,
            referenceYear: year,
            referenceType: "CUSTOMER_ACCOUNT",
            referenceId: customerDebt.id,
          },
        });

        const customerAccountTransaction =
          await tx.customerAccountTransaction.create({
            data: {
              customerAccountId: customerAccount.id,
              amount: amountPaid,
              direction: "IN",
              description: `Pagamento recebido - NOME: ${custumer?.name} CPF: ${custumer?.cpf}`,
              referenceId: customerDebt.id,
              referenceType: "PAYMENT",
              referenceMonth: month,
              referenceYear: year,
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
            balance: { increment: amountPaid },
          },
        });

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

        await tx.cashRegister.update({
          where: { id: cashRegisterId },
          data: buildCashRegisterUpdate(
            paymentMethod,
            new Prisma.Decimal(amountPaid),
          ),
        });

        return [
          { customerAccountUpdated },
          { customerDebt },
          { customerAccountTransaction },
          { cashAccountTransaction },
        ];
      });

      return result;
    } catch (error) {
      throw new AppError(
        400,
        "Error while trying to make a payment for an outstanding amount.",
      );
    }
  };
}
