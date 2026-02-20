import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { MonthlyClosureService } from "../services/MonthlyClosure.service.js";

@injectable()
export class MonthlyClosureController {
  constructor(
    @inject("MonthlyClosureService")
    private monthlyClosureService: MonthlyClosureService,
  ) {}

  closeMonth = async (req: Request, res: Response) => {
    const { companyId, userId } = res.locals.encodedToken;
    const { month, year } = res.locals.openCompetency;

    const response = await this.monthlyClosureService.closeMonth({
      companyId,
      userId,
      month,
      year,
    });

    return res.status(201).json({
      message: "Month successfully completed.",
      response,
    });
  };

  showMonthClosed = async (req: Request, res: Response) => {
    const { companyId } = res.locals.encodedToken;
    const response =
      await this.monthlyClosureService.showMonthClosed(companyId);

    return res.status(200).json(response);
  };
}
