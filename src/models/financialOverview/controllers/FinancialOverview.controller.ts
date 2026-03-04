import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { FinancialOverviewService } from "../services/FinancialOverview.service.js";

@injectable()
export class FinancialOverviewController {
  constructor(
    @inject("FinancialOverviewService")
    private financialOverviewService: FinancialOverviewService,
  ) {}

  getFinancialSummary = async (req: Request, res: Response) => {
    const response = await this.financialOverviewService.getFinancialSummary(
      res.locals.encodedToken.companyId,
    );

    const monthlyClosureStatus = res.locals.monthlyClosureStatus;

    return res.status(201).json([response, monthlyClosureStatus]);
  };
}
