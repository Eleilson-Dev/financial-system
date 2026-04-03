import { z } from "zod";

export const productCategorySchema = z.object({
  name: z
    .string()
    .nonempty("O nome da categoria é obrigatório")
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(50, "O nome deve ter no máximo 50 caracteres"),
});
