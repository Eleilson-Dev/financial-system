import { z } from "zod";
import { PaymentMethod } from "../../../../generated/prisma/enums.js";

export const createCustomerSchema = z.object({
  name: z
    .string({ message: "Nome é obrigatório" })
    .min(3, "Nome deve ter pelo menos 3 caracteres"),

  cpf: z
    .string({ message: "CPF é obrigatório" })
    .transform((val) => val.replace(/\D/g, "")) // remove tudo que não é número
    .refine((val) => val.length === 11, { message: "CPF deve ter 11 números" }),

  phone: z
    .string()
    .regex(/^\d{10,11}$/, "Telefone inválido")
    .optional(),

  address: z
    .object({
      rua: z.string().min(2, "Informe a rua"),
      numero: z.string().min(1, "Informe o número"),
      bairro: z.string().optional(),
      cidade: z.string().optional(),
      cep: z.string().optional(),
    })
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
