import { prisma } from "../../../config/database.js";
import { injectable } from "tsyringe";
import bcrypt from "bcrypt";
import type { TCreateCompany, TCreateOwner } from "../schemas/schemas.js";

@injectable()
export class CompanyService {
  findAllCompanies = async () => {
    const response = await prisma.company.findMany();

    return response;
  };

  createCompany = async (
    companyData: TCreateCompany,
    ownerData: TCreateOwner
  ) => {
    try {
      const hashedPassword = await ownerData.password;

      const newCompany = await prisma.company.create({
        data: companyData,
      });

      const owner = await prisma.user.create({
        data: {
          name: ownerData.name,
          email: ownerData.email,
          password: await bcrypt.hash(hashedPassword, 10),
          role: "OWNER",
          companyId: newCompany.id,
        },
      });

      return { company: newCompany, owner };
    } catch (error) {
      console.error(error);
      return { error: "Erro ao criar empresa and owner" };
    }
  };
}
