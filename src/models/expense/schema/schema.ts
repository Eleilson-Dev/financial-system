import { z } from "zod";

export const ExpenseCategoryEnum = z.enum([
  "MERCHANDISE",
  "FIXED",
  "TAX",
  "MAINTENANCE",
  "OTHER",
]);

export const createExpenseSchema = z.object({
  description: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres"),

  amount: z.number().refine((val) => val > 0, {
    message: "O valor da despesa deve ser maior que zero",
  }),

  category: ExpenseCategoryEnum,
});

export type TCreateExpenseSchema = z.infer<typeof createExpenseSchema>;
