// lib/allowances/calculator/bonus/regularAdd.ts

export type RegularAddMode = "MONTHLY" | "PAYMENT";

/**
 * 정근수당가산금 (월 지급액)
 * 규칙(네가 준 기준):
 * - 5년 미만: 공무원/군인 3만원
 * - 5~10년 미만:
 *   - 공무원: 5만원
 *   - 군인: 5~7 미만 4만원, 7~10 미만 5만원
 * - 10~15 미만: 둘다 6만원
 * - 15~20 미만: 8만원
 * - 20년 이상: 10만원 + (20~25 미만 1만원, 25년 이상 3만원) 가산
 */
export function getRegularAddAmountMonthly(
  yearsOfService: number,
  isMilitary: boolean
): number {
  if (!Number.isFinite(yearsOfService) || yearsOfService < 0) return 0;

  let base = 0;

  if (yearsOfService < 5) {
    base = 30_000;
  } else if (yearsOfService < 10) {
    if (!isMilitary) {
      base = 50_000; // 공무원 5~10 미만
    } else {
      base = yearsOfService < 7 ? 40_000 : 50_000; // 군인 5~7, 7~10
    }
  } else if (yearsOfService < 15) {
    base = 60_000;
  } else if (yearsOfService < 20) {
    base = 80_000;
  } else {
    base = 100_000; // 20년 이상 기본 10만원

    // 20년 이상 가산
    if (yearsOfService < 25) base += 10_000; // 20~25 미만 +1만원
    else base += 30_000; // 25년 이상 +3만원
  }

  return base;
}

/**
 * 정근수당가산금 계산
 * - 별표가 "월 지급액"이므로 MONTHLY는 그대로 반환
 * - PAYMENT는 개념이 애매해서(월 지급 기준) 호환용으로 MONTHLY와 동일 처리
 */
export function calcRegularAdd(
  yearsOfService: number,
  mode: RegularAddMode = "MONTHLY",
  isMilitary: boolean = false
): number {
  const monthly = getRegularAddAmountMonthly(yearsOfService, isMilitary);
  return monthly; // PAYMENT도 동일 처리
}