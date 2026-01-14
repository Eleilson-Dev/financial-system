import dayjs from "dayjs";

export function getCurrentCompetency(date = dayjs()) {
  // antes do dia 6 → ainda é o mês anterior
  if (date.date() <= 5) {
    const prev = date.subtract(1, "month");

    return {
      month: prev.month() + 1,
      year: prev.year(),
    };
  }

  // do dia 6 em diante → mês atual
  return {
    month: date.month() + 1,
    year: date.year(),
  };
}
