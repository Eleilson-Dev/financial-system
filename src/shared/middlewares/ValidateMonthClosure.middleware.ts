import type { NextFunction, Request, Response } from "express";
import dayjs from "dayjs";
import { prisma } from "../../config/database.js";
import { AppError } from "../errors/AppError.js";
import { getClosureDeadline } from "../utils/getClosureDeadline.js";
import { getOpenCompetency } from "../utils/getOpenCompetency.js";

export class ValidateLateMonthClosure {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const { companyId } = res.locals.encodedToken;

    // 1️⃣ Qual é o próximo mês aberto?
    const { month, year } = await getOpenCompetency(companyId);

    // 2️⃣ Qual era o prazo normal desse mês?
    const deadline = getClosureDeadline(month, year);

    // 3️⃣ Ainda está dentro do prazo normal? então bloqueia
    if (dayjs().isBefore(deadline)) {
      throw new AppError(
        403,
        `The month ${month}/${year} It's still within the normal timeframe. (until ${deadline.format(
          "DD/MM/YYYY",
        )})`,
      );
    }

    // 4️⃣ Passou do prazo → fechamento em atraso permitido
    next();
  }
}
