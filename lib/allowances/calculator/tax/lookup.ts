import { EARNED_INCOME_TAX_TABLE_2024 } from "./earnedIncomeTable2024";

export type LookupOptions = {
  /** Clamp k to table bounds instead of returning 0 when out of range. Default: true */
  clampToBounds?: boolean;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Lookup monthly income tax (national) from NTS earned income simplified withholding table.
 *
 * @param taxableMonthlyPay Monthly pay excluding tax-free amounts and scholarships (원).
 * @param familyCount Deduction-eligible family count including 본인=1.
 * @returns income tax in KRW (원)
 */
export function lookupIncomeTax2024(
  taxableMonthlyPay: number,
  familyCount: number,
  options: LookupOptions = {}
): number {
  const k = Math.floor(taxableMonthlyPay / 1000); // 천원 단위
  if (EARNED_INCOME_TAX_TABLE_2024.length === 0) return 0;

  const clampToBounds = options.clampToBounds ?? true;

  const minK = EARNED_INCOME_TAX_TABLE_2024[0].minK;
  const maxK = EARNED_INCOME_TAX_TABLE_2024[EARNED_INCOME_TAX_TABLE_2024.length - 1].maxK;

  let kk = k;
  if (kk < minK || kk >= maxK) {
    if (!clampToBounds) return 0;
    kk = clamp(kk, minK, maxK - 1);
  }

  // binary search by minK
  let lo = 0;
  let hi = EARNED_INCOME_TAX_TABLE_2024.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const row = EARNED_INCOME_TAX_TABLE_2024[mid];
    if (kk < row.minK) hi = mid - 1;
    else if (kk >= row.maxK) lo = mid + 1;
    else {
      const fc = familyCount <= 1 ? 1 : familyCount;
      if (fc <= 11) {
        return row.taxByFamily1to11[fc - 1] ?? 0;
      }
      // familyCount > 11: adjust using rule based on difference between 10 and 11
      const tax10 = row.taxByFamily1to11[9] ?? 0;
      const tax11 = row.taxByFamily1to11[10] ?? 0;
      const extra = fc - 11;
      const adjusted = tax11 - (tax10 - tax11) * extra;
      return Math.max(0, Math.round(adjusted)); // keep integer
    }
  }

  return 0;
}
