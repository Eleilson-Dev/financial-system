import { injectable } from "tsyringe";
import { prisma } from "../../../config/db/database.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { normalizeText } from "../../../shared/utils/normalizeText.js";

@injectable()
export class ProductCategoryService {
  createCategory = async (name: string, companyId: string) => {
    try {
      const newCategory = await prisma.productCategory.create({
        data: {
          name,
          companyId,
          nameNormalized: normalizeText(name),
        },
      });

      return newCategory;
    } catch (error) {
      console.log(error);
      throw new AppError(400, "Error while trying to create category.");
    }
  };

  listCategoris = async (companyId: string) => {
    try {
      const allCategories = await prisma.productCategory.findMany({
        where: { companyId },
      });

      return allCategories;
    } catch (error) {
      console.log(error);
      throw new AppError(400, "Error when trying to retrieve all categories.");
    }
  };
}
