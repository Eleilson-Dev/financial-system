import { Router } from "express";
import { container } from "tsyringe";
import { ExpenseService } from "../services/Expense.service.js";
import { ExpenseController } from "../controllers/Expense.controller.js";
import { VerifyToken } from "../../../shared/middlewares/VerifyToken.middleware.js";
import { VerifyAdmin } from "../../../shared/middlewares/VerifyAdm.middleware.js";
import { ValidateBody } from "../../../shared/middlewares/ValidateBody.middleware.js";
import { createExpenseSchema } from "../schema/schema.js";
import { AttachMonthlyClosureStatus } from "../../../shared/middlewares/AttachMonthlyClosureStatus.middleware.js";

container.registerSingleton("ExpenseService", ExpenseService);
const expenseController = container.resolve(ExpenseController);

export const expenseRouter = Router();

expenseRouter.post(
  "/register/expense",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  VerifyAdmin.execute,
  ValidateBody.execute(createExpenseSchema),
  (req, res) => expenseController.registerExpense(req, res),
);
