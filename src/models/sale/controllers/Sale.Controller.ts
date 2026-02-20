import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import type { SaleService } from "../services/Sale.Service.js";

@injectable()
export class SaleController {
  constructor(@inject("SaleService") private saleService: SaleService) {}
  registerSale = async (req: Request, res: Response) => {
    const response = await this.saleService.registerSale(req.body, {
      companyId: res.locals.encodedToken.companyId,
      userId: res.locals.encodedToken.userId,
      cashRegisterId: res.locals.cashOpenData.cashOpen,
    });

    res.status(201).json(response);
  };

  deleteSale = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { companyId, userId } = res.locals.encodedToken;

    const response = await this.saleService.deleteSale(
      id as string,
      companyId,
      userId,
    );

    return res.status(200).json(response);
  };
}
