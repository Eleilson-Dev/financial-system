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

  getProductByBarcode = async (req: Request, res: Response) => {
    const product = res.locals.product;
    const quantity = res.locals.quantity;

    res.status(200).json({
      barcode: product.barcode,
      quantity,
      product: {
        id: product.id,
        name: product.name,
        price: product.price.toString(),
        barcode: product.barcode,
        stock: product.stock.toString(),
        stockType: product.stockType,
        companyId: product.companyId,
        categoryId: product.categoryId,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  };
}
