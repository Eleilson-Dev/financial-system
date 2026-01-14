import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { EmployeeService } from "../services/Employee.Service.js";

@injectable()
export class EmployeeController {
  constructor(
    @inject("EmployeeService") private employeeService: EmployeeService
  ) {}
  createEmployee = async (req: Request, res: Response) => {
    const { companyId } = res.locals.encodedToken;

    const response = await this.employeeService.createEmployee(
      req.body,
      companyId
    );

    return res.status(201).json(response);
  };

  showAllEmployees = async (req: Request, res: Response) => {
    const { companyId } = res.locals.encodedToken;

    const response = await this.employeeService.showAllEmployees(companyId);

    return res.status(200).json(response);
  };
}
