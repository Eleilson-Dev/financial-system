import { Router } from "express";
import { container } from "tsyringe";
import { EmployeeService } from "../services/Employee.Service.js";
import { EmployeeController } from "../controllers/Employee.Controller.js";
import { VerifyToken } from "../../../shared/middlewares/VerifyToken.middleware.js";
import { ValidateBody } from "../../../shared/middlewares/ValidateBody.middleware.js";
import { createEmployeeSchema } from "../schema/schema.js";
import { VerifyAdmin } from "../../../shared/middlewares/VerifyAdm.middleware.js";
import { IsEmployeeExists } from "../../../shared/middlewares/IsEmplyeeExists.middleware.js";
import { AttachMonthlyClosureStatus } from "../../../shared/middlewares/AttachMonthlyClosureStatus.middleware.js";

container.registerSingleton("EmployeeService", EmployeeService);
const employeeController = container.resolve(EmployeeController);

export const employeeRouter = Router();

employeeRouter.post(
  "/register/employee",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  ValidateBody.execute(createEmployeeSchema),
  VerifyAdmin.execute,
  IsEmployeeExists.execute,
  (req, res) => employeeController.createEmployee(req, res),
);

employeeRouter.get(
  "/show/employees",
  VerifyToken.execute,
  AttachMonthlyClosureStatus.execute,
  VerifyAdmin.execute,
  (req, res) => employeeController.showAllEmployees(req, res),
);
