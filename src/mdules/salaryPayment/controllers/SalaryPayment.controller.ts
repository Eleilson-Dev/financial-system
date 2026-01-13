import type { Request, Response } from "express";

import { inject, injectable } from "tsyringe";
import type { SalaryPaymentService } from "../services/SalaryPayment.service.js";

@injectable()
export class SalaryPaymentController {
  constructor(
    @inject("SalaryPayment") private salaryPaymentService: SalaryPaymentService
  ) {}
  paySalary = async (req: Request, res: Response) => {
    const localKeys = {
      employeeId: res.locals.employeeId,
      userId: res.locals.userId,
      companyId: res.locals.companyId,
      salary: res.locals.salary,
    };

    const response = await this.salaryPaymentService.paySalary(localKeys);

    return res
      .status(200)
      .json([{ message: "successful salary payment" }, response]);
  };
}
