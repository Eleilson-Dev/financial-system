import { injectable } from "tsyringe";
import { AppError } from "../../../shared/errors/AppError.js";
import { prisma } from "../../../config/database.js";

@injectable()
export class CustomerService {
  showAllCustomer = async (companyId: string) => {
    const result = prisma.$transaction(async (tx) => {
      const allCustomers = await tx.customer.findMany({ where: { companyId } });

      return allCustomers;
    });

    return result;
  };

  registerCustomer = async (costomerData: any, companyId: string) => {
    try {
      const result = prisma.$transaction(async (tx) => {
        const custumer = await tx.customer.create({
          data: {
            companyId,
            name: costomerData.name,
            cpf: costomerData.cpf,
            phone: costomerData.phone,
          },
        });

        return custumer;
      });

      return result;
    } catch (error) {
      console.log(error);
      throw new AppError(400, "Erro ao tentar registrar um cliente");
    }
  };
}
