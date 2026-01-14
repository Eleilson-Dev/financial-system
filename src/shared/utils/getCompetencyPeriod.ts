import dayjs from "dayjs";

export function getCompetencyPeriod(month: number, year: number) {
  const start = dayjs()
    .year(year)
    .month(month - 1)
    .date(6)
    .startOf("day");

  const end = start.add(1, "month").date(5).endOf("day");

  return {
    start: start.toDate(),
    end: end.toDate(),
  };
}
