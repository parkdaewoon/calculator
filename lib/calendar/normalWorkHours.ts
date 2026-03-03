// lib/calendar/normalWorkHours.ts

type YMD = `${number}-${string}-${string}`;

/**
 * 일반근무자 기준 월 근무시간 계산
 * - 월~금: 하루 8시간
 * - 공휴일(평일에 해당하는 공휴일)은 제외
 *
 * @param year  예: 2026
 * @param month 1~12
 * @param holidayYmds 공휴일 YYYY-MM-DD 배열 (예: ["2026-03-01", ...])
 */
export function calcNormalWorkHoursOfMonth(
  year: number,
  month: number,
  holidayYmds: YMD[] = []
) {
  const holidaySet = new Set(holidayYmds);

  // JS Date: month는 0~11
  const first = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0).getDate(); // 그 달의 마지막 일

  let workDays = 0;

  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month - 1, d);
    const day = date.getDay(); // 0=일,1=월,...,6=토

    // 주말 제외
    if (day === 0 || day === 6) continue;

    // YYYY-MM-DD
    const y = year;
    const m = String(month).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    const ymd = `${y}-${m}-${dd}` as YMD;

    // 공휴일(평일에 걸리면) 제외
    if (holidaySet.has(ymd)) continue;

    workDays++;
  }

  return workDays * 8;
}