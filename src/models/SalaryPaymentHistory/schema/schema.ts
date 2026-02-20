import { z } from "zod";

export const salaryIncreeseSchema = z.object({
  salary: z.number().refine((val) => val > 0, {
    message: "O salário deve ser um valor positivo",
  }),
});
