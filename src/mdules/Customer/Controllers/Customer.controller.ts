import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { CustomerService } from "../Services/Customer.service.js";

@injectable()
export class CustomerController {
  constructor(
    @inject("CustomerService") private customerService: CustomerService,
  ) {}

  showAllCustomer = async (req: Request, res: Response) => {
    const { companyId } = res.locals.encodedToken;
    const response = await this.customerService.showAllCustomer(companyId);

    return res.status(200).json(response);
  };

  showCustomer = async (req: Request, res: Response) => {
    const { companyId } = res.locals.encodedToken;
    const { search } = res.locals.query as { search: string };

    const response = await this.customerService.showCustomer(companyId, search);

    return res.status(200).json(response);
  };

  registerCustomer = async (req: Request, res: Response) => {
    const { companyId } = res.locals.encodedToken;
    const response = await this.customerService.registerCustomer(
      req.body,
      companyId,
    );

    return res.status(201).json(response);
  };

  creditSale = async (req: Request, res: Response) => {
    const { customerId } = req.params;
    const { amount } = req.body;
    const { companyId } = res.locals.encodedToken;

    const response = await this.customerService.creditSale(
      customerId as string,
      amount,
      companyId,
    );

    return res.status(201).json(response);
  };

  payDebit = async (req: Request, res: Response) => {
    const { companyId, userId } = res.locals.encodedToken;
    const cashRegisterId = res.locals.cashOpenData.cashOpen;
    const { customerId } = req.params;
    const { amount, paymentMethod } = req.body;

    const response = await this.customerService.payDebt(
      customerId as string,
      amount,
      companyId,
      userId,
      cashRegisterId,
      paymentMethod,
    );

    return res.status(201).json(response);
  };

  deleteEntry = async (req: Request, res: Response) => {
    const { entryId } = req.params;
    const { companyId, userId } = res.locals.encodedToken;

    const response = await this.customerService.deleteEntry(
      entryId as string,
      companyId,
      userId,
    );

    return res.status(200).json(response);
  };
}
