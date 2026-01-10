import { z } from "zod";
import { PaymentMethod } from "../../../../generated/prisma/enums.js";

export const createSaleSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  paymentMethod: z.nativeEnum(PaymentMethod),
});

export type TCreateSaleSchema = z.infer<typeof createSaleSchema>;
