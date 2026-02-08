import { z } from "zod";

export const openCashRegisterSchema = z.object({
  openingAmount: z
    .any()
    .refine((val) => val !== undefined, {
      message: "openingAmount é obrigatório",
    })
    .refine((val) => typeof val === "number", {
      message: "openingAmount deve ser um número",
    })
    .refine((val) => val >= 0, {
      message: "openingAmount não pode ser negativo",
    }),
});

export const closeCashRegisterSchema = z.object({
  countedCashAmount: z.coerce.number().refine((value) => !Number.isNaN(value), {
    message: "Informe o valor conferido no caixa",
  }),
});
