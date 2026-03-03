// lib/calculator/deductions/pension.ts

export function calcPensionContribution(standardMonthly: number): number {
  // 일반기여금 = 기준소득월액 × 9%
  // 1원 단위는 절사(1의 자리 버림)
  const v = Number.isFinite(standardMonthly) ? standardMonthly : 0;
  const raw = v * 0.09;
  return Math.max(0, Math.floor(raw / 10) * 10);
}
