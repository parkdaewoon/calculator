import type { BaseProfile } from "@/lib/domain/profile/types";
import { getPay, PAY_TABLES, type PayTableId } from "@/lib/payTables";

export type PensionableAllowanceBreakdown = {
  basePay: number;
  positionAllowance: number;
  regularBonusMonthly: number;
  regularAdd: number;
  pwuAllowance: number;
  managementAllowance: number;
  specialAreaAllowance: number;
  specialDutyAllowance: number;
  dangerousDutyAllowance: number;
  taxableEtcIncluded: number;
  holidayBonusMonthly: number;
  averageReplacementMonthly: number;
  autoIncludedTotal: number;
  estimatedCurrentPensionableMonthly: number;
};
export type PensionableSnapshotParams = {
  profile: BaseProfile;
  series: PayTableId;
  columnKey: string;
  step: number;
  serviceYears: number;
  includeAverageReplacementMonthly?: boolean;
};
function n(v: unknown, fallback = 0): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

function clampInt(v: number, min: number, max: number): number {
  const x = Math.trunc(Number.isFinite(v) ? v : min);
  return Math.min(max, Math.max(min, x));
}

function diffYears(start?: string, end?: string): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
  if (e < s) return 0;
  return (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24 * 365.2425);
}

function getTodayYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentSeries(profile: BaseProfile): PayTableId {
  return (profile.currentSeries ?? profile.series) as PayTableId;
}

function getCurrentColumnKey(profile: BaseProfile): string {
  return profile.currentColumnKey ?? profile.columnKey;
}

function getCurrentStep(profile: BaseProfile): number {
  return clampInt(profile.currentStep ?? profile.step, 1, 32);
}

export function getBasePay(profile: BaseProfile): number {
  return (
    getPay(
      getCurrentSeries(profile),
      getCurrentColumnKey(profile),
      getCurrentStep(profile)
    ) ?? 0
  );
}

function parseGradeNumber(columnKey?: string): number | null {
  const s = String(columnKey ?? "").trim().toLowerCase();

  const m1 = s.match(/^g(\d{1,2})$/);
  if (m1) return Number(m1[1]);

  const m2 = s.match(/(\d{1,2})/);
  if (m2) return Number(m2[1]);

  return null;
}

function getNextUpperColumnKey(
  series: PayTableId,
  columnKey: string
): string | null {
  const grade = parseGradeNumber(columnKey);
  if (!grade || grade <= 1) return null;

  const nextGrade = grade - 1;
  const guessed = `g${nextGrade}`;

  const columns = PAY_TABLES[series]?.columns ?? [];
  const exists = columns.some((c) => c.key === guessed);
  if (exists) return guessed;

  const hit = columns.find((c) => parseGradeNumber(c.key) === nextGrade);
  return hit?.key ?? null;
}

/**
 * 정근수당 지급률
 * - 2년 미만: 10%
 * - 5년 미만: 20%
 * - 6년 미만: 25%
 * - 7년 미만: 30%
 * - 8년 미만: 35%
 * - 9년 미만: 40%
 * - 10년 미만: 45%
 * - 10년 이상: 50%
 */
export function getRegularBonusRate(serviceYears: number): number {
  const y = Math.max(0, serviceYears);
  if (y < 2) return 0.10;
  if (y < 5) return 0.20;
  if (y < 6) return 0.25;
  if (y < 7) return 0.30;
  if (y < 8) return 0.35;
  if (y < 9) return 0.40;
  if (y < 10) return 0.45;
  return 0.50;
}

/**
 * 정근수당은 연 2회 지급이므로 월 환산
 * annual = basePay * rate * 2
 * monthly = annual / 12
 */
export function calcRegularBonusMonthly(
  basePay: number,
  serviceYears: number
): number {
  const rate = getRegularBonusRate(serviceYears);
  return Math.round((basePay * rate * 2) / 12);
}

/**
 * 정근수당 가산금(월)
 * - 5년 미만: 30,000
 * - 5년 이상 7년 미만: 40,000
 * - 7년 이상 10년 미만: 50,000
 * - 10년 이상 15년 미만: 60,000
 * - 15년 이상 20년 미만: 80,000
 * - 20년 이상: 100,000
 *   + 20~25년 미만: 10,000 추가
 *   + 25년 이상: 30,000 추가
 */
export function calcRegularAddMonthly(serviceYears: number): number {
  const y = Math.max(0, serviceYears);

  if (y < 5) return 30_000;
  if (y < 7) return 40_000;
  if (y < 10) return 50_000;
  if (y < 15) return 60_000;
  if (y < 20) return 80_000;
  if (y < 25) return 110_000;
  return 130_000;
}

/**
 * 대우공무원수당
 * - 월봉급액의 4.1%
 * - 단, 현재 봉급 + 대우수당이 상위직급 동일호봉 봉급을 초과하면 차액까지만
 */
export function calcPwuAllowanceMonthly(
  profile: BaseProfile,
  basePay: number
): number {
  const eligible = !!profile.pensionableAutoFlags?.isPwuEligible;
  if (!eligible) return 0;

  const raw = Math.round(basePay * 0.041);

  const series = getCurrentSeries(profile);
  const currentColumnKey = getCurrentColumnKey(profile);
  const currentStep = getCurrentStep(profile);

  const upperColumnKey = getNextUpperColumnKey(series, currentColumnKey);
  if (!upperColumnKey) return raw;

  const upperPay = getPay(series, upperColumnKey, currentStep) ?? 0;
  if (upperPay <= 0) return raw;

  const maxGap = Math.max(0, upperPay - basePay);
  return Math.min(raw, maxGap);
}
export function calcPwuAllowanceMonthlyAtSnapshot(
  profile: BaseProfile,
  series: PayTableId,
  columnKey: string,
  step: number,
  basePay: number
): number {
  const eligible = !!profile.pensionableAutoFlags?.isPwuEligible;
  if (!eligible) return 0;

  const raw = Math.round(basePay * 0.041);

  const upperColumnKey = getNextUpperColumnKey(series, columnKey);
  if (!upperColumnKey) return raw;

  const upperPay = getPay(series, upperColumnKey, step) ?? 0;
  if (upperPay <= 0) return raw;

  const maxGap = Math.max(0, upperPay - basePay);
  return Math.min(raw, maxGap);
}
/**
 * 직급보조비(국가공무원 일반직 중심 기본값)
 * 필요하면 overridePositionAllowance로 덮어쓰기
 */
export function calcPositionAllowanceMonthly(profile: BaseProfile): number {
  const override = n(
    profile.pensionableAutoFlags?.overridePositionAllowance,
    -1
  );

  if (override >= 0) {
    return Math.round(
      override + n(profile.pensionableAutoFlags?.extraPositionAllowance)
    );
  }

  const grade = parseGradeNumber(getCurrentColumnKey(profile));
  const extra = n(profile.pensionableAutoFlags?.extraPositionAllowance);

  let base = 0;

  switch (grade) {
    case 1:
      base = 750_000;
      break;
    case 2:
      base = 650_000;
      break;
    case 3:
      base = 500_000;
      break;
    case 4:
      base = 400_000;
      break;
    case 5:
      base = 250_000;
      break;
    case 6:
      base = 185_000;
      break;
    case 7:
      base = 180_000;
      break;
    case 8:
    case 9:
      base = 175_000;
      break;
    default:
      base = 0;
      break;
  }

  return Math.round(base + extra);
}
export function calcPositionAllowanceMonthlyAtColumn(
  profile: BaseProfile,
  columnKey: string
): number {
  const override = n(
    profile.pensionableAutoFlags?.overridePositionAllowance,
    -1
  );

  if (override >= 0) {
    return Math.round(
      override + n(profile.pensionableAutoFlags?.extraPositionAllowance)
    );
  }

  const grade = parseGradeNumber(columnKey);
  const extra = n(profile.pensionableAutoFlags?.extraPositionAllowance);

  let base = 0;

  switch (grade) {
    case 1:
      base = 750_000;
      break;
    case 2:
      base = 650_000;
      break;
    case 3:
      base = 500_000;
      break;
    case 4:
      base = 400_000;
      break;
    case 5:
      base = 250_000;
      break;
    case 6:
      base = 185_000;
      break;
    case 7:
      base = 180_000;
      break;
    case 8:
    case 9:
      base = 175_000;
      break;
    default:
      base = 0;
      break;
  }

  return Math.round(base + extra);
}
/**
 * 관리업무수당
 * - 일반/별정/대부분: 9%
 * - 연구/지도직, 일부 교육공무원: 7.8%
 * profile에서 지급대상 플래그를 켜야 반영
 */
export function calcManagementAllowanceMonthly(
  profile: BaseProfile,
  basePay: number
): number {
  if (!profile.pensionableAutoFlags?.isManagementEligible) return 0;
  const rate = profile.pensionableAutoFlags?.managementRate ?? 0.09;
  return Math.round(basePay * rate);
}

export function calcSpecialAreaAllowanceMonthly(profile: BaseProfile): number {
  return Math.max(
    0,
    Math.round(n(profile.pensionableMonthlyInputs?.specialArea))
  );
}

export function calcSpecialDutyAllowanceMonthly(profile: BaseProfile): number {
  return Math.max(
    0,
    Math.round(n(profile.pensionableMonthlyInputs?.specialDuty))
  );
}

export function calcDangerousDutyAllowanceMonthly(
  profile: BaseProfile
): number {
  return Math.max(
    0,
    Math.round(n(profile.pensionableMonthlyInputs?.dangerousDuty))
  );
}

export function calcHolidayBonusMonthly(basePay: number): number {
  return Math.round((basePay * 0.6 * 2) / 12);
}

export function calcTaxableEtcIncludedMonthly(profile: BaseProfile): number {
  return Math.max(
    0,
    Math.round(n(profile.pensionableMonthlyInputs?.taxableEtcIncluded))
  );
}

export function calcAverageReplacementMonthly(profile: BaseProfile): number {
  const directMonthly = n(
    profile.pensionableMonthlyInputs?.averageReplacementMonthly,
    -1
  );

  if (directMonthly >= 0) {
    return Math.round(directMonthly);
  }

  const annualValues: number[] = [
    n(profile.pensionableExcludedAnnualInputs?.performanceBonus),
    n(profile.pensionableExcludedAnnualInputs?.jobPerformancePay),
    n(profile.pensionableExcludedAnnualInputs?.performanceAnnualSalary),
    n(profile.pensionableExcludedAnnualInputs?.bonus),
    n(profile.pensionableExcludedAnnualInputs?.overtime),
    n(profile.pensionableExcludedAnnualInputs?.night),
    n(profile.pensionableExcludedAnnualInputs?.holiday),
    n(profile.pensionableExcludedAnnualInputs?.leaveCompensation),
  ];

  const annual: number = annualValues.reduce(
    (acc: number, cur: number) => acc + cur,
    0
  );

  return Math.round(annual / 12);
}
export function calcEstimatedPensionableMonthlyAtSnapshot(
  params: PensionableSnapshotParams
): PensionableAllowanceBreakdown {
  const {
    profile,
    series,
    columnKey,
    step,
    serviceYears,
    includeAverageReplacementMonthly = false,
  } = params;

  const safeStep = clampInt(step, 1, 32);
  const safeYears = Math.max(0, serviceYears);

  const basePay = getPay(series, columnKey, safeStep) ?? 0;

  const positionAllowance = calcPositionAllowanceMonthlyAtColumn(
    profile,
    columnKey
  );
  const regularBonusMonthly = calcRegularBonusMonthly(basePay, safeYears);
  const regularAdd = calcRegularAddMonthly(safeYears);
  const pwuAllowance = calcPwuAllowanceMonthlyAtSnapshot(
    profile,
    series,
    columnKey,
    safeStep,
    basePay
  );
  const managementAllowance = calcManagementAllowanceMonthly(profile, basePay);

  const specialAreaAllowance = calcSpecialAreaAllowanceMonthly(profile);
  const specialDutyAllowance = calcSpecialDutyAllowanceMonthly(profile);
  const dangerousDutyAllowance = calcDangerousDutyAllowanceMonthly(profile);
  const taxableEtcIncluded = calcTaxableEtcIncludedMonthly(profile);
  const holidayBonusMonthly = calcHolidayBonusMonthly(basePay);

  const averageReplacementMonthly = includeAverageReplacementMonthly
    ? calcAverageReplacementMonthly(profile)
    : 0;

  const autoIncludedTotal =
    positionAllowance +
    regularBonusMonthly +
    regularAdd +
    pwuAllowance +
    managementAllowance +
    specialAreaAllowance +
    specialDutyAllowance +
    dangerousDutyAllowance +
    taxableEtcIncluded +
    holidayBonusMonthly;

  const estimatedCurrentPensionableMonthly =
    basePay + autoIncludedTotal + averageReplacementMonthly;

  return {
    basePay,
    positionAllowance,
    regularBonusMonthly,
    regularAdd,
    pwuAllowance,
    managementAllowance,
    specialAreaAllowance,
    specialDutyAllowance,
    dangerousDutyAllowance,
    taxableEtcIncluded,
    holidayBonusMonthly,
    averageReplacementMonthly,
    autoIncludedTotal,
    estimatedCurrentPensionableMonthly,
  };
}
export function calcEstimatedCurrentPensionableMonthly(
  profile: BaseProfile
): PensionableAllowanceBreakdown {
  const leaveOfAbsenceYears = Math.max(0, Number(profile.leaveOfAbsenceYears ?? 0));
const serviceYears = Math.max(
  0,
  diffYears(profile.startDate, getTodayYmd()) - leaveOfAbsenceYears
);

  return calcEstimatedPensionableMonthlyAtSnapshot({
    profile,
    series: getCurrentSeries(profile),
    columnKey: getCurrentColumnKey(profile),
    step: getCurrentStep(profile),
    serviceYears,
    includeAverageReplacementMonthly: true,
  });
}