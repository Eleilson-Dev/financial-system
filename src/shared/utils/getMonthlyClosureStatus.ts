import dayjs from "dayjs";
import { getOpenCompetency } from "./getOpenCompetency.js";

export async function getMonthlyClosureStatus(companyId: string) {
  const { month, year } = await getOpenCompetency(companyId);

  const closeDeadline = dayjs().year(year).month(month).date(5).endOf("day");

  const today = dayjs();

  const diffDays = Math.floor(closeDeadline.diff(today, "day", true));
  const days = Math.abs(diffDays);
  const dayLabel = days === 1 ? "dia" : "dias";

  let status: "OPEN" | "DUE_SOON" | "OVERDUE";
  let message: string;

  if (diffDays < 0) {
    status = "OVERDUE";
    message = `Fechamento em atraso há ${Math.abs(diffDays)} ${dayLabel}.`;
  } else if (diffDays <= 3) {
    status = "DUE_SOON";
    message =
      diffDays === 0
        ? "Hoje é o último dia para fechar o mês."
        : `Faltam ${diffDays} dias para fechar o mês.`;
  } else {
    status = "OPEN";
    message = `Faltam ${diffDays} dias para fechar o mês.`;
  }

  return {
    month,
    year,
    closeDeadline: closeDeadline.toDate(),
    daysRemaining: diffDays,
    status,
    message,
  };
}
