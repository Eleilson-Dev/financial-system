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

  ShowAccountHistory = async (req: Request, res: Response) => {
    const response = await this.cashAccountService.ShowAccountHistory();

    return res.status(200).json(response);
  };
}
