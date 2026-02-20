import type { NextFunction, Request, Response } from "express";
import { prisma } from "../../config/db/database.js";
import { AppError } from "../errors/AppError.js";

export class IsCpfExits {
  static async execute(req: Request, res: Response, next: NextFunction) {
    const cpf = req.body.cpf;

    const response = await prisma.customer.findFirst({
      where: { cpf },
    });

    if (response) {
      throw new AppError(409, "CPF already exits");
    }

    next();
  }
}
