// lib/calculator/deductions/health.ts

export function calcHealthInsurance(bosuMonthly: number): number {
  // 건강보험료 = 보수월액 × 3.545%
  const v = Number.isFinite(bosuMonthly) ? bosuMonthly : 0;
  return Math.max(0, Math.floor(v * 0.03545));
}