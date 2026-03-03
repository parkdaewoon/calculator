// lib/calculator/deductions/pension.ts

export function calcPensionContribution(bosuMonthly: number): number {
  // 기준소득월액(사이트 규칙) = 보수월액 × 1.1
  // 일반기여금 = 기준소득월액 × 9%
  const v = Number.isFinite(bosuMonthly) ? bosuMonthly : 0;
  const standard = v * 1.1;
  return Math.max(0, Math.floor(standard * 0.09));
}