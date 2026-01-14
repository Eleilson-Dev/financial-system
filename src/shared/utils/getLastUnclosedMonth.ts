import { prisma } from "../../config/database.js";

export const getLastUnclosedMonth = async (companyId: string) => {
  const lastClosed = await prisma.monthlyClosure.findFirst({
    where: { companyId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  let month: number;
  let year: number;

  if (!lastClosed) {
    // Nenhum fechamento feito ainda → pegar mês corrente
    const now = new Date();
    month = now.getMonth() + 1;
    year = now.getFullYear();
  } else {
    // Próximo mês após o último fechamento
    if (lastClosed.month === 12) {
      month = 1;
      year = lastClosed.year + 1;
    } else {
      month = lastClosed.month + 1;
      year = lastClosed.year;
    }
  }

  return { month, year };
};
