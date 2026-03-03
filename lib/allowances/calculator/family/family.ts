// lib/allowances/calculator/family/family.ts

export type FamilyAllowanceInput = {
  spouse: number;        // 0 또는 1
  children: number;      // 자녀 수
  dependents: number;    // 배우자/자녀 제외 부양가족 수
};

/**
 * 가족수당 계산 (월 기준)
 *
 * 규정
 * - 배우자: 40,000원
 * - 자녀
 *   1명: 50,000원
 *   2명: 80,000원
 *   3명 이상: 120,000원
 * - 배우자·자녀 제외 부양가족: 1명당 20,000원
 */
export function calcFamilyAllowance({
  spouse,
  children,
  dependents,
}: FamilyAllowanceInput): number {
  // 배우자
  const spouseAmount = spouse === 1 ? 40_000 : 0;

  // 자녀 (구간별 총액)
  let childrenAmount = 0;
  if (children === 1) childrenAmount = 50_000;
  else if (children === 2) childrenAmount = 80_000;
  else if (children >= 3) childrenAmount = 120_000;

  // 기타 부양가족
  const dependentsAmount = Math.max(0, dependents) * 20_000;

  return spouseAmount + childrenAmount + dependentsAmount;
}