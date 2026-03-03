// lib/calculator/deductions/care.ts

export function calcLongTermCare(healthInsurance: number): number {
  // 장기요양보험료 = 건강보험료 × 13.14047%
  // 1원 단위는 절사(1의 자리 버림)
  const v = Number.isFinite(healthInsurance) ? healthInsurance : 0;
  const raw = v * 0.1314047;
  return Math.max(0, Math.floor(raw / 10) * 10);
}