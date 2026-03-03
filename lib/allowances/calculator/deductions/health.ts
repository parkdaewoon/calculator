// lib/calculator/deductions/health.ts

export function calcHealthInsurance(bosuMonthly: number): number {
  // 건강보험료 = 보수월액 × 3.595%
  // 1원 단위는 절사(1의 자리 버림)
  const v = Number.isFinite(bosuMonthly) ? bosuMonthly : 0;
  const raw = v * 0.03595;
  return Math.max(0, Math.floor(raw / 10) * 10);
}
