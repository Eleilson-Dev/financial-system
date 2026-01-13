import { Router } from "express";
import { container } from "tsyringe";
import { SalaryPaymentService } from "../services/SalaryPayment.service.js";
import { SalaryPaymentController } from "../controllers/SalaryPayment.controller.js";
import { VerifyToken } from "../../../shared/middlewares/VerifyToken.middleware.js";
import { VerifyAdmin } from "../../../shared/middlewares/VerifyAdm.middleware.js";
import { VerifyAlreadyPaid } from "../../../shared/middlewares/VerifyAlreadyPaid.middleware.js";
import { VerifySalaryPayment } from "../../../shared/middlewares/VerifySalaryPayment.middleware.js";

container.registerSingleton("SalaryPayment", SalaryPaymentService);
const salaryPaymentController = container.resolve(SalaryPaymentController);

export const salaryPaymentRouter = Router();

salaryPaymentRouter.post(
  "/salary/payment",
  VerifyToken.execute,
  VerifyAdmin.execute,
  VerifyAlreadyPaid.execute,
  VerifySalaryPayment.execute,
  (req, res) => salaryPaymentController.paySalary(req, res)
);
