import { Router } from "express";
import { container } from "tsyringe";
import { SaleService } from "../services/Sale.Service.js";
import { SaleController } from "../controllers/Sale.Controller.js";
import { VerifyToken } from "../../../shared/middlewares/VerifyToken.middleware.js";
import { ValidateBody } from "../../../shared/middlewares/ValidateBody.middleware.js";
import { createSaleSchema, deleteSaleSchema } from "../schema/schema.js";
import { RequireOpenCash } from "../../../shared/middlewares/RequireOpenCash.middleware.js";
import { AttachMonthlyClosureStatus } from "../../../shared/middlewares/AttachMonthlyClosureStatus.middleware.js";
import { ValidatePrivilegedPassword } from "../../../shared/middlewares/ValidatePrivilegedPassword.middleware.js";

container.registerSingleton("SaleService", SaleService);
const saleController = container.resolve(SaleController);

export const saleRouter = Router();

saleRouter.post(
  "/register/sale",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  ValidateBody.execute(createSaleSchema),
  RequireOpenCash.execute,
  (req, res) => saleController.registerSale(req, res),
);

saleRouter.delete(
  "/exclude/sale/:id",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  ValidateBody.execute(deleteSaleSchema),
  RequireOpenCash.execute,
  ValidatePrivilegedPassword.execute,
  (req, res) => saleController.deleteSale(req, res),
);
