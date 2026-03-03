import { lookupIncomeTax2024 } from "./lookup";

export type FamilyInputs = {
  /** 0 or 1 */
  spouse: number;
  /** number of children (deduction-eligible) */
  children: number;
  /** other dependents (deduction-eligible) */
  dependents: number;
  /**
   * Optional: number of children aged 8~20 (for additional withholding reduction rule in the table notes).
   * If you don't model ages, set 0.
   */
  childrenAge8to20?: number;
};

export type TaxInputs = {
  /** Monthly gross pay (원): 기본급 + 과세수당 + ... */
  monthlyGrossPay: number;
  /** Monthly tax-free total (원): 식대(20만 한도) + 출장여비 + 자녀보육수당(비과세) 등 */
  monthlyTaxFree: number;
  /** Monthly scholarship excluded from table (원). Default 0. */
  monthlyScholarship?: number;
  /** Family inputs used to determine deduction-eligible family count. */
  family: FamilyInputs;
};

export type TaxResult = {
  taxableMonthlyPay: number;
  familyCount: number;
  incomeTax: number;
  localIncomeTax: number;
};

/** 8~20세 자녀에 대한 원천징수 세액 추가 공제(간이세액표 비고) */
export function calcChildWithholdingReduction(childrenAge8to20: number): number {
  const n = Math.max(0, Math.floor(childrenAge8to20 || 0));
  if (n <= 0) return 0;
  if (n === 1) return 12_500;
  if (n === 2) return 29_160;
  return 29_160 + (n - 2) * 25_000;
}

/** 공제대상가족수(본인 포함) */
export function calcFamilyCount(family: FamilyInputs): number {
  const spouse = family.spouse ? 1 : 0;
  const children = Math.max(0, Math.floor(family.children || 0));
  const dependents = Math.max(0, Math.floor(family.dependents || 0));
  return 1 + spouse + children + dependents; // 본인 포함
}

/** 간이세액표 기준 소득세(국세) */
export function calcIncomeTaxMonthly(params: TaxInputs): { taxableMonthlyPay: number; familyCount: number; incomeTax: number } {
  const scholarship = Math.max(0, Math.floor(params.monthlyScholarship || 0));
  const taxableMonthlyPay = Math.max(0, Math.floor(params.monthlyGrossPay - params.monthlyTaxFree - scholarship));
  const familyCount = calcFamilyCount(params.family);

  const base = lookupIncomeTax2024(taxableMonthlyPay, familyCount, { clampToBounds: true });

  const childReduction = calcChildWithholdingReduction(params.family.childrenAge8to20 || 0);

  return {
    taxableMonthlyPay,
    familyCount,
    incomeTax: Math.max(0, base - childReduction),
  };
}

/**
 * 지방소득세 = 소득세의 10%
 * 실무에서 흔한 방식: 10원 단위 절사 (예: 4,906원 -> 4,900원)
 */
export function calcLocalIncomeTaxMonthly(incomeTax: number): number {
  const raw = Math.floor(incomeTax * 0.1);
  return Math.floor(raw / 10) * 10;
}

export function calcTaxesMonthly(params: TaxInputs): TaxResult {
  const { taxableMonthlyPay, familyCount, incomeTax } = calcIncomeTaxMonthly(params);
  const localIncomeTax = calcLocalIncomeTaxMonthly(incomeTax);
  return { taxableMonthlyPay, familyCount, incomeTax, localIncomeTax };
}
