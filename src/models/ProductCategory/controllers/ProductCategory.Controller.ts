import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { ProductCategoryService } from "../services/ProductCategory.Service.js";

@injectable()
export class ProductCategoryController {
  constructor(
    @inject("ProductCategoryService")
    private productCategoryService: ProductCategoryService,
  ) {}
  createCategory = async (req: Request, res: Response) => {
    const encodedToken = res.locals.encodedToken;

    res.status(201).json({ satus: "ok" });
  };
}
