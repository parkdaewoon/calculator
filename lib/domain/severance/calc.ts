import type { BaseProfile, PromotionEntry } from "@/lib/domain/profile/types";
import { getPay, PAY_TABLES, type PayTableId } from "@/lib/payTables";
import { calcEstimatedCurrentPensionableMonthly } from "@/lib/domain/pensionableIncome/calc";

type CareerSegment = {
  series: string;
  columnKey: string;
  years: number;
};

export type SeveranceGradeSimulationItem = {
  key: string;
  label: string;
  columnKey: string;
  monthlyBase: number;
  years: number;
  cappedYears: number;
  rate: number;
  gross: number;
  estimatedTax: number;
  estimatedLocalTax: number;
  estimatedNet: number;
  appliedStep: number;
};

export type SeveranceCalcResult = {
  totalYears: number;
  cappedYears: number;
  leaveOfAbsenceYears: number;
  totalYearsBeforeLeave: number;
  currentMonthlyBase: number;
  averageMonthlyBase: number;
  appliedRate: number;
  gross: number;
  estimatedTax: number;
  estimatedLocalTax: number;
  estimatedNet: number;
  gradeSimulation: SeveranceGradeSimulationItem[];
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

function getStepPay(series: string, columnKey: string, step: number) {
  return getPay(series as PayTableId, columnKey, clampInt(step, 1, 32)) ?? 0;
}

/**
 * 현재 호봉이 해당 직급에 없으면
 * 가능한 마지막 유효 호봉으로 내려가며 찾음
 */
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
type PensionRateSegment = {
  label: string;
  start: Date;
  end: Date;
  years: number;
  rate: number;
};

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

  // 군복무 인정연수는 임용일 이전으로 소급해서 반영
  const deemedStart = subtractYearsAsDays(
    actualStart,
    Math.max(0, militaryServiceYears)
  );

  const segments: PensionRateSegment[] = [];

  // 1기간: 2009.12.31. 이전
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

  // 2기간: 2010~2015
  for (let year = 2010; year <= 2015; year++) {
    const segStart = deemedStart > startOfYear(year)
      ? deemedStart
      : startOfYear(year);

    const segEnd = retire < startOfNextYear(year)
      ? retire
      : startOfNextYear(year);

    pushSegment(segments, `${year}년`, segStart, segEnd, 1.9);
  }

  // 3기간: 2016년 이후
  const endYear = retire.getFullYear();
  for (let year = 2016; year <= endYear; year++) {
    const segStart = deemedStart > startOfYear(year)
      ? deemedStart
      : startOfYear(year);

    const segEnd = retire < startOfNextYear(year)
      ? retire
      : startOfNextYear(year);

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

  // 휴직기간 합계만 있으므로 최근 재직기간부터 차감
  for (let i = segments.length - 1; i >= 0; i--) {
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

  // 인정연수 상한 초과분은 최근 기간부터 제외
  for (let i = segments.length - 1; i >= 0; i--) {
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

  segments = applyLeaveOfAbsenceToSegments(
    segments,
    leaveOfAbsenceYears
  );

  segments = applyPensionYearCapToSegments(
    segments,
    maxRecognizedYears
  );

  const totalRate = segments.reduce(
    (sum, seg) => sum + seg.years * seg.rate,
    0
  );

  return Number(Math.max(0, totalRate).toFixed(2));
}
/**
 * 공무원 퇴직수당 지급률
 * - 1년 이상 5년 미만: 6.5%
 * - 5년 이상 10년 미만: 22.75%
 * - 10년 이상 15년 미만: 29.25%
 * - 15년 이상 20년 미만: 32.5%
 * - 20년 이상: 39%
 */
export function severanceRateByYears(years: number) {
  if (years >= 20) return 39;
  if (years >= 15) return 32.5;
  if (years >= 10) return 29.25;
  if (years >= 5) return 22.75;
  if (years >= 1) return 6.5;
  return 0;
}

/**
 * 퇴직수당 계산 시 재직기간는 33년 상한
 */
export function capSeveranceYears(years: number) {
  const y = Number.isFinite(years) ? years : 0;
  return Math.max(0, Math.min(33, y));
}

function buildCareerSegments(params: {
  startSeries: string;
  startColumnKey: string;
  currentSeries: string;
  currentColumnKey: string;
  totalYears: number;
  promotions: PromotionEntry[];
}): CareerSegment[] {
  const {
    startSeries,
    startColumnKey,
    currentSeries,
    currentColumnKey,
    totalYears,
    promotions,
  } = params;

  const cleaned = (promotions ?? [])
    .filter((x) => x.series && x.columnKey && Number(x.years) > 0)
    .map((x) => ({
      series: x.series,
      columnKey: x.columnKey,
      years: Number(x.years),
    }));

  const segments: CareerSegment[] = [];
  let prevSeries = startSeries;
  let prevColumnKey = startColumnKey;
  let usedYears = 0;

  for (const row of cleaned) {
    const years = Math.max(0, Number(row.years) || 0);

    if (years > 0) {
      segments.push({
        series: prevSeries,
        columnKey: prevColumnKey,
        years,
      });
      usedYears += years;
    }

    prevSeries = row.series;
    prevColumnKey = row.columnKey;
  }

  const remain = Math.max(0, totalYears - usedYears);
  if (remain > 0) {
    segments.push({
      series: currentSeries,
      columnKey: currentColumnKey,
      years: remain,
    });
  }

  return segments.filter((x) => x.years > 0);
}

function calcSegmentRepresentativePay(params: {
  series: string;
  columnKey: string;
  startStep: number;
  years: number;
}) {
  const { series, columnKey, startStep, years } = params;

  const safeYears = Math.max(1, Math.floor(years));
  const representativeStep = clampInt(
    startStep + Math.floor((safeYears - 1) / 2),
    1,
    32
  );

  return getStepPay(series, columnKey, representativeStep);
}

function calcAverageMonthlyBase(
  profile: BaseProfile,
  totalYears: number,
  currentPay: number
) {
  const incomeMode = profile.incomeMode ?? "auto";

  if (incomeMode === "manual") {
    return Math.max(0, Number(profile.avgIncomeMonthly ?? 0));
  }

  const promotions = ((profile.promotions ?? []) as PromotionEntry[]).filter(
    (x) => x.series && x.columnKey && Number(x.years) > 0
  );

  if (!promotions.length) {
    return Math.round(currentPay * 0.9);
  }

  const segments = buildCareerSegments({
    startSeries: profile.startSeries ?? profile.series,
    startColumnKey: profile.startColumnKey ?? profile.columnKey,
    currentSeries: profile.currentSeries ?? profile.series,
    currentColumnKey: profile.currentColumnKey ?? profile.columnKey,
    totalYears,
    promotions,
  });

  if (!segments.length) {
    return Math.round(currentPay * 0.9);
  }

  let weightedSum = 0;
  let totalWeight = 0;
  let cursorStep = clampInt(profile.startStep ?? profile.step, 1, 32);

  segments.forEach((seg, idx) => {
    const isLast = idx === segments.length - 1;

    const pay = isLast
      ? getStepPay(
          seg.series,
          seg.columnKey,
          clampInt(profile.currentStep ?? profile.step, 1, 32)
        )
      : calcSegmentRepresentativePay({
          series: seg.series,
          columnKey: seg.columnKey,
          startStep: cursorStep,
          years: seg.years,
        });

    weightedSum += pay * seg.years;
    totalWeight += seg.years;
    cursorStep = clampInt(cursorStep + Math.floor(seg.years), 1, 32);
  });

  if (totalWeight <= 0) {
    return Math.round(currentPay * 0.9);
  }

  return Math.round(weightedSum / totalWeight);
}

/**
 * 현재는 단순 추정세액
 * 추후 실제 퇴직소득세 계산식으로 교체 가능
 */
function estimateSeveranceTax(gross: number) {
  if (gross <= 0) {
    return {
      estimatedTax: 0,
      estimatedLocalTax: 0,
      estimatedNet: 0,
    };
  }

  const taxRate =
    gross <= 50_000_000 ? 0.03 : gross <= 100_000_000 ? 0.04 : 0.05;

  const estimatedTax = Math.round(gross * taxRate);
  const estimatedLocalTax = Math.round(estimatedTax * 0.1);
  const estimatedNet = Math.max(0, gross - estimatedTax - estimatedLocalTax);

  return {
    estimatedTax,
    estimatedLocalTax,
    estimatedNet,
  };
}

/**
 * 퇴직수당 = 최종기준소득월액 × 반영연수(최대 33년) × 지급률
 */
function calcSeveranceGross(monthlyBase: number, years: number) {
  const cappedYears = capSeveranceYears(years);
  const rate = severanceRateByYears(cappedYears);
  const gross = Math.round(monthlyBase * cappedYears * (rate / 100));

  return {
    rate,
    cappedYears,
    gross,
  };
}

/**
 * 일반직(특정직) 비교용 직급 고정
 * 3급 / 4급·6등급 / 5급·5등급 / 6급·4등급
 */
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

function makeGradeSimulation(profile: BaseProfile, totalYears: number) {
  const series = String(profile.currentSeries ?? profile.series);
  const preferredStep = clampInt(profile.currentStep ?? profile.step, 1, 32);
  const candidates = getGradeComparisonColumns(series);

  return candidates
    .map((item) => {
      const { step: appliedStep, pay: fallbackPay } = getValidStepPay(
        series,
        item.key,
        preferredStep
      );

      const simulatedProfile: BaseProfile = {
        ...profile,
        currentSeries: series,
        currentColumnKey: item.key,
        currentStep: appliedStep,
      };

      const pensionable =
        calcEstimatedCurrentPensionableMonthly(simulatedProfile);

      const monthlyBase =
        pensionable.estimatedCurrentPensionableMonthly || fallbackPay;

      const { rate, cappedYears, gross } = calcSeveranceGross(
        monthlyBase,
        totalYears
      );

      const { estimatedTax, estimatedLocalTax, estimatedNet } =
        estimateSeveranceTax(gross);

      return {
        key: `grade-${item.gradeOrder}-${item.key}`,
        label: item.label,
        columnKey: item.key,
        monthlyBase,
        years: totalYears,
        cappedYears,
        rate,
        gross,
        estimatedTax,
        estimatedLocalTax,
        estimatedNet,
        appliedStep,
        sortOrder: item.gradeOrder,
      };
    })
    .filter((x) => x.monthlyBase > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ sortOrder, ...rest }) => rest);
}

export function calcSeverance(
  profile: BaseProfile,
  monthlyBaseOverride?: number
): SeveranceCalcResult {
  const leaveOfAbsenceYears = Math.max(
  0,
  Number(profile.leaveOfAbsenceYears ?? 0)
);

const totalYearsRaw = diffYears(profile.startDate, profile.retireDate);
const totalYears = Math.max(0, totalYearsRaw - leaveOfAbsenceYears);

const cappedYears = capSeveranceYears(totalYears);

  const fallbackMonthlyBase =
  getStepPay(
    profile.currentSeries ?? profile.series,
    profile.currentColumnKey ?? profile.columnKey,
    profile.currentStep ?? profile.step
  ) ?? 0;

const currentMonthlyBase =
  monthlyBaseOverride ?? fallbackMonthlyBase;

  const averageMonthlyBase = calcAverageMonthlyBase(
    profile,
    totalYears,
    currentMonthlyBase
  );

  const { rate: appliedRate, gross } = calcSeveranceGross(
    currentMonthlyBase,
    totalYears
  );

  const { estimatedTax, estimatedLocalTax, estimatedNet } =
    estimateSeveranceTax(gross);

  const gradeSimulation = makeGradeSimulation(profile, totalYears);

  return {
  totalYears,
  cappedYears,
  leaveOfAbsenceYears,
  totalYearsBeforeLeave: totalYearsRaw,
  currentMonthlyBase,
  averageMonthlyBase,
  appliedRate,
  gross,
  estimatedTax,
  estimatedLocalTax,
  estimatedNet,
  gradeSimulation,
};
}