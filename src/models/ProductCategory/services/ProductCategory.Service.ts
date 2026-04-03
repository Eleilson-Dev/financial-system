import { injectable } from "tsyringe";
import { prisma } from "../../../config/db/database.js";
import { AppError } from "../../../shared/errors/AppError.js";

@injectable()
export class ProductCategoryService {
  createCategory = async (amount: number, encodedToken: any) => {
    try {
      return;
    } catch (error) {
      console.log(error);
      throw new AppError(400, "");
    }
  };
}
