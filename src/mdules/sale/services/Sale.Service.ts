import { injectable } from "tsyringe";
import { prisma } from "../../../config/database.js";
import type { TCreateSaleSchema } from "../schema/schema.js";

@injectable()
export class SaleService {
  registerSale = async (saleData: TCreateSaleSchema, resLocal: any) => {
    try {
      const { companyId, userId, cashRegisterId } = resLocal;

      const response = await prisma.sale.create({
        data: {
          amount: saleData.amount,
          paymentMethod: saleData.paymentMethod,
          cashRegisterId,
          companyId,
          createdById: userId,
        },
      });

      return response;
    } catch (error) {
      console.log(error);
      return "erro ao tentar registrar uma venda";
    }
  };
}
