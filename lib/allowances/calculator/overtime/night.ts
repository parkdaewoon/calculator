// lib/allowances/calculator/overtime/night.ts
import { getPay, type PayTableId } from "@/lib/payTables";

function inferGradeFromColumnKey(columnKey: string): number | null {
  const m = String(columnKey).match(/\d+/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) && n >= 1 && n <= 9 ? n : null;
}

/**
 * 봉급기준액 비율(기본)
 * - 8급 및 8급 상당 이하: 60%
 * - 그 외: 55%
 */
export function getWageStandardRate(series: PayTableId, columnKey: string): number {
  const grade = inferGradeFromColumnKey(columnKey);
  if (!grade) return 0.55;     // 못 뽑으면 기본 55%
  return grade >= 8 ? 0.60 : 0.55;
}

/**
 * 야간수당(시간당)
 * - 야간수당 = (봉급기준액 / 209) * 0.5 * hours
 * - 봉급기준액 = (해당 직급 10호봉 봉급) * (55% 또는 60%)
 */
export function calcNightAllowance(args: {
  series: PayTableId;
  columnKey: string;
  hours: number;
}): number {
  const { series, columnKey, hours } = args;
  if (!hours || hours <= 0) return 0;

  const pay10 = getPay(series, columnKey, 10);
  const base10 = typeof pay10 === "number" ? pay10 : 0;
  if (!base10) return 0;

  const rate = getWageStandardRate(series, columnKey);
  const wageStandard = base10 * rate; // 봉급기준액
  const hourly = wageStandard / 209;  // 209분의 1

  return Math.floor(hourly * 0.5 * hours);
}