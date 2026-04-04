import { Router } from "express";
import { container } from "tsyringe";
import { ProductService } from "../services/Product.Service.js";
import { ProductController } from "../controllers/Product.Controller.js";
import { VerifyToken } from "../../../shared/middlewares/VerifyToken.middleware.js";
import { ValidateBody } from "../../../shared/middlewares/ValidateBody.middleware.js";
import { createProductSchema } from "../schema/schema.js";
import { AttachMonthlyClosureStatus } from "../../../shared/middlewares/AttachMonthlyClosureStatus.middleware.js";
import { ValidateCategoryExistence } from "../middlewares/ValidateCategoryExistence.middleware.js";

container.registerSingleton("ProductService", ProductService);
const productController = container.resolve(ProductController);

export const productRouter = Router();

productRouter.post(
  "/create/product",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  ValidateBody.execute(createProductSchema),
  (req, res) => productController.createProduct(req, res),
);
