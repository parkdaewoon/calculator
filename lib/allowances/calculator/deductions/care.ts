// lib/calculator/deductions/care.ts

export function calcLongTermCare(healthInsurance: number): number {
  // 장기요양보험료 = 건강보험료 × 12.80959%
  const v = Number.isFinite(healthInsurance) ? healthInsurance : 0;
  return Math.max(0, Math.floor(v * 0.1280959));
}