import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, { message: "O nome do produto é obrigatório" }),
  price: z.number().positive({ message: "O preço deve ser maior que zero" }),
  barcode: z.string().min(1, { message: "O barcode é obrigatório" }),
  categoryId: z
    .string()
    .uuid({ message: "O categoryId deve ser um UUID válido" })
    .optional(),
  stock: z
    .number()
    .nonnegative({ message: "O estoque não pode ser negativo" })
    .optional()
    .default(0),
  stockType: z.enum(["UNIT", "KG"], {
    message: "stockType deve ser 'UNIT' ou 'KG'",
  }),
});

export const searchProductSchema = z.object({
  barcode: z.string(),
  quantity: z.coerce.number().optional(),
});
