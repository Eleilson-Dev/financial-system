import { injectable } from "tsyringe";
import { prisma } from "../../../config/database.js";
import { referenceMonth } from "../../../shared/utils/referenceMonth.js";
import { AppError } from "../../../shared/errors/AppError.js";

interface PaySalaryDTO {
  employeeId: string;
  companyId: string;
  userId: string;
  salary: number;
}

@injectable()
export class SalaryPaymentService {
  paySalary = async ({
    employeeId,
    companyId,
    userId,
    salary,
  }: PaySalaryDTO) => {
    try {
      const reference = referenceMonth();

      const result = await prisma.$transaction(async (tx) => {
        const payment = await tx.salaryPayment.create({
          data: {
            employeeId,
            companyId,
            amount: salary,
            referenceMonth: reference,
            paidByUserId: userId,
          },
        });

        await tx.cashAccount.update({
          where: { companyId },
          data: {
            balance: {
              decrement: salary,
            },
          },
        });

        const cashAccount = await tx.cashAccount.findFirstOrThrow({
          where: { companyId: companyId },
        });

        await tx.cashAccountTransaction.create({
          data: {
            cashAccountId: cashAccount.id,
            amount: salary,
            type: "SALARY_PAYMENT",
            description: "Pagamento de Salário",
            performedById: userId,
            direction: "OUT",
            referenceId: payment.id,
          },
        });

        return payment;
      });

      return result;
    } catch (error) {
      console.log(error);
      return "Error while trying to process salary payment.";
    }
  };
}
