// lib/allowances/calculator/expense/leave.ts

export type LeaveCompInput = {
  /** 현재 월봉급액 */
  basePay: number;

  /** 연가보상일수 */
  days: number;
};

/**
 * 연가보상비 (1회 지급)
 *
 * 계산식:
 * 월봉급액 × 86% × (1/30) × 연가보상일수
 */
export function calcLeaveCompensation({
  basePay,
  days,
}: LeaveCompInput): number {
  const bp = Number.isFinite(basePay) ? basePay : 0;
  const d = Number.isFinite(days) ? days : 0;

  if (bp <= 0 || d <= 0) return 0;

  const dailyBase = (bp * 0.86) / 30;

  return Math.floor(dailyBase * d);
}