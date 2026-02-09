import dayjs from "dayjs";

export function getCompetencyPeriod(month: number, year: number) {
  const start = dayjs(new Date(year, month - 1, 6)).startOf("day");

  const end = dayjs(new Date(year, month, 5)).endOf("day");

  return {
    start: start.toDate(),
    end: end.toDate(),
  };
}
