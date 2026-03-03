// lib/allowances/calculator/bonus/pwu.ts

import { getPay, type PayTableId } from "@/lib/payTables";

type SeriesKey = PayTableId;

export type PwuParams = {
  series: SeriesKey;
  grade: number;
  step: number;
  basePay: number;
  isEssentialPractical?: boolean; // 필수실무요원/관 (선택)
};

/**
 * 대우공무원수당
 *
 * 규정
 * 1. 월봉급액의 4.1%
 * 2. 단, (월봉급 + 대우수당) > 상위직급 월봉급액이면
 *    → 상위직급 월봉급액 - 현재 월봉급액 (차액만 지급)
 * 3. 필수실무요원/관은 월 100,000원 가산 (옵션)
 */
export function calcPwuAllowance(params: PwuParams): number {
  const { series, grade, step, basePay, isEssentialPractical } = params;

  if (!basePay || grade <= 1) return 0;

  // 1) 기본 4.1%
  const raw = Math.floor(basePay * 0.041);

  // 2) 상위직급 봉급 조회
  const nextGrade = grade - 1;
  const nextColumnKey = `g${nextGrade}`;
  const nextPay = getPay(series, nextColumnKey, step);

  let result = raw;

  if (typeof nextPay === "number" && nextPay > basePay) {
    const diff = nextPay - basePay;
    result = Math.min(raw, diff);
  }

  // 3) 필수실무요원 가산 (선택)
  if (isEssentialPractical) {
    result += 100_000;
  }

  return Math.floor(result);
}