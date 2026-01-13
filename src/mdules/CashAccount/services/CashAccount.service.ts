import { injectable } from "tsyringe";
import { prisma } from "../../../config/database.js";

@injectable()
export class CashAccountService {
  showBalance = async () => {
    const result = await prisma.$transaction(async (tx) => {
      const balance = await tx.cashAccount.findMany();

      return balance;
    });

    return result;
  };

  ShowAccountHistory = async () => {
    const result = await prisma.$transaction(async (tx) => {
      const AccountHistory = await tx.cashAccountTransaction.findMany({
        orderBy: { createdAt: "desc" },
      });

      return AccountHistory;
    });

    return result;
  };
}
