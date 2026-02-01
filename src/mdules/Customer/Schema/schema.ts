import { z } from "zod";
import { PaymentMethod } from "../../../../generated/prisma/enums.js";

export const createCustomerSchema = z.object({
  name: z
    .string({ message: "Nome é obrigatório" })
    .min(3, "Nome deve ter pelo menos 3 caracteres"),

  cpf: z
    .string({ message: "CPF é obrigatório" })
    .regex(/^\d{11}$/, "CPF deve conter 11 números"),

  phone: z
    .string()
    .regex(/^\d{10,11}$/, "Telefone inválido")
    .optional(),
});

export const saleCreditSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
});

export const salePaymentSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  paymentMethod: z.nativeEnum(PaymentMethod),
});

export const showCustomerSchema = z.object({
  search: z.string().trim().min(2, "Informe o nome do cliente"),
});
