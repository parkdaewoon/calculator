import { lookupIncomeTax2024 } from "./lookup";

export type FamilyInputs = {
  spouse: number;
  children: number;
  dependents: number;
  childrenAge8to20?: number;
};

export type BonusInputs = {
  /**
   * 정근수당 "1회분" (원)
   * - 연 1회분 금액(세전, 과세 기준)
   */
  jeonggeunOnce?: number;

  /**
   * 명절휴가비 "1회분" (원)
   * - 명절 1회분 금액(세전, 과세 기준)
   * - ⚠️ 여기서는 '명절1'만 반영 (명절2 곱하기 없음)
   */
  holidayOnce?: number;

  /** 월 환산 분모 (요청: 6 고정) */
  prorationDivisor?: 6;
};

export type TaxInputs = {
  /** Monthly gross pay (원): 기본급 + 과세수당 + (지급월이면 정근/명절 전액 포함될 수 있음) */
  monthlyGrossPay: number;

  /**
   * Monthly tax-free total (원)
   * ✅ 정액급식비(20만 한도)도 여기로 넣어서 과세에서 제외
   */
  monthlyTaxFree: number;

  /** Monthly scholarship excluded from table (원). Default 0. */
  monthlyScholarship?: number;

  /** Family inputs used to determine deduction-eligible family count. */
  family: FamilyInputs;

  /**
   * ✅ 정근/명절 "연 1회분" 입력 (세금 계산에서 매달 1/6로 반영)
   * - (정근 1회 + 명절 1회) / 6
   */
  bonuses?: BonusInputs;

  /**
   * ✅ 이번 달에 "실제로 지급된" 정근수당 전액(원)
   * - 지급월: 전액 입력
   * - 미지급월: 0
   * - monthlyGrossPay에 포함되어 있다면, 세금 계산에서는 전액을 빼고 1/6만 더하기 위해 필요
   */
  jeonggeunPaidThisMonth?: number;

  /**
   * ✅ 이번 달에 "실제로 지급된" 명절휴가비 전액(원)
   * - 지급월: 전액 입력
   * - 미지급월: 0
   */
  holidayPaidThisMonth?: number;
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
  return 1 + spouse + children + dependents;
}

/**
 * ✅ 정근수당/명절휴가비 월 환산 가산액(세금용)
 * - (정근 1회 + 명절 1회) / 6
 */
export function calcMonthlyBonusProration(bonuses?: BonusInputs): number {
  if (!bonuses) return 0;

  const jeonggeunOnce = Math.max(0, Math.floor(bonuses.jeonggeunOnce || 0));
  const holidayOnce = Math.max(0, Math.floor(bonuses.holidayOnce || 0));
  const divisor = 6; // 요청대로 고정

  const lumpSum = jeonggeunOnce + holidayOnce;
  return Math.floor(lumpSum / divisor);
}

/** 간이세액표 기준 소득세(국세) */
export function calcIncomeTaxMonthly(params: TaxInputs): {
  taxableMonthlyPay: number;
  familyCount: number;
  incomeTax: number;
} {
  const scholarship = Math.max(0, Math.floor(params.monthlyScholarship || 0));
  const bonusProration = calcMonthlyBonusProration(params.bonuses);

  const jeonggeunPaid = Math.max(0, Math.floor(params.jeonggeunPaidThisMonth || 0));
  const holidayPaid = Math.max(0, Math.floor(params.holidayPaidThisMonth || 0));

  /**
   * ✅ 세금용 과세대상급여
   * 1) 이번달 실지급 총액에서 비과세/장학금 제외
   * 2) 지급월에 들어있는 정근/명절 "전액"을 빼고
   * 3) 대신 (정근1회+명절1회)/6 을 매달 더함
   */
  const taxableMonthlyPay = Math.max(
    0,
    Math.floor(
      params.monthlyGrossPay
        - params.monthlyTaxFree
        - scholarship
        - jeonggeunPaid
        - holidayPaid
        + bonusProration
    )
  );

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
 * 실무에서 흔한 방식: 10원 단위 절사
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