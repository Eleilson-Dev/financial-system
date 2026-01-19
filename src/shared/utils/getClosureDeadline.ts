import dayjs from "dayjs";

export const getClosureDeadline = (month: number, year: number) => {
  return dayjs()
    .year(year)
    .month(month - 1) // mês de competência
    .add(1, "month") // mês seguinte
    .date(5)
    .endOf("day");
};
