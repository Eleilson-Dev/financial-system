import { z } from "zod";

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
