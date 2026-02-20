import { injectable } from "tsyringe";
import { prisma } from "../../../config/db/database.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { getOpenCompetency } from "../../../shared/utils/getOpenCompetency.js";
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
      const { month, year } = await getOpenCompetency(companyId);

      const result = await prisma.$transaction(async (tx) => {
        const payment = await tx.salaryPayment.create({
          data: {
            employeeId,
            companyId,
            amount: salary,
            referenceMonth: month,
            referenceYear: year,
            paidByUserId: userId,
          },
        });

        const cashAccount = await tx.cashAccount.update({
          where: { companyId },
          data: {
            balance: {
              decrement: salary,
            },
          },
        });

        const cashAccountTransaction = await tx.cashAccountTransaction.create({
          data: {
            cashAccountId: cashAccount.id,
            amount: salary,
            type: "SALARY_PAYMENT",
            description: "Pagamento de Salário",
            performedById: userId,
            direction: "OUT",
            referenceId: payment.id,
            referenceMonth: month,
            referenceYear: year,
          },
        });

        return [payment, cashAccountTransaction];
      });

      return result;
    } catch (error) {
      console.log(error);
      throw new AppError(400, "Error while trying to process salary payment.");
    }
  };
}
