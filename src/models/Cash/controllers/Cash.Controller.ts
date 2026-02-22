import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { CashService } from "../services/Cash.Service.js";

@injectable()
export class CashController {
  constructor(@inject("CashService") private cashService: CashService) {}
  openCash = async (req: Request, res: Response) => {
    const encodedToken = res.locals.encodedToken;

    const response = await this.cashService.openCash(
      req.body.openingAmount,
      encodedToken,
    );

    res.status(201).json(response);
  };

  showOpenCashById = async (req: Request, res: Response) => {
    const { companyId, userId } = res.locals.encodedToken;
    const response = await this.cashService.showOpenCashById(companyId, userId);

    return res.status(200).json(response);
  };

  showCloseCash = async (req: Request, res: Response) => {
    const { companyId } = res.locals.encodedToken;
    const response = await this.cashService.showCloseCash(companyId);

    return res.status(200).json(response);
  };

  closeCash = async (req: Request, res: Response) => {
    const response = await this.cashService.closeCash(
      res.locals.cashOpenData,
      req.body.countedCashAmount,
    );

    return res.status(200).json(response);
  };
}
