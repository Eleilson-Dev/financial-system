import type { PaymentMethod } from "../../../generated/prisma/enums.js";
import type { Decimal } from "../../../generated/prisma/internal/prismaNamespace.js";

export const buildCashRegisterUpdate = (
  paymentMethod: PaymentMethod,
  amount: Decimal,
) => {
  const data: any = {
    totalInflow: { increment: amount },
  };

  switch (paymentMethod) {
    case "CASH":
      data.totalCash = { increment: amount };
      break;
    case "PIX":
      data.totalPix = { increment: amount };
      break;
    case "DEBIT":
      data.totalDebit = { increment: amount };
      break;
    case "CREDIT":
      data.totalCredit = { increment: amount };
      break;
  }

  return data;
};
