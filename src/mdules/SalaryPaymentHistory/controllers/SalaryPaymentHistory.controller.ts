import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { SalaryPaymentHistoryService } from "../services/SalaryPaymentHistory.service.js";

@injectable()
export class SalaryPaymentHistoryController {
  constructor(
    @inject("SalaryPaymentHistoryService")
    private salaryPaymentHistoryService: SalaryPaymentHistoryService
  ) {}

  salaryIncreese = async (req: Request, res: Response) => {
    const { employeeId } = req.query;
    const { userId } = res.locals.encodedToken;

    const response = await this.salaryPaymentHistoryService.salaryIncrease(
      employeeId as string,
      req.body.salary,
      userId
    );

    return res
      .status(200)
      .json([{ message: "Aumento de salario efetudo com sucesso" }, response]);
  };
}
