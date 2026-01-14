import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { MonthlyClosureService } from "../services/MonthlyClosure.service.js";
import { getCurrentCompetency } from "../../../shared/utils/getCurrentCompetency.js";
import { getLastUnclosedMonth } from "../../../shared/utils/getLastUnclosedMonth.js";

@injectable()
export class MonthlyClosureController {
  constructor(
    @inject("MonthlyClosureService")
    private monthlyClosureService: MonthlyClosureService
  ) {}

  closeMonth = async (req: Request, res: Response) => {
    const { companyId, userId } = res.locals.encodedToken;

    const { month, year } = getCurrentCompetency();

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

  closeLateMonth = async (req: Request, res: Response) => {
    const { companyId, userId } = res.locals.encodedToken;

    const { month, year } = await getLastUnclosedMonth(companyId);

    const response = await this.monthlyClosureService.closeLateMonth(
      companyId,
      userId,
      month,
      year
    );

    return res.status(201).json({
      message: "Month successfully completed.",
      response,
    });
  };

  showMonthClosed = async (req: Request, res: Response) => {
    const { companyId } = res.locals.encodedToken;
    const response = await this.monthlyClosureService.showMonthClosed(
      companyId
    );

    return res.status(200).json(response);
  };
}
