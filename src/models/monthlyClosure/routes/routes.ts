import { Router } from "express";
import { container } from "tsyringe";
import { MonthlyClosureService } from "../services/MonthlyClosure.service.js";
import { MonthlyClosureController } from "../controllers/MonthlyClosure.controller.js";
import { VerifyToken } from "../../../shared/middlewares/VerifyToken.middleware.js";
import { VerifyAdmin } from "../../../shared/middlewares/VerifyAdm.middleware.js";
import { VerifyNoPendingSalaries } from "../../../shared/middlewares/VerifyNoPendingSalaries.middleware.js";
import { AttachMonthlyClosureStatus } from "../../../shared/middlewares/AttachMonthlyClosureStatus.middleware.js";
import { ResolveOpenCompetency } from "../../../shared/middlewares/ResolveOpenCompetency.middleware.js";
import { VerifyCloseWindow } from "../../../shared/middlewares/VerifyCloseWindow.middleware.js";

container.registerSingleton("MonthlyClosureService", MonthlyClosureService);
const monthlyClosureController = container.resolve(MonthlyClosureController);

export const monthlyClosureRouter = Router();

monthlyClosureRouter.post(
  "/monthly-closure/close",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  VerifyAdmin.execute,
  ResolveOpenCompetency.execute,
  VerifyCloseWindow.execute,
  VerifyNoPendingSalaries.execute,
  (req, res) => monthlyClosureController.closeMonth(req, res),
);

monthlyClosureRouter.get(
  "/show/months/closed",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  VerifyAdmin.execute,
  (req, res) => monthlyClosureController.showMonthsClosed(req, res),
);
