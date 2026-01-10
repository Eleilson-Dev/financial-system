import { z } from "zod";

export const createEmployeeSchema = z.object({
  name: z
    .string()
    .nonempty("O nome do funcionário é obrigatório")
    .min(2, "O nome deve ter pelo menos 2 caracteres"),

  cpf: z
    .string()
    .nonempty("O CPF é obrigatório")
    .regex(/^\d{11}$/, "O CPF deve ter 11 dígitos numéricos"),

  salary: z.number().refine((val) => val > 0, {
    message: "O salário deve ser um valor positivo",
  }),
});

export type TCreateEmployeeSchema = z.infer<typeof createEmployeeSchema>;
