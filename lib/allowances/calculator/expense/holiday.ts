// lib/allowances/calculator/expense/holiday.ts

export type HolidayBonusInput = {
  /** 지급기준일 현재 월봉급액 */
  basePay: number;
};

/**
 * 명절휴가비 (1회 지급)
 * - 지급기준일 현재 월봉급액의 60%
 */
export function calcHolidayBonusOnce({ basePay }: HolidayBonusInput): number {
  const bp = Number.isFinite(basePay) ? basePay : 0;
  return Math.floor(bp * 0.6);
}