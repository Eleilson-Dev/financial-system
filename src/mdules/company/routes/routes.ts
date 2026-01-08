import { Router } from "express";
import { container } from "tsyringe";
import { CompanyController } from "../controllers/Company.Controller.js";
import { CompanyService } from "../services/Company.Service.js";
import { ValidateBody } from "../../../shared/middlewares/ValidateBody.middleware.js";
import { companySchema, ownerSchema } from "../schemas/schemas.js";
import { z } from "zod";

export const companyRouter = Router();

container.registerSingleton("CompanyService", CompanyService);
const companyController = container.resolve(CompanyController);

companyRouter.get("/companies/list", (req, res) =>
  companyController.findAllCompanies(req, res)
);

companyRouter.post(
  "/company/create",
  ValidateBody.execute(
    z.object({
      company: companySchema,
      owner: ownerSchema,
    })
  ),
  (req, res) => companyController.createCompany(req, res)
);
