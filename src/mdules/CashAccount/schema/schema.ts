import { z } from "zod";

export const createCashaAjustment = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
});
