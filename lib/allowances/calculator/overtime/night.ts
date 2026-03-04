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
  if (!grade) return 0.55;
  return grade >= 8 ? 0.60 : 0.55;
}

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
  const wageStandard = base10 * rate;

  const rawPerHour = (wageStandard / 209) * 0.5;   // 내부 계산(소수 가능)
  const total = Math.floor(rawPerHour * hours);     // 지급: 총액 절사(원 단위)

  return total;
}

/** (선택) 화면 표시용: 시간당 단가 */
export function calcNightAllowancePerHourDisplay(args: {
  series: PayTableId;
  columnKey: string;
}): number {
  const { series, columnKey } = args;
  const pay10 = getPay(series, columnKey, 10);
  const base10 = typeof pay10 === "number" ? pay10 : 0;
  if (!base10) return 0;

  const rate = getWageStandardRate(series, columnKey);
  const wageStandard = base10 * rate;
  const rawPerHour = (wageStandard / 209) * 0.5;

  return Math.round(rawPerHour); // 표시: 반올림해서 4,038원처럼
}