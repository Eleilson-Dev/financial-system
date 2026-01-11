import { Router } from "express";
import { container } from "tsyringe";
import { CompanyController } from "../controllers/Company.Controller.js";
import { CompanyService } from "../services/Company.Service.js";
import { ValidateBody } from "../../../shared/middlewares/ValidateBody.middleware.js";
import { companySchema, ownerSchema } from "../schemas/schemas.js";
import { z } from "zod";
import { VerifyToken } from "../../../shared/middlewares/VerifyToken.js";
import { VerifyAdmin } from "../../../shared/middlewares/VerifyAdm.middleware.js";
import { IsCompanyExits } from "../../../shared/middlewares/IsCompanyExists.middleware.js";

export const companyRouter = Router();

container.registerSingleton("CompanyService", CompanyService);
const companyController = container.resolve(CompanyController);

companyRouter.get("/companies/list", (req, res) =>
  companyController.findAllCompanies(req, res)
);

companyRouter.post(
  "/company/create",
  IsCompanyExits.execute,
  ValidateBody.execute(
    z.object({
      company: companySchema,
      owner: ownerSchema,
    })
  ),
  (req, res) => companyController.createCompany(req, res)
);

companyRouter.get(
  "/company/show/balance",
  VerifyToken.execute,
  VerifyAdmin.execute,
  (req, res) => companyController.showBalance(req, res)
);
