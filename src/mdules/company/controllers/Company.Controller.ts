import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { CompanyService } from "../services/Company.Service.js";

@injectable()
export class CompanyController {
  constructor(
    @inject("CompanyService") private companyService: CompanyService
  ) {}
  findAllCompanies = async (req: Request, res: Response) => {
    const response = await this.companyService.findAllCompanies();

    return res.status(200).json(response);
  };

  createCompany = async (req: Request, res: Response) => {
    const { company, owner } = req.body;
    const response = await this.companyService.createCompany(company, owner);

    return res
      .status(200)
      .json({ message: "new company and owner created", response });
  };
}
