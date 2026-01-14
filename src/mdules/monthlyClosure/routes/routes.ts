import { Router } from "express";
import { container } from "tsyringe";
import { MonthlyClosureService } from "../services/MonthlyClosure.service.js";
import { MonthlyClosureController } from "../controllers/MonthlyClosure.controller.js";
import { VerifyToken } from "../../../shared/middlewares/VerifyToken.middleware.js";
import { VerifyAdmin } from "../../../shared/middlewares/VerifyAdm.middleware.js";

container.registerSingleton("MonthlyClosureService", MonthlyClosureService);
const monthlyClosureController = container.resolve(MonthlyClosureController);

export const monthlyClosureRouter = Router();

monthlyClosureRouter.post(
  "/monthly-closure/close",
  VerifyToken.execute,
  VerifyAdmin.execute,
  (req, res) => monthlyClosureController.closeMonth(req, res)
);

monthlyClosureRouter.post(
  "/monthly-closure/close-late",
  VerifyToken.execute,
  VerifyAdmin.execute,
  (req, res) => monthlyClosureController.closeLateMonth(req, res)
);

monthlyClosureRouter.get(
  "/show/month/closed",
  VerifyToken.execute,
  VerifyAdmin.execute,
  (req, res) => monthlyClosureController.showMonthClosed(req, res)
);
