// lib/tax/earnedIncomeTax.ts
import {
  EARNED_INCOME_TAX_TABLE_2026,
  type EarnedIncomeTaxRow,
} from "./earnedIncomeTable2026";

export type LookupOptions = {
  /**
   * true면 표의 범위를 벗어나도(최저 미만/최고 초과) 첫/마지막 행으로 클램프해서 계산.
   * false면 범위 밖은 0을 반환.
   */
  clampToBounds?: boolean;

  /**
   * 공제대상가족 수가 11명을 초과하는 경우(비고 4) 규칙 적용 여부.
   * - 기본 true
   */
  applyOver11Rule?: boolean;
};

/** (원) → (천원) 변환 (간이세액표 구간 단위) */
export function wonToK(won: number): number {
  if (!Number.isFinite(won) || won <= 0) return 0;
  return Math.floor(won / 1000);
}

/** 표의 구간 매칭: 기본 [minK, maxK) */
export function findEarnedIncomeTaxRow(
  k: number,
  table: EarnedIncomeTaxRow[] = EARNED_INCOME_TAX_TABLE_2026,
  opts: LookupOptions = {}
): EarnedIncomeTaxRow | null {
  if (!Number.isFinite(k) || k <= 0) return null;
  if (!table?.length) return null;

  // 일반 구간
  for (const row of table) {
    if (k >= row.minK && k < row.maxK) return row;
  }

  if (opts.clampToBounds) {
    // 최저 미만 → 첫 행
    const first = table[0];
    if (k < first.minK) return first;

    // 최고 초과 → 마지막 행
    const last = table[table.length - 1];
    if (k >= last.maxK) return last;
  }

  return null;
}

function clampIndex01to10(idx: number) {
  if (!Number.isFinite(idx)) return 0;
  if (idx < 0) return 0;
  if (idx > 10) return 10;
  return idx;
}

function getTaxAt(row: EarnedIncomeTaxRow, familyCount: number) {
  const idx = clampIndex01to10(Math.floor(familyCount) - 1);
  const v = row.taxByFamily1to11?.[idx] ?? 0;
  if (!Number.isFinite(v)) return 0;
  return Math.floor(v);
}

/**
 * 2026 근로소득 간이세액표(조견표) 조회 (소득세, 원 단위)
 * @param taxableWageWon 과세대상급여(원) = 월급여액 - 비과세 - 학자금(비과세) 등
 * @param familyCount 공제대상가족수(본인 포함). 1 이상
 */
export function lookupIncomeTax2026(
  taxableWageWon: number,
  familyCount: number,
  opts: LookupOptions = { clampToBounds: true, applyOver11Rule: true }
): number {
  const k = wonToK(taxableWageWon);
  const fam = Math.max(1, Math.floor(familyCount || 1));

  const row = findEarnedIncomeTaxRow(k, EARNED_INCOME_TAX_TABLE_2026, opts);
  if (!row) return 0;

  // 비고 4: 공제대상가족 수가 11명 초과 시
  if (opts.applyOver11Rule !== false && fam > 11) {
    const tax10 = getTaxAt(row, 10);
    const tax11 = getTaxAt(row, 11);
    const over = fam - 11;
    const adjusted = tax11 - (tax10 - tax11) * over;
    return Math.max(0, Math.floor(adjusted));
  }

  return getTaxAt(row, Math.min(fam, 11));
}

export function getEarnedIncomeWithholdingTaxWon(
  monthlyTaxablePayWon: number,
  familyCount: number
): number {
  return lookupIncomeTax2026(monthlyTaxablePayWon, familyCount, {
    clampToBounds: true,
    applyOver11Rule: true,
  });
}