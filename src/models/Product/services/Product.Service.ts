import { injectable } from "tsyringe";
import { prisma } from "../../../config/db/database.js";
import { AppError } from "../../../shared/errors/AppError.js";
import type { TCreateProductDTO } from "../dtos/TCreateProductDTO.js";

@injectable()
export class ProductService {
  createProduct = async (data: TCreateProductDTO) => {
    try {
      const result = await prisma.$transaction(async (prismaTx) => {
        const newProduct = await prismaTx.product.create({
          data: {
            name: data.name,
            price: data.price,
            stock: data.stock,
            stockType: data.stockType,
            barcode: data.barcode,
            categoryId: data.categoryId || null,
            companyId: data.companyId,
          },
        });

        await prismaTx.stockMovement.create({
          data: {
            productId: newProduct.id,
            type: "ADD",
            quantity: data.stock,
          },
        });

        return newProduct;
      });

      return result;
    } catch (error) {
      console.log(error);
      throw new AppError(400, "Error while trying to create a product");
    }
  };
}
