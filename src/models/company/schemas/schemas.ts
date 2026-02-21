import { z } from "zod";

// Regex simples para CNPJ no formato 00.000.000/0000-00
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

export const createCompanySchema = z.object({
  company: z.object({
    name: z
      .string()
      .min(1, "Nome da empresa é obrigatório")
      .max(255, "Nome muito longo"),

    document: z
      .string()
      .regex(cnpjRegex, "CNPJ deve estar no formato 00.000.000/0000-00"),
  }),

  owner: z.object({
    name: z.string().min(1, "Nome do proprietário é obrigatório").max(255),

    email: z.string().email("Email inválido").max(255),

    password: z
      .string()
      .min(6, "Senha deve ter no mínimo 8 caracteres")
      .max(255),
  }),
});

const companyOnlySchema = createCompanySchema.shape.company.pick({
  name: true,
  document: true,
});

export type TCreateCompany = z.infer<typeof companyOnlySchema>;

const ownerOnlySchema = createCompanySchema.shape.owner.pick({
  name: true,
  email: true,
  password: true,
});

export type TCreateOwner = z.infer<typeof ownerOnlySchema>;
