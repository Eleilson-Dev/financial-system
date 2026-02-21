import { prisma } from "../../../config/db/database.js";
import { injectable } from "tsyringe";
import bcrypt from "bcrypt";
import type { TCreateCompany, TCreateOwner } from "../schemas/schemas.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class CompanyService {
  findAllCompanies = async () => {
    const response = await prisma.company.findMany({
      include: { cashAccount: true },
    });

    return response;
  };

  createCompany = async (
    companyData: TCreateCompany,
    ownerData: TCreateOwner,
  ) => {
    try {
      const hashedPassword = await bcrypt.hash(ownerData.password, 10);
      const email = ownerData.email.toLowerCase();

      const result = prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: companyData,
        });

        const cashAccount = await tx.cashAccount.create({
          data: { balance: 0, companyId: company.id },
        });

        const newOwner = await tx.user.create({
          data: {
            name: ownerData.name,
            email,
            password: hashedPassword,
            role: "OWNER",
            companyId: company.id,
          },
        });

        const { password, ...owner } = newOwner;

        return { company, cashAccount, owner };
      });

      return result;
    } catch (error) {
      console.error(error);
      throw new AppError(400, "Erro ao criar empresa and owner");
    }
  };
}
