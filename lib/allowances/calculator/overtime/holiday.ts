import { getPay, type PayTableId } from "@/lib/payTables";
import { getOvertimeBaseRate } from "./index"; // 같은 폴더 index.ts에 이미 있음

/**
 * 휴일근무수당 (일수 기준)
 * - 봉급기준액 = (해당 급수 10호봉 봉급) * (55% 또는 60%)
 * - 1일 = 봉급기준액 / 26
 * - 지급 = 1일 * 150% * days
 */
export function calcHolidayAllowance(args: {
  series: PayTableId;
  columnKey: string;
  days: number; // ✅ 일수
}): number {
  const { series, columnKey, days } = args;
  if (!days || days <= 0) return 0;

  const pay10 = getPay(series, columnKey, 10);
  const base10 = typeof pay10 === "number" ? pay10 : 0;
  if (!base10) return 0;

  const rate = getOvertimeBaseRate(series, columnKey);
  const wageStandard = base10 * rate; // 봉급기준액

  return Math.floor((wageStandard / 26) * 1.5 * days);
}