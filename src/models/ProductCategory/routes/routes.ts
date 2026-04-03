import { Router } from "express";
import { container } from "tsyringe";
import { ProductCategoryService } from "../services/ProductCategory.Service.js";
import { ProductCategoryController } from "../controllers/ProductCategory.Controller.js";
import { VerifyToken } from "../../../shared/middlewares/VerifyToken.middleware.js";
import { ValidateBody } from "../../../shared/middlewares/ValidateBody.middleware.js";
import { productCategorySchema } from "../schema/schema.js";
import { AttachMonthlyClosureStatus } from "../../../shared/middlewares/AttachMonthlyClosureStatus.middleware.js";

container.registerSingleton("ProductCategoryService", ProductCategoryService);
const productCategoryController = container.resolve(ProductCategoryController);

export const productCategoryRouter = Router();

productCategoryRouter.post(
  "/create/category",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  ValidateBody.execute(productCategorySchema),
  (req, res) => productCategoryController.createCategory(req, res),
);
