import { Router } from "express";
import { container } from "tsyringe";
import { CustomerService } from "../Services/Customer.service.js";
import { CustomerController } from "../Controllers/Customer.controller.js";
import { VerifyToken } from "../../../shared/middlewares/VerifyToken.middleware.js";
import { VerifyAdmin } from "../../../shared/middlewares/VerifyAdm.middleware.js";
import { ValidateBody } from "../../../shared/middlewares/ValidateBody.middleware.js";
import {
  createCustomerSchema,
  deleteEntrySchema,
  saleCreditSchema,
  salePaymentSchema,
  showCustomerSchema,
} from "../Schema/schema.js";
import { AlreadyPayDebit } from "../../../shared/middlewares/AlreadyPayDebit.middleware.js";
import { RequireOpenCash } from "../../../shared/middlewares/RequireOpenCash.middleware.js";
import { AttachMonthlyClosureStatus } from "../../../shared/middlewares/AttachMonthlyClosureStatus.middleware.js";
import { IsCpfExits } from "../../../shared/middlewares/IsCpfExists.middleware copy.js";
import { ValidateQuery } from "../../../shared/middlewares/ValidateQuery.middleware copy.js";
import { ValidatePrivilegedPassword } from "../../../shared/middlewares/ValidatePrivilegedPassword.middleware.js";

container.registerSingleton("CustomerService", CustomerService);
const customerController = container.resolve(CustomerController);

export const customerRouter = Router();

customerRouter.post(
  "/register/customer",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  VerifyAdmin.execute,
  ValidateBody.execute(createCustomerSchema),
  IsCpfExits.execute,
  (req, res) => customerController.registerCustomer(req, res),
);

customerRouter.get(
  "/show/customers",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  (req, res) => customerController.showAllCustomer(req, res),
);

customerRouter.get(
  "/show/customer",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  ValidateQuery.execute(showCustomerSchema),
  (req, res) => customerController.showCustomer(req, res),
);

customerRouter.post(
  "/customers/credit-sale/:customerId",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  ValidateBody.execute(saleCreditSchema),
  (req, res) => customerController.creditSale(req, res),
);

customerRouter.post(
  "/customers/paydebit-sale/:customerId",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  AlreadyPayDebit.execute,
  ValidateBody.execute(salePaymentSchema),
  RequireOpenCash.execute,
  (req, res) => customerController.payDebit(req, res),
);

customerRouter.delete(
  "/customers/delete-entry/:entryId",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  ValidateBody.execute(deleteEntrySchema),
  RequireOpenCash.execute,
  ValidatePrivilegedPassword.execute,
  (req, res) => customerController.deleteEntry(req, res),
);
