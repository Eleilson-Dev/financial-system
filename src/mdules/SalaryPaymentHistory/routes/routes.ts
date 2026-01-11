import { Router } from "express";
import { container } from "tsyringe";
import { SalaryPaymentHistoryService } from "../services/SalaryPaymentHistory.service.js";
import { SalaryPaymentHistoryController } from "../controllers/SalaryPaymentHistory.controller.js";
import { VerifyToken } from "../../../shared/middlewares/VerifyToken.js";
import { VerifyAdmin } from "../../../shared/middlewares/VerifyAdm.middleware.js";
import { IsEmployeeExist } from "../../../shared/middlewares/IsEmployeeExist.middleware.js";
import { ValidateBody } from "../../../shared/middlewares/ValidateBody.middleware.js";
import { salaryIncreeseSchema } from "../schema/schema.js";

container.registerSingleton(
  "SalaryPaymentHistoryService",
  SalaryPaymentHistoryService
);
const salaryPaymentHistoryController = container.resolve(
  SalaryPaymentHistoryController
);

export const SalaryPaymentHistoryRouter = Router();

salaryPaymentHistoryController;

SalaryPaymentHistoryRouter.post(
  "/salary/increase",
  VerifyToken.execute,
  VerifyAdmin.execute,
  IsEmployeeExist.execute,
  ValidateBody.execute(salaryIncreeseSchema),
  (req, res) => salaryPaymentHistoryController.salaryIncreese(req, res)
);
