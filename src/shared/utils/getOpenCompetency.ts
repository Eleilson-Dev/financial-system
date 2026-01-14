import dayjs from "dayjs";
import { prisma } from "../../config/database.js";

export async function getOpenCompetency(companyId: string) {
  const today = dayjs();

  // competência natural baseada na data
  let month = today.date() <= 5 ? today.month() : today.month() + 1;
  let year = today.year();

  if (month === 0) {
    month = 12;
    year -= 1;
  }

  // verifica se já foi fechado
  const alreadyClosed = await prisma.monthlyClosure.findFirst({
    where: {
      companyId,
      month,
      year,
    },
  });

  // se já fechou, empurra para o próximo mês
  if (alreadyClosed) {
    month += 1;

    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return { month, year };
}
