import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(3, "Nome da empresa deve ter no mínimo 3 caracteres"),
  document: z
    .string()
    .min(11, "Documento inválido")
    .max(18, "Documento inválido"),
});

export const ownerSchema = z.object({
  name: z.string().min(3, "O nome precisa ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres"),
});

export type TCreateCompany = z.infer<typeof companySchema>;
export type TCreateOwner = z.infer<typeof ownerSchema>;
