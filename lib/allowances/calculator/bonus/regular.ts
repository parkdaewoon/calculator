/**
 * 정근수당 지급률 (근무연수 기준)
 *
 * 2년 미만 : 10%
 * 5년 미만 : 20%
 * 6년 미만 : 25%
 * 7년 미만 : 30%
 * 8년 미만 : 35%
 * 9년 미만 : 40%
 * 10년 미만 : 45%
 * 10년 이상 : 50%
 */
export function getRegularBonusRate(years: number): number {
  if (years < 2) return 0.10;
  if (years < 5) return 0.20;
  if (years < 6) return 0.25;
  if (years < 7) return 0.30;
  if (years < 8) return 0.35;
  if (years < 9) return 0.40;
  if (years < 10) return 0.45;
  return 0.50;
}

/**
 * 정근수당 계산 (1회 지급액)
 *
 * - 1월 / 7월 지급 기준
 * - 호봉과 무관
 * - 근무연수만 반영
 */
export function calcRegularBonus(
  basePay: number,
  yearsOfService: number
): number {
  if (!basePay) return 0;

  const rate = getRegularBonusRate(yearsOfService);
  return Math.floor(basePay * rate);
}