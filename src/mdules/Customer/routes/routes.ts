import { Router } from "express";
import { container } from "tsyringe";
import { CustomerService } from "../Services/Customer.service.js";
import { CustomerController } from "../Controllers/Customer.controller.js";
import { VerifyToken } from "../../../shared/middlewares/VerifyToken.middleware.js";
import { VerifyAdmin } from "../../../shared/middlewares/VerifyAdm.middleware.js";
import { ValidateBody } from "../../../shared/middlewares/ValidateBody.middleware.js";
import { createCustomerSchema, saleCreditSchema } from "../Schema/schema.js";
import { AlreadyPayDebit } from "../../../shared/middlewares/AlreadyPayDebit.middleware.js";

container.registerSingleton("CustomerService", CustomerService);
const customerController = container.resolve(CustomerController);

export const customerRouter = Router();

customerRouter.post(
  "/register/customer",
  VerifyToken.execute,
  VerifyAdmin.execute,
  ValidateBody.execute(createCustomerSchema),
  (req, res) => customerController.registerCustomer(req, res)
);

customerRouter.get(
  "/show/custumers",
  VerifyToken.execute,
  VerifyAdmin.execute,
  (req, res) => customerController.showAllCustomer(req, res)
);

customerRouter.post(
  "/customers/credit-sale/:custumerId",
  VerifyToken.execute,
  ValidateBody.execute(saleCreditSchema),
  (req, res) => customerController.creditSale(req, res)
);

customerRouter.post(
  "/customers/paydebit/:custumerId",
  VerifyToken.execute,
  AlreadyPayDebit.execute,
  ValidateBody.execute(saleCreditSchema),
  (req, res) => customerController.payDebit(req, res)
);
