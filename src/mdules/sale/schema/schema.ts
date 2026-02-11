import { z } from "zod";
import { PaymentMethod } from "../../../../generated/prisma/enums.js";

export const createSaleSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  paymentMethod: z.nativeEnum(PaymentMethod),
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

export type TCreateSaleSchema = z.infer<typeof createSaleSchema>;
