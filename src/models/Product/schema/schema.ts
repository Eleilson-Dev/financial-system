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
  stockType: z.enum(["UNIT", "KILO"], {
    message: "stockType deve ser 'UNIT' ou 'KILO'",
  }),
});

export const searchProductSchema = z.object({
  barcode: z.string().min(5, "Código de barras inválido"),
  quantity: z.preprocess(
    (val) => Number(val),
    z.number().min(0.001, "Quantidade deve ser maior que zero.").optional(),
  ),
});
