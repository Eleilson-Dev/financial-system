import { z } from "zod";
import { PaymentMethod } from "../../../../generated/prisma/enums.js";

const saleItemSchema = z.object({
  productId: z.string().uuid("ID do produto inválido").optional(),
  name: z.string().optional(),
  categoryId: z.string().uuid("ID da categoria inválido").optional(),
  categoryName: z.string().optional(),
  quantity: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "A quantidade deve ser maior que zero."),
  ),
  unitPrice: z.preprocess(
    (val) => Number(val),
    z.number().min(0.01, "O preço unitário deve ser maior que zero."),
  ),
});

export const createSaleSchema = z.object({
  amount: z.preprocess(
    (val) => Number(val),
    z.number().min(0.01, "O valor deve ser maior que zero."),
  ),
  paymentMethod: z
    .nativeEnum(PaymentMethod)
    .refine((val) => Object.values(PaymentMethod).includes(val), {
      message: "Forma de pagamento inválida.",
    }),
  items: z
    .array(saleItemSchema)
    .min(1, "A venda deve incluir pelo menos um item."),
});

export const deleteSaleSchema = z.object({
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(100)
    .refine((val) => !val.includes(" "), {
      message: "Senha não pode conter espaços",
    }),
});
