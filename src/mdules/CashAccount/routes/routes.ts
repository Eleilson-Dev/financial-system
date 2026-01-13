import { Router } from "express";
import { container } from "tsyringe";
import { VerifyToken } from "../../../shared/middlewares/VerifyToken.middleware.js";
import { VerifyAdmin } from "../../../shared/middlewares/VerifyAdm.middleware.js";
import { CashAccountService } from "../services/CashAccount.service.js";
import { CashAccountController } from "../controllers/CashAccount.controller.js";

container.registerSingleton("CashAccountService", CashAccountService);
const cashAccountController = container.resolve(CashAccountController);

export const cashAccountRouter = Router();

cashAccountRouter.get(
  "/show/balance",
  VerifyToken.execute,
  VerifyAdmin.execute,
  (req, res) => cashAccountController.showBalance(req, res)
);

cashAccountRouter.get(
  "/show/account/history",
  VerifyToken.execute,
  VerifyAdmin.execute,
  (req, res) => cashAccountController.ShowAccountHistory(req, res)
);
