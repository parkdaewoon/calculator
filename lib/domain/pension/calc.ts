import type { BaseProfile } from "@/lib/domain/profile/types";
import { calcEstimatedCurrentPensionableMonthly } from "@/lib/domain/pensionableIncome/calc";
import { getPay, PAY_TABLES, type PayTableId } from "@/lib/payTables";

type BasicInfoDerivedFields = {
  calculatedTotalYears?: number;
  calculatedPensionRecognizedYears?: number;
  calculatedPensionRate?: number;
  calculatedAverageMonthlyBase?: number;
};

type ProfileWithDerived = BaseProfile & BasicInfoDerivedFields;

export type PensionGradeSimulationItem = {
  key: string;
  label: string;
  columnKey: string;
  currentMonthlyBase: number;
  averageMonthlyBase: number;
  recognizedYears: number;
  pensionRate: number;
  monthlyPensionGross: number;
  deductionsTotal: number;
  estimatedNetPension: number;
  appliedStep: number;
};

export type PensionCalcResult = {
  totalYears: number;
  recognizedYears: number;
  pensionRate: number;
  currentMonthlyBase: number;
  averageMonthlyBase: number;
  monthlyPensionGross: number;
  deductionsTotal: number;
  monthlyPensionNet: number;
  gradeSimulation: PensionGradeSimulationItem[];
};

function clampInt(n: number, min: number, max: number) {
  const x = Math.trunc(Number.isFinite(n) ? n : min);
  return Math.min(max, Math.max(min, x));
}

function diffYears(start?: string, end?: string) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
  if (e < s) return 0;
  return (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24 * 365.2425);
}

function pensionRateByYears(years: number) {
  const rate = years * 1.7;
  return Math.max(0, Math.min(rate, 100));
}

/**
 * 군복무는 최대 3년까지만 인정
 */
function pickMilitaryServiceYears(profile: ProfileWithDerived) {
  return Math.max(0, Math.min(3, Number(profile.militaryServiceYears ?? 0)));
}

/**
 * 총 재직기간:
 * - 근무기간 - 휴직기간 + 군복무
 */
function getTotalServiceYears(serviceYears: number) {
  return Math.max(0, serviceYears);
}

/**
 * 연금 인정연수:
 * - 총 재직기간와 동일하게 처리
 * - 최대 36년
 */
function getPensionRecognizedYears(totalYears: number) {
  return Math.min(Math.max(totalYears, 0), 36);
}

function estimatePensionDeductions(monthlyGross: number) {
  if (monthlyGross <= 0) {
    return {
      deductionsTotal: 0,
      estimatedNetPension: 0,
    };
  }

  const estimatedRate = 0.03;
  const deductionsTotal = Math.round(monthlyGross * estimatedRate);
  const estimatedNetPension = Math.max(0, monthlyGross - deductionsTotal);

  return {
    deductionsTotal,
    estimatedNetPension,
  };
}

function getStepPay(series: string, columnKey: string, step: number) {
  return getPay(series as PayTableId, columnKey, clampInt(step, 1, 32)) ?? 0;
}

function getValidStepPay(
  series: string,
  columnKey: string,
  preferredStep: number
) {
  const safePreferred = clampInt(preferredStep, 1, 32);

  for (let step = safePreferred; step >= 1; step -= 1) {
    const pay = getStepPay(series, columnKey, step);
    if (pay > 0) {
      return { step, pay };
    }
  }

  return { step: 1, pay: 0 };
}

function getGradeComparisonColumns(series: string) {
  const table = PAY_TABLES[series as PayTableId];
  const columns = table?.columns ?? [];

  const preferredLabels = ["3급", "4급·6등급", "5급·5등급", "6급·4등급"];

  const picked = preferredLabels
    .map((label) =>
      columns.find((c) => String(c.label ?? "").trim() === label)
    )
    .filter(
      (c): c is { key: string; label: string } =>
        !!c && typeof c.key === "string" && typeof c.label === "string"
    );

  if (picked.length > 0) {
    return picked.map((c, index) => ({
      gradeOrder: index,
      key: c.key,
      label: c.label,
    }));
  }

  return columns.slice(0, 4).map((c, index) => ({
    gradeOrder: index,
    key: String(c.key),
    label: String(c.label),
  }));
}

function calcMonthlyPension(
  averageMonthlyBase: number,
  recognizedYears: number,
  pensionRateOverride?: number
) {
  const pensionRate =
    typeof pensionRateOverride === "number" && Number.isFinite(pensionRateOverride)
      ? Math.max(0, Math.min(pensionRateOverride, 100))
      : pensionRateByYears(recognizedYears);

  const monthlyPensionGross = Math.round(
    averageMonthlyBase * (pensionRate / 100)
  );

  return {
    pensionRate,
    monthlyPensionGross,
  };
}

function calcAverageMonthlyBaseFallback(
  profile: BaseProfile,
  currentMonthlyBase: number
) {
  if ((profile.incomeMode ?? "auto") === "manual") {
    return Math.max(0, Number(profile.avgIncomeMonthly ?? 0));
  }

  return Math.round(currentMonthlyBase * 0.9);
}

function pickBasicInfoTotalYears(profile: ProfileWithDerived) {
  if (
    typeof profile.calculatedTotalYears === "number" &&
    Number.isFinite(profile.calculatedTotalYears)
  ) {
    return Math.max(0, profile.calculatedTotalYears);
  }

  const leaveOfAbsenceYears = Math.max(
    0,
    Number(profile.leaveOfAbsenceYears ?? 0)
  );

  const totalYearsRaw = diffYears(profile.startDate, profile.retireDate);
  const pureServiceYears = Math.max(0, totalYearsRaw - leaveOfAbsenceYears);

  return getTotalServiceYears(pureServiceYears);
}

function pickBasicInfoRecognizedYears(
  profile: ProfileWithDerived,
  totalYears: number
) {
  const militaryServiceYears = pickMilitaryServiceYears(profile);

  if (
    typeof profile.calculatedPensionRecognizedYears === "number" &&
    Number.isFinite(profile.calculatedPensionRecognizedYears)
  ) {
    return Math.min(Math.max(0, profile.calculatedPensionRecognizedYears), 36);
  }

  return getPensionRecognizedYears(totalYears + militaryServiceYears);
}

function pickBasicInfoAverageMonthlyBase(
  profile: ProfileWithDerived,
  currentMonthlyBase: number,
  overrideAverageMonthlyBase?: number
) {
  if (
    typeof overrideAverageMonthlyBase === "number" &&
    Number.isFinite(overrideAverageMonthlyBase)
  ) {
    return Math.max(0, overrideAverageMonthlyBase);
  }

  // 기본정보 화면에서 저장된 평균기준소득월액을 최우선 사용
  if (
    typeof profile.calculatedAverageMonthlyBase === "number" &&
    Number.isFinite(profile.calculatedAverageMonthlyBase)
  ) {
    return Math.max(0, profile.calculatedAverageMonthlyBase);
  }

  if ((profile.incomeMode ?? "auto") === "manual") {
    return Math.max(0, Number(profile.avgIncomeMonthly ?? 0));
  }

  return calcAverageMonthlyBaseFallback(profile, currentMonthlyBase);
}

function pickBasicInfoPensionRate(
  profile: ProfileWithDerived,
  recognizedYears: number,
  overridePensionRate?: number
) {
  if (
    typeof overridePensionRate === "number" &&
    Number.isFinite(overridePensionRate)
  ) {
    return Math.max(0, Math.min(overridePensionRate, 100));
  }

  if (
    typeof profile.calculatedPensionRate === "number" &&
    Number.isFinite(profile.calculatedPensionRate)
  ) {
    return Math.max(0, Math.min(profile.calculatedPensionRate, 100));
  }

  return pensionRateByYears(recognizedYears);
}

function makeGradeSimulation(
  profile: ProfileWithDerived,
  recognizedYears: number,
  baseAverageMonthlyBase: number,
  baseCurrentMonthlyBase: number,
  basePensionRate?: number
): PensionGradeSimulationItem[] {
  const series = String(profile.currentSeries ?? profile.series);
  const preferredStep = clampInt(profile.currentStep ?? profile.step, 1, 32);
  const currentColumnKey = String(profile.currentColumnKey ?? profile.columnKey ?? "");
  const candidates = getGradeComparisonColumns(series);

  // 현재 프로필에서 평균기준소득월액이 얼마나 더해졌는지 "차액"으로 유지
  const averageGap = baseAverageMonthlyBase - baseCurrentMonthlyBase;

  return candidates
    .map((item) => {
      const isCurrentGrade = item.key === currentColumnKey;

      let appliedStep = preferredStep;
      let currentMonthlyBase = 0;
      let averageMonthlyBase = 0;

      if (isCurrentGrade) {
        // ✅ 현재 지급기준 직급은 상단 메인 결과값을 그대로 사용
        currentMonthlyBase = Math.max(0, baseCurrentMonthlyBase);
        averageMonthlyBase = Math.max(0, baseAverageMonthlyBase);
      } else {
        const { step, pay: fallbackPay } = getValidStepPay(
          series,
          item.key,
          preferredStep
        );
        appliedStep = step;

        const isManagementEligible =
          item.label.includes("5급") || item.label.includes("6급");

        const simulatedProfile: ProfileWithDerived = {
          ...profile,
          currentSeries: series,
          currentColumnKey: item.key,
          currentStep: appliedStep,
          pensionableAutoFlags: {
            ...(profile.pensionableAutoFlags ?? {}),
            isManagementEligible,
          },
        };

        const pensionable =
          calcEstimatedCurrentPensionableMonthly(simulatedProfile);

        currentMonthlyBase = Math.max(
          0,
          pensionable.estimatedCurrentPensionableMonthly || fallbackPay
        );

        // ✅ 기본정보에서 반영된 평균기준소득월액 보정분을 그대로 더함
        averageMonthlyBase = Math.max(
          0,
          Math.round(currentMonthlyBase + averageGap)
        );
      }

      const { pensionRate, monthlyPensionGross } = calcMonthlyPension(
        averageMonthlyBase,
        recognizedYears,
        basePensionRate
      );

      const { deductionsTotal, estimatedNetPension } =
        estimatePensionDeductions(monthlyPensionGross);

      return {
        key: `grade-${item.gradeOrder}-${item.key}`,
        label: item.label,
        columnKey: item.key,
        currentMonthlyBase,
        averageMonthlyBase,
        recognizedYears,
        pensionRate,
        monthlyPensionGross,
        deductionsTotal,
        estimatedNetPension,
        appliedStep,
        sortOrder: item.gradeOrder,
      };
    })
    .filter((x) => x.currentMonthlyBase > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ sortOrder, ...rest }) => rest);
}

export function calcPension(
  profile: BaseProfile,
  overrides?: {
    currentMonthlyBase?: number;
    averageMonthlyBase?: number;
    totalYears?: number;
    recognizedYears?: number;
    pensionRate?: number;
  }
): PensionCalcResult {
  const stored = profile as ProfileWithDerived;

  const totalYears =
  typeof overrides?.totalYears === "number" && Number.isFinite(overrides.totalYears)
    ? Math.max(0, overrides.totalYears)
    : pickBasicInfoTotalYears(stored);

  const recognizedYears =
    typeof overrides?.recognizedYears === "number" &&
    Number.isFinite(overrides.recognizedYears)
      ? Math.min(Math.max(0, overrides.recognizedYears), 36)
      : pickBasicInfoRecognizedYears(stored, totalYears);

  const pensionable = calcEstimatedCurrentPensionableMonthly(stored);

  const fallbackStepPay =
    getStepPay(
      profile.currentSeries ?? profile.series,
      profile.currentColumnKey ?? profile.columnKey,
      profile.currentStep ?? profile.step
    ) ?? 0;

  const currentMonthlyBase =
    typeof overrides?.currentMonthlyBase === "number" &&
    Number.isFinite(overrides.currentMonthlyBase)
      ? Math.max(0, overrides.currentMonthlyBase)
      : Math.max(
          0,
          pensionable.estimatedCurrentPensionableMonthly || fallbackStepPay
        );

  const averageMonthlyBase = pickBasicInfoAverageMonthlyBase(
    stored,
    currentMonthlyBase,
    overrides?.averageMonthlyBase
  );

  const pensionRate = pickBasicInfoPensionRate(
    stored,
    recognizedYears,
    overrides?.pensionRate
  );

  const { monthlyPensionGross } = calcMonthlyPension(
    averageMonthlyBase,
    recognizedYears,
    pensionRate
  );

  const { deductionsTotal, estimatedNetPension } =
    estimatePensionDeductions(monthlyPensionGross);

  const gradeSimulation = makeGradeSimulation(
    stored,
    recognizedYears,
    averageMonthlyBase,
    currentMonthlyBase,
    pensionRate
  );

  return {
    totalYears,
    recognizedYears,
    pensionRate,
    currentMonthlyBase,
    averageMonthlyBase,
    monthlyPensionGross,
    deductionsTotal,
    monthlyPensionNet: estimatedNetPension,
    gradeSimulation,
  };
}