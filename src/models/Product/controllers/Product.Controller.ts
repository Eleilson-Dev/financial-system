import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { ProductService } from "../services/Product.Service.js";

@injectable()
export class ProductController {
  constructor(
    @inject("ProductService")
    private productService: ProductService,
  ) {}

  createProduct = async (req: Request, res: Response) => {
    const encodedToken = res.locals.encodedToken;

    const response = await this.productService.createProduct({
      name: req.body.name,
      price: req.body.price,
      barcode: req.body.barcode,
      companyId: encodedToken.companyId,
      stock: req.body.stock,
      stockType: req.body.stockType,
      categoryId: req.body.categoryId,
    });

    res.status(201).json(response);
  };
}
