import { prisma } from "../../config/database.js";

export async function getOpenCompetency(companyId: string) {
  const lastClosed = await prisma.monthlyClosure.findFirst({
    where: { companyId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  // Caso 1: nunca fechou nada
  if (!lastClosed) {
    const oldestRecord = await prisma.cashRegisterEntry.findFirst({
      where: { cashRegister: { companyId } },
      orderBy: [{ referenceYear: "asc" }, { referenceMonth: "asc" }],
    });

    if (!oldestRecord) {
      throw new Error("No records found for open competency.");
    }

    return {
      month: oldestRecord.referenceMonth,
      year: oldestRecord.referenceYear,
    };
  }

  // Caso 2: já existe fechamento
  const next = {
    month: lastClosed.month + 1,
    year: lastClosed.year,
  };

  if (next.month > 12) {
    next.month = 1;
    next.year += 1;
  }

  return next;
}
