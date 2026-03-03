// lib/allowances/calculator/special-duty/risk.ts

export type RiskDutyType = "NONE" | "A" | "B" | "C";

/**
 * 위험근무수당 (월 기준)
 * 갑(A): 60,000원
 * 을(B): 50,000원
 * 병(C): 40,000원
 */
export function calcRiskAllowance(type: RiskDutyType): number {
  switch (type) {
    case "A":
      return 60_000;
    case "B":
      return 50_000;
    case "C":
      return 40_000;
    default:
      return 0;
  }
}