import { injectable } from "tsyringe";
import { AppError } from "../../../shared/errors/AppError.js";
import { prisma } from "../../../config/db/database.js";
import { getOpenCompetency } from "../../../shared/utils/getOpenCompetency.js";
import { buildCashRegisterUpdate } from "../../../shared/utils/buildCashRegisterUpdate.js";
import { Prisma } from "../../../../generated/prisma/client.js";
import { normalizeText } from "../../../shared/utils/normalizeText.js";

@injectable()
export class CustomerService {
  showAllCustomer = async (companyId: string) => {
    const result = prisma.$transaction(async (tx) => {
      const allCustomers = await tx.customer.findMany({
        where: { companyId },
        include: { account: true },
        take: 15,
      });

      return allCustomers;
    });

    return result;
  };

  showCustomer = async (companyId: string, search: string) => {
    const normalizedSearch = normalizeText(search);

    const customers = await prisma.customer.findMany({
      where: {
        companyId,
        nameNormalized: {
          startsWith: normalizedSearch,
        },
      },
      include: {
        account: true,
        customerDebts: true,
      },
    });

    return customers;
  };

  registerCustomer = async (customerData: any, companyId: string) => {
    try {
      const result = prisma.$transaction(async (tx) => {
        const normalize = normalizeText(customerData.name);

        const customer = await tx.customer.create({
          data: {
            companyId,
            name: customerData.name,
            nameNormalized: normalize,
            cpf: customerData.cpf,
            phone: customerData.phone,
            address: customerData.address,
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
      throw new AppError(400, "Error while trying to register a client.");
    }
  };

  creditSale = async (
    customerId: string,
    amount: number,
    companyId: string,
  ) => {
    try {
      const result = await prisma.$transaction(async (tx) => {
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
            description: `Pagamento recebido - NOME: ${custumer?.name} CPF: ${custumer?.cpf}`,
            referenceMonth: month,
            referenceYear: year,
            performedById: userId,
            referenceId: customerDebt.id,
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

  deleteEntry = async (entryId: string, companyId: string, userId: string) => {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const entry = await tx.cashRegisterEntry.findUnique({
          where: { id: entryId },
        });

        if (!entry) {
          throw new AppError(404, "Transaction not found");
        }

        if (entry.referenceType !== "CUSTOMER_ACCOUNT") {
          throw new AppError(400, "Invalid transaction type");
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

        if (!entry.referenceId) {
          throw new AppError(400, "Invalid referenceId");
        }

        const customerDebt = await tx.customerDebt.findUnique({
          where: { id: entry.referenceId },
        });

        if (!customerDebt) {
          throw new AppError(404, "Customer debt not found");
        }

        const customerAccount = await tx.customerAccount.findUnique({
          where: { customerId: customerDebt.customerId },
        });

        if (!customerAccount) {
          throw new AppError(404, "Customer account not found");
        }

        await tx.customerAccount.update({
          where: { id: customerAccount.id },
          data: {
            balance: { increment: entry.amount },
          },
        });

        await tx.customerAccountTransaction.deleteMany({
          where: {
            referenceId: entry.referenceId,
          },
        });

        await tx.cashRegisterEntry.delete({
          where: { id: entry.id },
        });

        await tx.customerDebt.delete({
          where: { id: customerDebt.id },
        });

        await tx.cashAccount.update({
          where: { companyId },
          data: {
            balance: { decrement: entry.amount },
          },
        });

        await tx.cashAccountTransaction.deleteMany({
          where: {
            referenceId: entry.referenceId,
            type: "INCOME",
          },
        });

        if (!entry.paymentMethod) {
          throw new AppError(400, "Invalid paymentMethod");
        }

        await tx.cashRegister.update({
          where: { id: openCash.id },
          data: buildCashRegisterUpdate(
            entry.paymentMethod,
            new Prisma.Decimal(-entry.amount),
          ),
        });

        return { message: "Customer payment reverted successfully" };
      });

      return result;
    } catch (error) {
      throw new AppError(400, "Error deleting entry");
    }
  };

  getPaymentsAmount = async (companyId: string) => {
    try {
      const { month, year } = await getOpenCompetency(companyId);

      const previousMonth = month === 1 ? 12 : month - 1;
      const previousYear = month === 1 ? year - 1 : year;

      const result = await prisma.$transaction(async (tx) => {
        const paymentsThisMoth = await tx.customerAccountTransaction.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            direction: "IN",
            referenceMonth: month,
            referenceYear: year,
            customerAccount: {
              companyId,
            },
          },
        });

        const paymentsPreviousMonth =
          await tx.customerAccountTransaction.aggregate({
            _sum: {
              amount: true,
            },
            where: {
              direction: "IN",
              referenceMonth: previousMonth,
              referenceYear: previousYear,
              customerAccount: {
                companyId,
              },
            },
          });

        return {
          currentPaymentsAmount: Number(paymentsThisMoth._sum.amount) ?? 0,
          previousPaymentsAmount:
            Number(paymentsPreviousMonth._sum.amount) ?? 0,
        };
      });

      return {
        amount: result.currentPaymentsAmount,
        reference: { month, year },
        previousAmount: result.previousPaymentsAmount,
        previousReference: { month: previousMonth, year: previousYear },
      };
    } catch (error) {
      console.log(error);
      throw new AppError(500, "Error registering sale");
    }
  };
}
