import { Router } from "express";
import { container } from "tsyringe";
import { SalaryPaymentHistoryService } from "../services/SalaryPaymentHistory.service.js";
import { SalaryPaymentHistoryController } from "../controllers/SalaryPaymentHistory.controller.js";
import { VerifyToken } from "../../../shared/middlewares/VerifyToken.middleware.js";
import { VerifyAdmin } from "../../../shared/middlewares/VerifyAdm.middleware.js";
import { IsEmployeeExist } from "../../../shared/middlewares/IsEmployeeExist.middleware.js";
import { ValidateBody } from "../../../shared/middlewares/ValidateBody.middleware.js";
import { salaryIncreeseSchema } from "../schema/schema.js";
import { AttachMonthlyClosureStatus } from "../../../shared/middlewares/AttachMonthlyClosureStatus.middleware.js";

container.registerSingleton(
  "SalaryPaymentHistoryService",
  SalaryPaymentHistoryService,
);
const salaryPaymentHistoryController = container.resolve(
  SalaryPaymentHistoryController,
);

export const SalaryPaymentHistoryRouter = Router();

SalaryPaymentHistoryRouter.post(
  "/salary/increase/:employeeId",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  VerifyAdmin.execute,
  IsEmployeeExist.execute,
  ValidateBody.execute(salaryIncreeseSchema),
  (req, res) => salaryPaymentHistoryController.salaryIncreese(req, res),
);
