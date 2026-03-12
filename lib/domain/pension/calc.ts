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

type PensionRateSegment = {
  label: string;
  start: Date;
  end: Date;
  years: number;
  rate: number;
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

function parseYmdToDate(ymd?: string) {
  if (!ymd) return null;
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;

  const y = Number(m[1]);
  const mm = Number(m[2]);
  const d = Number(m[3]);

  const dt = new Date(y, mm - 1, d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

function diffDays(start: Date, end: Date) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(0, (end.getTime() - start.getTime()) / msPerDay);
}

function yearsFromDays(days: number) {
  return days / 365.2425;
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function subtractYearsAsDays(date: Date, years: number) {
  const days = Math.round(Math.max(0, years) * 365.2425);
  return addDays(date, -days);
}

function startOfYear(year: number) {
  return new Date(year, 0, 1);
}

function startOfNextYear(year: number) {
  return new Date(year + 1, 0, 1);
}

/**
 * 군복무는 최대 3년까지만 인정
 */
function pickMilitaryServiceYears(profile: ProfileWithDerived) {
  return Math.max(0, Math.min(3, Number(profile.militaryServiceYears ?? 0)));
}

/**
 * 총 재직기간:
 * - 근무기간 - 휴직기간
 * - 군복무는 총 재직기간에 더하지 않고 인정연수/지급률 계산에서 별도 반영
 */
function getTotalServiceYears(serviceYears: number) {
  return Math.max(0, serviceYears);
}

/**
 * 연금 인정연수:
 * - 실제 재직기간 + 군복무 인정
 * - 최대 36년
 */
function getPensionRecognizedYears(totalYears: number) {
  return Math.min(Math.max(totalYears, 0), 36);
}

function getPost2016AccrualRate(year: number) {
  if (year <= 2015) return 1.9;
  if (year >= 2035) return 1.7;

  const rate = 1.878 - (year - 2016) * 0.022;
  return Number(Math.max(1.7, rate).toFixed(3));
}

function pushSegment(
  list: PensionRateSegment[],
  label: string,
  start: Date,
  end: Date,
  rate: number
) {
  if (end <= start) return;
  const days = diffDays(start, end);
  if (days <= 0) return;

  list.push({
    label,
    start,
    end,
    years: yearsFromDays(days),
    rate,
  });
}

function buildPensionRateSegments(params: {
  startDate?: string;
  retireDate?: string;
  militaryServiceYears?: number;
}) {
  const { startDate, retireDate, militaryServiceYears = 0 } = params;

  const actualStart = parseYmdToDate(startDate);
  const retire = parseYmdToDate(retireDate);

  if (!actualStart || !retire || retire <= actualStart) {
    return [];
  }

  // 군복무 인정연수는 임용일 이전 기간으로 소급 반영
  const deemedStart = subtractYearsAsDays(
    actualStart,
    Math.max(0, militaryServiceYears)
  );

  const segments: PensionRateSegment[] = [];

  // 2009년 이전 구간
  const oldPeriodEnd = new Date(2010, 0, 1);
  const oldStart = deemedStart;
  const oldEnd = retire < oldPeriodEnd ? retire : oldPeriodEnd;

  if (oldEnd > oldStart) {
    const oldYears = yearsFromDays(diffDays(oldStart, oldEnd));
    const first20 = Math.min(oldYears, 20);
    const over20 = Math.max(0, oldYears - 20);

    if (first20 > 0) {
      segments.push({
        label: "2009년 이전(20년까지)",
        start: oldStart,
        end: oldEnd,
        years: first20,
        rate: 2.5,
      });
    }

    if (over20 > 0) {
      segments.push({
        label: "2009년 이전(20년 초과)",
        start: oldStart,
        end: oldEnd,
        years: over20,
        rate: 2.0,
      });
    }
  }

  // 2010~2015
  for (let year = 2010; year <= 2015; year += 1) {
    const segStart =
      deemedStart > startOfYear(year) ? deemedStart : startOfYear(year);

    const segEnd =
      retire < startOfNextYear(year) ? retire : startOfNextYear(year);

    pushSegment(segments, `${year}년`, segStart, segEnd, 1.9);
  }

  // 2016년 이후
  const endYear = retire.getFullYear();
  for (let year = 2016; year <= endYear; year += 1) {
    const segStart =
      deemedStart > startOfYear(year) ? deemedStart : startOfYear(year);

    const segEnd =
      retire < startOfNextYear(year) ? retire : startOfNextYear(year);

    pushSegment(
      segments,
      `${year}년`,
      segStart,
      segEnd,
      getPost2016AccrualRate(year)
    );
  }

  return segments.filter((x) => x.years > 0);
}

function applyLeaveOfAbsenceToSegments(
  segments: PensionRateSegment[],
  leaveOfAbsenceYears: number
) {
  let remainingLeave = Math.max(0, leaveOfAbsenceYears);

  // 휴직 합계는 최근 기간부터 차감
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    if (remainingLeave <= 0) break;

    const seg = segments[i];
    const deduct = Math.min(seg.years, remainingLeave);
    seg.years = Math.max(0, seg.years - deduct);
    remainingLeave -= deduct;
  }

  return segments.filter((x) => x.years > 0);
}

function applyPensionYearCapToSegments(
  segments: PensionRateSegment[],
  maxYears = 36
) {
  let total = segments.reduce((sum, seg) => sum + seg.years, 0);
  let excess = Math.max(0, total - maxYears);

  if (excess <= 0) return segments;

  // 36년 초과분은 최근 기간부터 제외
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    if (excess <= 0) break;

    const seg = segments[i];
    const deduct = Math.min(seg.years, excess);
    seg.years = Math.max(0, seg.years - deduct);
    excess -= deduct;
  }

  return segments.filter((x) => x.years > 0);
}

function calcPensionRateWithMilitary(params: {
  startDate?: string;
  retireDate?: string;
  militaryServiceYears?: number;
  leaveOfAbsenceYears?: number;
  maxRecognizedYears?: number;
}) {
  const {
    startDate,
    retireDate,
    militaryServiceYears = 0,
    leaveOfAbsenceYears = 0,
    maxRecognizedYears = 36,
  } = params;

  let segments = buildPensionRateSegments({
    startDate,
    retireDate,
    militaryServiceYears,
  });

  segments = applyLeaveOfAbsenceToSegments(segments, leaveOfAbsenceYears);
  segments = applyPensionYearCapToSegments(segments, maxRecognizedYears);

  const totalRate = segments.reduce(
    (sum, seg) => sum + seg.years * seg.rate,
    0
  );

  return Number(Math.max(0, totalRate).toFixed(2));
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
      : Math.max(0, Math.min(recognizedYears * 1.7, 100));

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
  _recognizedYears: number,
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

  return calcPensionRateWithMilitary({
    startDate: profile.startDate,
    retireDate: profile.retireDate,
    militaryServiceYears: pickMilitaryServiceYears(profile),
    leaveOfAbsenceYears: Math.max(
      0,
      Number(profile.leaveOfAbsenceYears ?? 0)
    ),
    maxRecognizedYears: 36,
  });
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
  const currentColumnKey = String(
    profile.currentColumnKey ?? profile.columnKey ?? ""
  );
  const candidates = getGradeComparisonColumns(series);

  const averageGap = baseAverageMonthlyBase - baseCurrentMonthlyBase;

  return candidates
    .map((item) => {
      const isCurrentGrade = item.key === currentColumnKey;

      let appliedStep = preferredStep;
      let currentMonthlyBase = 0;
      let averageMonthlyBase = 0;

      if (isCurrentGrade) {
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
    typeof overrides?.totalYears === "number" &&
    Number.isFinite(overrides.totalYears)
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