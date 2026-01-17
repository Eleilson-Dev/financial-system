import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { CustomerService } from "../Services/Customer.service.js";

@injectable()
export class CustomerController {
  constructor(
    @inject("CustomerService") private customerService: CustomerService
  ) {}

  showAllCustomer = async (req: Request, res: Response) => {
    const { companyId } = res.locals.encodedToken;
    const response = await this.customerService.showAllCustomer(companyId);

    return res.status(200).json(response);
  };

  registerCustomer = async (req: Request, res: Response) => {
    const { companyId } = res.locals.encodedToken;
    const response = await this.customerService.registerCustomer(
      req.body,
      companyId
    );

    return res.status(201).json(response);
  };

  creditSale = async (req: Request, res: Response) => {
    const { custumerId } = req.params;
    const { amount } = req.body;

    const response = await this.customerService.creditSale(
      custumerId as string,
      amount
    );

    return res.status(201).json(response);
  };

  payDebit = async (req: Request, res: Response) => {
    const { companyId, userId } = res.locals.encodedToken;
    const { custumerId } = req.params;
    const { amount } = req.body;

    const response = await this.customerService.payDebt(
      custumerId as string,
      amount,
      companyId,
      userId
    );

    return res.status(201).json(response);
  };
}
