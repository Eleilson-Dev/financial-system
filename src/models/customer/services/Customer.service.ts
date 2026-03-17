import { injectable } from "tsyringe";
import { AppError } from "../../../shared/errors/AppError.js";
import { prisma } from "../../../config/db/database.js";
import { getOpenCompetency } from "../../../shared/utils/getOpenCompetency.js";
import { buildCashRegisterUpdate } from "../../../shared/utils/buildCashRegisterUpdate.js";
import { Prisma } from "../../../../generated/prisma/client.js";
import { normalizeText } from "../../../shared/utils/normalizeText.js";
import { io } from "../../../server.js";

@injectable()
export class CustomerService {
  showAllCustomer = async (companyId: string) => {
    const allCustomers = await prisma.customer.findMany({
      where: { companyId },
      include: { account: true },
      take: 15,
    });

    return allCustomers;
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
      const result = await prisma.$transaction(async (tx) => {
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
      const { month, year } = await getOpenCompetency(companyId);

      const result = await prisma.$transaction(async (tx) => {
        const account = await tx.customerAccount.update({
          where: { customerId },
          data: {
            balance: {
              increment: amount,
            },
          },
        });

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

        return { account, customerDebt, transaction };
      });

      io.to(companyId).emit("financial:updated");

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
      const { month, year } = await getOpenCompetency(companyId);

      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { name: true },
      });

      const result = await prisma.$transaction(
        async (tx) => {
          const customerAccountUpdated = await tx.customerAccount.update({
            where: { customerId },
            data: { balance: { decrement: amountPaid } },
          });

          const customerDebt = await tx.customerDebt.create({
            data: {
              customerId,
              referenceMonth: month,
              referenceYear: year,
              amount: amountPaid,
              description: `Pagamento recebido`,
            },
          });

          const cashAccount = await tx.cashAccount.findUnique({
            where: { companyId },
            select: { id: true },
          });

          if (!cashAccount) {
            throw new AppError(
              500,
              "Structural error: company without a financial account.",
            );
          }

          const [
            cashRegisterEntry,
            customerAccountTransaction,
            updatedCashAccount,
            updatedCashRegister,
          ] = await Promise.all([
            tx.cashRegisterEntry.create({
              data: {
                amount: amountPaid,
                direction: "IN",
                paymentMethod,
                description: `Pagamento recebido - ${customer?.name}`,
                cashRegisterId,
                referenceMonth: month,
                referenceYear: year,
                referenceType: "CUSTOMER_ACCOUNT",
                referenceId: customerDebt.id,
              },
            }),
            tx.customerAccountTransaction.create({
              data: {
                customerAccountId: customerAccountUpdated.id,
                amount: amountPaid,
                direction: "IN",
                description: `Pagamento recebido - ${customer?.name}`,
                referenceId: customerDebt.id,
                referenceType: "PAYMENT",
                referenceMonth: month,
                referenceYear: year,
              },
            }),
            tx.cashAccount.update({
              where: { companyId },
              data: {
                balance: { increment: amountPaid },
              },
            }),
            tx.cashRegister.update({
              where: { id: cashRegisterId },
              data: buildCashRegisterUpdate(
                paymentMethod,
                new Prisma.Decimal(amountPaid),
              ),
            }),
          ]);

          const cashAccountTransaction = await tx.cashAccountTransaction.create(
            {
              data: {
                cashAccountId: cashAccount.id,
                amount: amountPaid,
                direction: "IN",
                type: "INCOME",
                description: `Pagamento recebido - ${customer?.name}`,
                referenceMonth: month,
                referenceYear: year,
                performedById: userId,
                referenceId: customerDebt.id,
              },
            },
          );

          return [
            { customerAccountUpdated },
            { customerDebt },
            { customerAccountTransaction },
            { cashAccountTransaction },
          ];
        },
        { timeout: 15000 },
      );

      io.to(companyId).emit("financial:updated");

      return result;
    } catch (error) {
      console.error("PAY DEBT ERROR:", error);

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

      io.to(companyId).emit("financial:updated");

      return result;
    } catch (error) {
      throw new AppError(400, "Error deleting entry");
    }
  };
}
