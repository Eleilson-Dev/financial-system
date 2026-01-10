import { Router } from "express";
import { container } from "tsyringe";
import { CashService } from "../services/Cash.Service.js";
import { CashController } from "../controllers/Cash.Controller.js";
import { VerifyToken } from "../../../shared/middlewares/VerifyToken.js";
import { ValidateBody } from "../../../shared/middlewares/ValidateBody.middleware.js";
import { openCashRegisterSchema } from "../schema/schema.js";
import { IsCashOpen } from "../../../shared/middlewares/IsCashOpen.middleware.js";
import { RequireOpenCash } from "../../../shared/middlewares/RequireOpenCash.middleware.js";

container.registerSingleton("CashService", CashService);
const cashController = container.resolve(CashController);

export const cashRouter = Router();

cashRouter.post(
  "/open/cash",
  VerifyToken.execute,
  ValidateBody.execute(openCashRegisterSchema),
  IsCashOpen.execute,
  (req, res) => cashController.openCash(req, res)
);

cashRouter.get("/show/open/cash", VerifyToken.execute, (req, res) =>
  cashController.showOpenCash(req, res)
);

cashRouter.get("/show/close/cash", VerifyToken.execute, (req, res) =>
  cashController.showCloseCash(req, res)
);

cashRouter.post(
  "/close/cash",
  VerifyToken.execute,
  RequireOpenCash.execute,
  (req, res) => cashController.closeCash(req, res)
);
