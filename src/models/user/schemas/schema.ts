import { z } from "zod";
import { UserRole } from "../../../../generated/prisma/enums.js";

export const userSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(100)
    .refine((val) => !val.includes(" "), {
      message: "Senha não pode conter espaços",
    }),
  role: z.enum([UserRole.ADMIN, UserRole.OPERATOR]),
  isActive: z.boolean().optional(), // opcional, por padrão true
  companyId: z.string().uuid("ID da empresa inválido"),
});

export const userLoginSchema = userSchema.pick({
  email: true,
  password: true,
});

export const userLoginResult = userSchema.omit({
  password: true,
});

export type TUserLoginResult = z.infer<typeof userLoginResult>;

export const userCreateSchema = userSchema.omit({ companyId: true });

export type TUserData = z.infer<typeof userCreateSchema>;
