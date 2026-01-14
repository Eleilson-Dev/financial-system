import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { CashAccountService } from "../services/CashAccount.service.js";

@injectable()
export class CashAccountController {
  constructor(
    @inject("CashAccountService") private cashAccountService: CashAccountService
  ) {}

  showBalance = async (req: Request, res: Response) => {
    const response = await this.cashAccountService.showBalance();

    return res.status(200).json(response);
  };

  cashAdjustment = async (req: Request, res: Response) => {
    const { userId, companyId } = res.locals.encodedToken;

    const response = await this.cashAccountService.cashAdjustment(
      req.body,
      companyId,
      userId
    );

    return res.status(200).json([
      {
        message: "success in making financial adjustments",
      },
      response,
    ]);
  };

  showAccountHistory = async (req: Request, res: Response) => {
    const response = await this.cashAccountService.showAccountHistory();

    return res.status(200).json(response);
  };
}
