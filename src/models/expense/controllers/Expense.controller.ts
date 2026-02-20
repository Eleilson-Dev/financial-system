import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { ExpenseService } from "../services/Expense.service.js";

@injectable()
export class ExpenseController {
  constructor(
    @inject("ExpenseService") private expenseService: ExpenseService
  ) {}

  registerExpense = async (req: Request, res: Response) => {
    const { userId, companyId } = res.locals.encodedToken;

    const response = await this.expenseService.registerExpense(
      req.body,
      userId,
      companyId
    );

    return res
      .status(201)
      .json([{ message: "success in recording expense" }, response]);
  };
}
