import { Router } from "express";

import { VerifyToken } from "../../../shared/middlewares/VerifyToken.middleware.js";
import { AttachMonthlyClosureStatus } from "../../../shared/middlewares/AttachMonthlyClosureStatus.middleware.js";
import { container } from "tsyringe";
import { FinancialOverviewService } from "../services/FinancialOverview.service.js";
import { FinancialOverviewController } from "../controllers/FinancialOverview.controller.js";

container.registerSingleton(
  "FinancialOverviewService",
  FinancialOverviewService,
);

const financialOverviewController = container.resolve(
  FinancialOverviewController,
);

export const financialOverviewRouter = Router();

financialOverviewRouter.get(
  "/summary",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  (req, res) => financialOverviewController.getFinancialSummary(req, res),
);

financialOverviewRouter.get(
  "/monthly-graph",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  (req, res) => financialOverviewController.getMonthlyGraph(req, res),
);

financialOverviewRouter.get(
  "/weekly-graph",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  (req, res) => financialOverviewController.getWeeklyGraph(req, res),
);

financialOverviewRouter.get(
  "/recent-transactions",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  (req, res) => financialOverviewController.getRecentTransactions(req, res),
);
