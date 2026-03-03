import type { YYYYMM, YYYYMMDD } from "./types";

export function pad2(n: number): `${number}${number}` {
  // 00~99 형태 문자열을 반환한다고 "의도"를 타입으로 표현 (엄격하진 않지만 도움됨)
  return (n < 10 ? `0${n}` : `${n}`) as `${number}${number}`;
}

export function isSameDate(a: YYYYMMDD, b: YYYYMMDD) {
  return a === b;
}

export function getToday(): YYYYMMDD {
  const d = new Date();
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}` as YYYYMMDD;
}

export function toMonthKey(date: YYYYMMDD): YYYYMM {
  return date.slice(0, 7) as YYYYMM;
}

export function parseMonth(month: YYYYMM) {
  const [y, m] = month.split("-").map((x) => Number(x));
  return { y, m }; // m: 1..12
}

/** YYYY-MM -> "YYYY년 M월" */
export function formatMonthLabel(month: YYYYMM) {
  const [y, m] = month.split("-");
  return `${y}년 ${Number(m)}월`;
}

export function addMonths(month: YYYYMM, delta: number): YYYYMM {
  const { y, m } = parseMonth(month);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}` as YYYYMM;
}

export function dateToYmd(d: Date): YYYYMMDD {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` as YYYYMMDD;
}

/** inclusive range of a month: start/end as YYYY-MM-DD */
export function getMonthRange(month: YYYYMM): { start: YYYYMMDD; end: YYYYMMDD } {
  const { y, m } = parseMonth(month);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0); // last day of month
  return { start: dateToYmd(start), end: dateToYmd(end) };
}

/** Build a 6-week grid starting Sunday, ending Saturday (42 cells). */
export function buildMonthGrid(month: YYYYMM) {
  const { y, m } = parseMonth(month);
  const first = new Date(y, m - 1, 1);
  const firstDow = first.getDay(); // 0..6
  const gridStart = new Date(y, m - 1, 1 - firstDow);

  const days: Array<{ date: YYYYMMDD; day: number; inMonth: boolean; dow: number }> = [];

  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const date = dateToYmd(d);

    days.push({
      date,
      day: d.getDate(),
      inMonth: d.getMonth() === m - 1,
      dow: d.getDay(),
    });
  }
  return days;
}

/** Returns true if the date is weekend (Sat/Sun) */
export function isWeekend(date: YYYYMMDD) {
  const d = new Date(date + "T00:00:00");
  const dow = d.getDay();
  return dow === 0 || dow === 6;
}

/** Inclusive iterate dates [start..end] */
export function* iterateDates(start: YYYYMMDD, end: YYYYMMDD) {
  let d = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");

  while (d <= e) {
    yield dateToYmd(d);
    d.setDate(d.getDate() + 1);
  }
}