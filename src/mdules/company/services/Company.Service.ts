import { prisma } from "../../../config/database.js";
import { injectable } from "tsyringe";
import bcrypt from "bcrypt";
import type { TCreateCompany, TCreateOwner } from "../schemas/schemas.js";

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
    ownerData: TCreateOwner
  ) => {
    try {
      const hashedPassword = await bcrypt.hash(ownerData.password, 10);

      const result = prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: companyData,
        });

        const cashAccount = await tx.cashAccount.create({
          data: { balance: 0, companyId: company.id },
        });

        const owner = await tx.user.create({
          data: {
            name: ownerData.name,
            email: ownerData.email,
            password: hashedPassword,
            role: "OWNER",
            companyId: company.id,
          },
        });

        return { company, cashAccount, owner };
      });

      return result;
    } catch (error) {
      console.error(error);
      return { error: "Erro ao criar empresa and owner" };
    }
  };

  showBalance = async () => {
    const result = await prisma.$transaction(async (tx) => {
      const balance = await tx.cashAccount.findMany();

      return balance;
    });

    return result;
  };
}
