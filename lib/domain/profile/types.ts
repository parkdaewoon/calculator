export type MoneyMode = "auto" | "manual";

export type PromotionEntry = {
  series: string;
  columnKey: string;
  years: number;
};
export type PensionableAutoFlags = {
  /** 대우공무원 여부 */
  isPwuEligible?: boolean;

  /** 관리업무수당 지급대상 여부 */
  isManagementEligible?: boolean;

  /**
   * 관리업무수당 지급률
   * - 일반/별정/대부분: 0.09
   * - 연구/지도직, 일부 교육공무원: 0.078
   */
  managementRate?: 0.078 | 0.09;

  /** 직급보조비 수동 보정값(기본 자동표보다 우선) */
  overridePositionAllowance?: number;

  /** 파견 등 추가 직급보조비 */
  extraPositionAllowance?: number;
};

export type PensionableMonthlyInputs = {
  /** 특수지근무수당 */
  specialArea?: number;

  /** 특수근무수당 */
  specialDuty?: number;

  /** 위험근무수당 */
  dangerousDuty?: number;

  /** 그 외 기준소득월액 포함대상 과세 월수당 */
  taxableEtcIncluded?: number;

  /**
   * 평균대체분을 월 기준으로 직접 넣고 싶을 때 사용
   * (성과/초과/야간/휴일/연가보상비 평균대체값)
   */
  averageReplacementMonthly?: number;
};

export type PensionableExcludedAnnualInputs = {
  performanceBonus?: number;
  jobPerformancePay?: number;
  performanceAnnualSalary?: number;
  bonus?: number;
  overtime?: number;
  night?: number;
  holiday?: number;
  leaveCompensation?: number;
};

export type BaseProfile = {
  version: 1;

  series: string;
  columnKey: string;
  step: number;

  startDate: string;
  retireDate: string;

  birthDate?: string;
  pensionStartAge?: number;

  startSeries?: string;
  startColumnKey?: string;
  startStep?: number;

  currentSeries?: string;
  currentColumnKey?: string;
  currentStep?: number;

  promotions?: PromotionEntry[];

  incomeMode?: MoneyMode;
  avgIncomeMonthly?: number;

  militaryServiceYears?: number; // ✅ 추가
  leaveOfAbsenceYears?: number;
  pensionableAutoFlags?: PensionableAutoFlags;
  pensionableMonthlyInputs?: PensionableMonthlyInputs;
  pensionableExcludedAnnualInputs?: PensionableExcludedAnnualInputs;
  calculatedTotalYears?: number;
  calculatedPensionRecognizedYears?: number;
  calculatedPensionRate?: number;
  calculatedAverageMonthlyBase?: number;
};