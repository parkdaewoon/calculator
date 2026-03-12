"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { BaseProfile, PromotionEntry } from "@/lib/domain/profile/types";
import { getPay, PAY_TABLES, type PayTableId } from "@/lib/payTables";
import SectionCard from "@/components/common/SectionCard";
import Field from "@/components/common/Field";
import DateWheelModal from "@/components/ui/wheel/presets/DateWheelModal";
import {
  calcEstimatedCurrentPensionableMonthly,
  calcEstimatedPensionableMonthlyAtSnapshot,
} from "@/lib/domain/pensionableIncome/calc";

type PickerKey = "birthDate" | "startDate" | "retireDate" | null;
type MoneyMode = "auto" | "manual";
type Opt = { value: string; label: string };

type CareerSegment = {
  series: string;
  columnKey: string;
  years: number;
};

const DEFAULT_PROMOTION_YEARS: Array<{ grade: string; years: number }> = [
  { grade: "8급", years: 5 },
  { grade: "7급", years: 6 },
  { grade: "6급", years: 7 },
  { grade: "5급", years: 11 },
  { grade: "4급", years: 8 },
  { grade: "3급", years: 7 },
  { grade: "2급", years: 6 },
  { grade: "1급", years: 5 },
];

const STEP_OPTIONS: Opt[] = Array.from({ length: 32 }, (_, i) => {
  const n = i + 1;
  return { value: String(n), label: `${n}호봉` };
});

const MILITARY_YEAR_OPTIONS: Opt[] = Array.from({ length: 4 }, (_, i) => ({
  value: String(i),
  label: `${i}년`,
}));

const LEAVE_OF_ABSENCE_OPTIONS: Opt[] = [];

for (let y = 0; y <= 30; y++) {
  for (let m = 0; m < 12; m++) {
    if (y === 0 && m === 0) continue;

    LEAVE_OF_ABSENCE_OPTIONS.push({
      value: String(y + m / 12),
      label: `${y}년 ${m}개월`,
    });
  }
}

LEAVE_OF_ABSENCE_OPTIONS.unshift({
  value: "0",
  label: "0년",
});

const PROMOTION_YEAR_OPTIONS: Opt[] = Array.from({ length: 30 }, (_, i) => {
  const n = i + 1;
  return { value: String(n), label: `${n}년` };
});

function clampInt(n: number, min: number, max: number) {
  const x = Math.trunc(Number.isFinite(n) ? n : min);
  return Math.min(max, Math.max(min, x));
}

function clampFloat(n: number, min: number, max: number) {
  const x = Number.isFinite(n) ? n : min;
  return Math.min(max, Math.max(min, x));
}

function fmtYmd(v?: string) {
  if (!v) return "선택";
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "선택";
  return `${m[1]}.${m[2]}.${m[3]}`;
}

function diffYears(start?: string, end?: string) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
  if (e < s) return 0;
  const ms = e.getTime() - s.getTime();
  return ms / (1000 * 60 * 60 * 24 * 365.2425);
}

function formatMoney(v: number | string | undefined) {
  const num = Number(String(v ?? 0).replaceAll(",", ""));
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("ko-KR");
}

function parseMoney(v: string) {
  const num = Number(String(v).replaceAll(",", "").trim());
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.round(num);
}

function formatYearsText(years: number, maxText?: string) {
  const safe = Math.max(0, years);
  const y = Math.floor(safe);
  const months = Math.floor((safe - y) * 12);

  if (maxText && months === 0) {
    return `${y}년${maxText}`;
  }

  return `${y}년 ${months}개월`;
}

function pensionStartAgeByBirthYear(year: number) {
  if (year <= 1952) return 60;
  if (year <= 1956) return 61;
  if (year <= 1960) return 62;
  if (year <= 1964) return 63;
  if (year <= 1968) return 64;
  return 65;
}

function calcAutoRetireDateFromBirth(birthDate?: string, retireAge = 65) {
  if (!birthDate) return "";

  const m = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";

  const y = Number(m[1]);
  const mm = Number(m[2]);

  if (!Number.isFinite(y) || !Number.isFinite(mm)) return "";

  const reachYear = y + retireAge;

  if (mm >= 1 && mm <= 6) {
    return `${reachYear}-06-30`;
  }
  return `${reachYear}-12-31`;
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
  for (let year = 2010; year <= 2015; year += 1) {
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
  for (let year = 2016; year <= endYear; year += 1) {
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

function severanceRateByYears(years: number) {
  if (years >= 20) return 39;
  if (years >= 15) return 32.5;
  if (years >= 10) return 29.25;
  if (years >= 5) return 22.57;
  if (years >= 1) return 6.5;
  return 0;
}

function getPensionRecognizedYears(
  totalYears: number,
  militaryServiceYears: number
) {
  const serviceYears = Math.max(totalYears, 0);
  const militaryYears = Math.max(militaryServiceYears, 0);
  return Math.min(serviceYears + militaryYears, 36);
}

function getSeveranceRecognizedYears(totalYears: number) {
  return Math.min(Math.max(totalYears, 0), 33);
}

function getStepPay(series: string, columnKey: string, step: number) {
  return getPay(series as PayTableId, columnKey, clampInt(step, 1, 32)) ?? 0;
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

  const cleaned = promotions
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

function calcAverageIncomeWithPromotionsA(params: {
  startSeries: string;
  startColumnKey: string;
  startStep: number;
  currentSeries: string;
  currentColumnKey: string;
  currentStep: number;
  totalYears: number;
  promotions: PromotionEntry[];
  profile: BaseProfile;
}) {
  const {
    startSeries,
    startColumnKey,
    startStep,
    currentSeries,
    currentColumnKey,
    currentStep,
    totalYears,
    promotions,
    profile,
  } = params;

  const validPromotions = promotions.filter(
    (x) => x.series && x.columnKey && Number(x.years) > 0
  );

  if (!validPromotions.length) {
    return calcEstimatedPensionableMonthlyAtSnapshot({
      profile,
      series: currentSeries as PayTableId,
      columnKey: currentColumnKey,
      step: currentStep,
      serviceYears: totalYears,
      includeAverageReplacementMonthly: false,
    }).estimatedCurrentPensionableMonthly;
  }

  const segments = buildCareerSegments({
    startSeries,
    startColumnKey,
    currentSeries,
    currentColumnKey,
    totalYears,
    promotions,
  });

  if (!segments.length) {
    return calcEstimatedPensionableMonthlyAtSnapshot({
      profile,
      series: currentSeries as PayTableId,
      columnKey: currentColumnKey,
      step: currentStep,
      serviceYears: totalYears,
      includeAverageReplacementMonthly: false,
    }).estimatedCurrentPensionableMonthly;
  }

  let weightedSum = 0;
  let totalWeight = 0;
  let cursorStep = clampInt(startStep, 1, 32);
  let usedYears = 0;

  segments.forEach((seg, idx) => {
    const segYears = Math.max(0, Number(seg.years) || 0);
    if (segYears <= 0) return;

    const isLast = idx === segments.length - 1;

    const representativeStep = isLast
      ? clampInt(currentStep, 1, 32)
      : clampInt(
          cursorStep + Math.floor((Math.max(1, Math.floor(segYears)) - 1) / 2),
          1,
          32
        );

    const serviceYearsAtSegmentMidpoint = Math.max(
      0,
      usedYears + segYears / 2
    );

    const monthlyBase = calcEstimatedPensionableMonthlyAtSnapshot({
      profile,
      series: seg.series as PayTableId,
      columnKey: seg.columnKey,
      step: representativeStep,
      serviceYears: serviceYearsAtSegmentMidpoint,
      includeAverageReplacementMonthly: false,
    }).estimatedCurrentPensionableMonthly;

    weightedSum += monthlyBase * segYears;
    totalWeight += segYears;

    usedYears += segYears;
    cursorStep = clampInt(cursorStep + Math.floor(segYears), 1, 32);
  });

  if (totalWeight <= 0) {
    return calcEstimatedPensionableMonthlyAtSnapshot({
      profile,
      series: currentSeries as PayTableId,
      columnKey: currentColumnKey,
      step: currentStep,
      serviceYears: totalYears,
      includeAverageReplacementMonthly: false,
    }).estimatedCurrentPensionableMonthly;
  }

  return Math.round(weightedSum / totalWeight);
}

function NiceSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Opt[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "선택";

  const [pos, setPos] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);

  const updatePos = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ left: r.left, top: r.bottom + 8, width: r.width });
  };

  useEffect(() => {
    if (!open) return;
    updatePos();
    const onResize = () => updatePos();
    const onScroll = () => updatePos();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      if (popRef.current?.contains(t)) return;
      setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "relative flex w-full items-center justify-between",
          "h-10 rounded-2xl border border-neutral-200 bg-white px-3",
          "text-left text-sm text-neutral-900 shadow-sm transition",
          "hover:border-neutral-300",
          "focus:outline-none focus:ring-4 focus:ring-neutral-200/60 focus:border-neutral-400",
        ].join(" ")}
      >
        <span className="truncate">{selectedLabel}</span>

        <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-xl text-neutral-500">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && pos
        ? createPortal(
            <div
              ref={popRef}
              style={{
                position: "fixed",
                left: pos.left,
                top: pos.top,
                width: pos.width,
                zIndex: 2000,
                touchAction: "pan-y",
                overscrollBehavior: "contain",
              }}
              className="overflow-x-hidden overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
            >
              <div className="max-h-[260px] overflow-auto p-1">
                {options.map((o) => {
                  const active = o.value === value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => {
                        onChange(o.value);
                        setOpen(false);
                      }}
                      className={[
                        "w-full rounded-xl px-3 py-2 text-left text-xs transition",
                        active
                          ? "bg-neutral-900 text-white"
                          : "text-neutral-900 hover:bg-neutral-100",
                      ].join(" ")}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

export default function BasicInfoForm({
  profile,
  onChange,
  onOpenHistory,
}: {
  profile: BaseProfile;
  onChange: (next: BaseProfile) => void;
  onOpenHistory: () => void;
}) {
  const [picker, setPicker] = useState<PickerKey>(null);
  const [promotionGuideOpen, setPromotionGuideOpen] = useState(false);
  const [promotionOpen, setPromotionOpen] = useState(false);

  const seriesOptions = useMemo(() => {
    return Object.keys(PAY_TABLES).map((id) => {
      const key = id as PayTableId;
      return { value: key, label: PAY_TABLES[key]?.title ?? key };
    });
  }, []);

  const makeColumnOptions = (series: string) => {
    const cols = PAY_TABLES[series as PayTableId]?.columns ?? [];
    return cols.map((c) => ({ value: c.key, label: c.label }));
  };

  const currentColumnOptions = useMemo(
    () => makeColumnOptions(profile.currentSeries ?? profile.series),
    [profile.currentSeries, profile.series]
  );

  const startColumnOptions = useMemo(
    () => makeColumnOptions(profile.startSeries ?? profile.series),
    [profile.startSeries, profile.series]
  );

  const today = new Date().toISOString().slice(0, 10);

  const rawCurrentYears = diffYears(profile.startDate, today);
  const rawTotalYears = diffYears(profile.startDate, profile.retireDate);

  const militaryServiceYears = clampFloat(
    Number(profile.militaryServiceYears ?? 0),
    0,
    3
  );

  const leaveOfAbsenceYears = Math.max(
    0,
    Math.min(30 + 11 / 12, Number(profile.leaveOfAbsenceYears ?? 0))
  );

  const currentYears = Math.max(0, rawCurrentYears - leaveOfAbsenceYears);
  const totalYears = Math.max(0, rawTotalYears - leaveOfAbsenceYears);

  const pensionRecognizedYears = getPensionRecognizedYears(
    totalYears,
    militaryServiceYears
  );

  const birthYear = Number((profile.birthDate ?? "").slice(0, 4));
  const pensionStartAge =
    Number.isFinite(birthYear) && birthYear > 0
      ? pensionStartAgeByBirthYear(birthYear)
      : null;

  const pensionable = calcEstimatedCurrentPensionableMonthly(profile);

  const incomeMode: MoneyMode = profile.incomeMode ?? "auto";
  const promotionItems = (profile.promotions ?? []) as PromotionEntry[];

  const avgIncome =
  incomeMode === "manual"
    ? Number(profile.avgIncomeMonthly ?? 0)
    : calcAverageIncomeWithPromotionsA({
        startSeries: profile.startSeries ?? profile.series,
        startColumnKey: profile.startColumnKey ?? profile.columnKey,
        startStep: profile.startStep ?? profile.step,
        currentSeries: profile.currentSeries ?? profile.series,
        currentColumnKey: profile.currentColumnKey ?? profile.columnKey,
        currentStep: profile.currentStep ?? profile.step,
        totalYears,
        promotions: promotionItems,
        profile,
      });

  const pensionRate = calcPensionRateWithMilitary({
  startDate: profile.startDate,
  retireDate: profile.retireDate,
  militaryServiceYears,
  leaveOfAbsenceYears,
  maxRecognizedYears: 36,
});
  const severanceRecognizedYears = getSeveranceRecognizedYears(totalYears);
  const severanceRate = severanceRateByYears(severanceRecognizedYears);

  useEffect(() => {
    const nextTotalYears = totalYears;
    const nextRecognizedYears = pensionRecognizedYears;
    const nextPensionRate = pensionRate;
    const nextAverageMonthlyBase = avgIncome;

    const changed =
      Number(profile.calculatedTotalYears ?? 0) !== Number(nextTotalYears) ||
      Number(profile.calculatedPensionRecognizedYears ?? 0) !==
        Number(nextRecognizedYears) ||
      Number(profile.calculatedPensionRate ?? 0) !== Number(nextPensionRate) ||
      Number(profile.calculatedAverageMonthlyBase ?? 0) !==
        Number(nextAverageMonthlyBase);

    if (!changed) return;

    onChange({
      ...profile,
      calculatedTotalYears: nextTotalYears,
      calculatedPensionRecognizedYears: nextRecognizedYears,
      calculatedPensionRate: nextPensionRate,
      calculatedAverageMonthlyBase: nextAverageMonthlyBase,
    });
  }, [
    avgIncome,
    onChange,
    pensionRate,
    pensionRecognizedYears,
    profile,
    totalYears,
  ]);

  const update = (patch: Partial<BaseProfile>) =>
    onChange({ ...profile, ...patch });

  const updateMonthlyInputs = (
    patch: Partial<NonNullable<BaseProfile["pensionableMonthlyInputs"]>>
  ) => {
    update({
      pensionableMonthlyInputs: {
        ...(profile.pensionableMonthlyInputs ?? {}),
        ...patch,
      },
    } as Partial<BaseProfile>);
  };

  const updateAutoFlags = (
    patch: Partial<NonNullable<BaseProfile["pensionableAutoFlags"]>>
  ) => {
    update({
      pensionableAutoFlags: {
        ...(profile.pensionableAutoFlags ?? {}),
        ...patch,
      },
    } as Partial<BaseProfile>);
  };

  const openDate = (key: PickerKey) => setPicker(key);

  const applyDate = (ymd: string) => {
    if (!picker) return;

    if (picker === "birthDate") {
      const birthYearValue = Number(ymd.slice(0, 4));
      const autoRetireDate = calcAutoRetireDateFromBirth(ymd, 65);

      update({
        birthDate: ymd,
        pensionStartAge: pensionStartAgeByBirthYear(birthYearValue),
        retireDate: autoRetireDate,
      } as Partial<BaseProfile>);
    }

    if (picker === "startDate") update({ startDate: ymd });
    if (picker === "retireDate") update({ retireDate: ymd });

    setPicker(null);
  };

  const addPromotionRow = () => {
    const firstSeries = profile.currentSeries ?? profile.series;
    const firstCol = makeColumnOptions(firstSeries)[0]?.value ?? "g9";
    const next: PromotionEntry[] = [
      ...promotionItems,
      {
        series: firstSeries,
        columnKey: firstCol,
        years: 6,
      },
    ];
    update({ promotions: next } as Partial<BaseProfile>);
  };

  const setPromotion = (idx: number, patch: Partial<PromotionEntry>) => {
    const next = [...promotionItems];
    next[idx] = { ...next[idx], ...patch };
    update({ promotions: next } as Partial<BaseProfile>);
  };

  const removePromotion = (idx: number) => {
    const next = promotionItems.filter((_, i) => i !== idx);
    update({ promotions: next } as Partial<BaseProfile>);
  };

  return (
    <div className="space-y-4">
      <SectionCard
        title="정보"
        right={
          <button
            type="button"
            onClick={onOpenHistory}
            className="text-xs text-blue-500 hover:underline"
          >
            저장 기록
          </button>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="생년월일">
              <button
                type="button"
                onClick={() => openDate("birthDate")}
                className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-left text-sm"
              >
                {fmtYmd(profile.birthDate)}
              </button>
            </Field>

            <Field label="연금개시연령">
              <div className="flex h-10 items-center rounded-2xl border border-neutral-200 bg-neutral-50 px-3 text-sm">
                {pensionStartAge ? `만 ${pensionStartAge}세` : "생년월일 선택"}
              </div>
            </Field>

            <Field label="임용일">
              <button
                type="button"
                onClick={() => openDate("startDate")}
                className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-left text-sm"
              >
                {fmtYmd(profile.startDate)}
              </button>
            </Field>

            <Field label="퇴직일(예정)">
              <button
                type="button"
                onClick={() => openDate("retireDate")}
                className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-left text-sm"
              >
                {fmtYmd(profile.retireDate)}
              </button>
            </Field>
<Field label="군복무 인정">
              <NiceSelect
                value={String(militaryServiceYears)}
                options={MILITARY_YEAR_OPTIONS}
                onChange={(v) => update({ militaryServiceYears: Number(v) })}
              />
            </Field>

            <Field label="휴직기간(합계)">
              <NiceSelect
                value={String(
                  Math.max(0, Number(profile.leaveOfAbsenceYears ?? 0))
                )}
                options={LEAVE_OF_ABSENCE_OPTIONS}
                onChange={(v) =>
                  update({ leaveOfAbsenceYears: Number(v) })
                }
              />
            </Field>
            <Field label="재직기간(현재)">
              <div className="flex h-10 items-center rounded-2xl border border-neutral-200 bg-neutral-50 px-3 text-sm">
                {formatYearsText(currentYears)}
              </div>
            </Field>

            <Field label="재직기간(총)">
              <div className="flex h-10 items-center rounded-2xl border border-neutral-200 bg-neutral-50 px-3 text-sm">
                {formatYearsText(totalYears)}
              </div>
            </Field>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold text-neutral-600">
              시작 (직렬/직급/호봉)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <NiceSelect
                value={profile.startSeries ?? profile.series}
                options={seriesOptions}
                onChange={(series) => {
                  const first = makeColumnOptions(series)[0]?.value ?? "g9";
                  update({ startSeries: series, startColumnKey: first });
                }}
              />
              <NiceSelect
                value={profile.startColumnKey ?? profile.columnKey}
                options={startColumnOptions}
                onChange={(v) => update({ startColumnKey: v })}
              />
              <NiceSelect
                value={String(profile.startStep ?? profile.step)}
                options={STEP_OPTIONS}
                onChange={(v) =>
                  update({
                    startStep: clampInt(Number(v), 1, 32),
                  })
                }
              />
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold text-neutral-600">
              최종 (직렬/직급/호봉)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <NiceSelect
                value={profile.currentSeries ?? profile.series}
                options={seriesOptions}
                onChange={(series) => {
                  const first = makeColumnOptions(series)[0]?.value ?? "g9";
                  update({ currentSeries: series, currentColumnKey: first });
                }}
              />
              <NiceSelect
                value={profile.currentColumnKey ?? profile.columnKey}
                options={currentColumnOptions}
                onChange={(v) => update({ currentColumnKey: v })}
              />
              <NiceSelect
                value={String(profile.currentStep ?? profile.step)}
                options={STEP_OPTIONS}
                onChange={(v) =>
                  update({
                    currentStep: clampInt(Number(v), 1, 32),
                  })
                }
              />
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-900">
                  승진
                </span>
                <button
                  type="button"
                  onClick={() => setPromotionGuideOpen(true)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-[11px] text-neutral-600"
                  aria-label="승진 평균연수 안내"
                >
                  ?
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPromotionOpen((p) => !p)}
                className="flex items-center justify-center rounded-lg px-1 text-neutral-400"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  className={`transition-transform ${
                    promotionOpen ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {promotionOpen ? (
              <div className="mt-3 space-y-3">
                {promotionItems.map((row, idx) => {
                  const colOpts = makeColumnOptions(row.series);

                  return (
                    <div
                      key={`${idx}-${row.series}-${row.columnKey}-${row.years}`}
                      className="relative rounded-2xl border border-neutral-200 bg-neutral-50 p-3"
                    >
                      <button
                        type="button"
                        onClick={() => removePromotion(idx)}
                        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-700"
                        aria-label="승진 이력 삭제"
                      >
                        <span className="text-base leading-none">✕</span>
                      </button>

                      <div className="grid grid-cols-1 gap-2 pr-8">
                        <Field label="직렬">
                          <NiceSelect
                            value={row.series}
                            options={seriesOptions}
                            onChange={(series) => {
                              const first =
                                makeColumnOptions(series)[0]?.value ?? "g9";
                              setPromotion(idx, {
                                series,
                                columnKey: first,
                              });
                            }}
                          />
                        </Field>

                        <div className="grid min-w-0 grid-cols-[1fr_88px] gap-2">
                          <Field label="직급">
                            <NiceSelect
                              value={row.columnKey}
                              options={colOpts}
                              onChange={(v) =>
                                setPromotion(idx, { columnKey: v })
                              }
                            />
                          </Field>

                          <Field label="연수">
                            <NiceSelect
                              value={String(row.years)}
                              options={PROMOTION_YEAR_OPTIONS}
                              onChange={(v) =>
                                setPromotion(idx, { years: Number(v) })
                              }
                            />
                          </Field>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={addPromotionRow}
                  className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-700"
                >
                  + 승진 이력 추가
                </button>

                <p className="ml-1 text-[11px] leading-5 text-neutral-500">
                  예) 9급으로 5년 근무 후 8급 승진 → 8급 / 5년 입력
                </p>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-neutral-200 p-3">
            <div className="mb-3 text-sm font-semibold text-neutral-900">
              기준소득월액 반영 항목
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="관리업무수당 대상">
                <button
                  type="button"
                  onClick={() =>
                    updateAutoFlags({
                      isManagementEligible:
                        !profile.pensionableAutoFlags?.isManagementEligible,
                    })
                  }
                  className={[
                    "h-10 w-full rounded-2xl border px-3 text-sm",
                    profile.pensionableAutoFlags?.isManagementEligible
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-700",
                  ].join(" ")}
                >
                  {profile.pensionableAutoFlags?.isManagementEligible
                    ? "적용"
                    : "미적용"}
                </button>
              </Field>

              <Field label="관리업무수당 비율">
                <NiceSelect
                  value={String(
                    profile.pensionableAutoFlags?.managementRate ?? 0.09
                  )}
                  options={[
                    { value: "0.09", label: "9.0%" },
                    { value: "0.078", label: "7.8%" },
                  ]}
                  onChange={(v) =>
                    updateAutoFlags({
                      managementRate: Number(v) as 0.078 | 0.09,
                    })
                  }
                />
              </Field>

              <Field label="대우공무원수당 대상">
                <button
                  type="button"
                  onClick={() =>
                    updateAutoFlags({
                      isPwuEligible:
                        !profile.pensionableAutoFlags?.isPwuEligible,
                    })
                  }
                  className={[
                    "h-10 w-full rounded-2xl border px-3 text-sm",
                    profile.pensionableAutoFlags?.isPwuEligible
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-700",
                  ].join(" ")}
                >
                  {profile.pensionableAutoFlags?.isPwuEligible
                    ? "적용"
                    : "미적용"}
                </button>
              </Field>

              <Field label="특수지근무수당">
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatMoney(
                    profile.pensionableMonthlyInputs?.specialArea
                  )}
                  onChange={(e) =>
                    updateMonthlyInputs({
                      specialArea: parseMoney(e.target.value),
                    })
                  }
                  className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-right text-sm"
                />
              </Field>

              <Field label="특수근무수당">
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatMoney(
                    profile.pensionableMonthlyInputs?.specialDuty
                  )}
                  onChange={(e) =>
                    updateMonthlyInputs({
                      specialDuty: parseMoney(e.target.value),
                    })
                  }
                  className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-right text-sm"
                />
              </Field>

              <Field label="위험근무수당">
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatMoney(
                    profile.pensionableMonthlyInputs?.dangerousDuty
                  )}
                  onChange={(e) =>
                    updateMonthlyInputs({
                      dangerousDuty: parseMoney(e.target.value),
                    })
                  }
                  className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-right text-sm"
                />
              </Field>

              <Field label="기타 포함 월수당">
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatMoney(
                    profile.pensionableMonthlyInputs?.taxableEtcIncluded
                  )}
                  onChange={(e) =>
                    updateMonthlyInputs({
                      taxableEtcIncluded: parseMoney(e.target.value),
                    })
                  }
                  className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-right text-sm"
                />
              </Field>
            </div>
          </div>
        </div>
      </SectionCard>

            <SectionCard title="산출결과">
        <div className="grid grid-cols-2 gap-3">
          <Field label="최종기준소득월액(예상)">
            <div className="flex h-10 items-center justify-end rounded-2xl border border-neutral-200 bg-neutral-50 px-3 text-sm">
              {pensionable.estimatedCurrentPensionableMonthly.toLocaleString(
                "ko-KR"
              )}
              원
            </div>
          </Field>

          <Field label="평균기준소득월액(예상)">
            <div className="flex h-10 items-center justify-end rounded-2xl border border-neutral-200 bg-neutral-50 px-3 text-sm">
              {avgIncome.toLocaleString("ko-KR")}원
            </div>
          </Field>

          <Field label="재직기간(총)">
            <div className="flex h-10 items-center justify-end rounded-2xl border border-neutral-200 bg-neutral-50 px-3 text-sm">
              {formatYearsText(totalYears)}
            </div>
          </Field>

          <Field label="연금 인정연수">
            <div className="flex h-10 items-center justify-end rounded-2xl border border-neutral-200 bg-neutral-50 px-3 text-sm">
              {pensionRecognizedYears >= 36
                ? "36년(최대)"
                : formatYearsText(pensionRecognizedYears)}
            </div>
          </Field>

          <Field label="지급률(연금)">
            <div className="flex h-10 items-center justify-end rounded-2xl border border-neutral-200 bg-neutral-50 px-3 text-sm">
              {pensionRate.toFixed(2)}%
            </div>
          </Field>

          <Field label="지급률(퇴직수당)">
            <div className="flex h-10 items-center justify-end rounded-2xl border border-neutral-200 bg-neutral-50 px-3 text-sm">
              {severanceRate.toFixed(2)}%
            </div>
          </Field>
        </div>
      </SectionCard>

            <SectionCard title="< 참고 > (2024년 기준)">
  <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-4">
    <div className="flex justify-center text-sm text-neutral-700">
      <div className="space-y-1 leading-6 text-center">
        <div>
          1인당 평균기준소득월액{" "}
          <span className="font-semibold text-neutral-900">
            517만원
          </span>
        </div>

        <div>
          1인당 평균 연금수령액{" "}
          <span className="font-semibold text-neutral-900">
            274만원
          </span>
        </div>
      </div>
    </div>
  </div>
</SectionCard>

      {promotionGuideOpen ? (
        <div className="fixed inset-0 z-[210]">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setPromotionGuideOpen(false)}
            aria-label="닫기"
          />

          <div className="absolute left-1/2 top-1/2 w-[92%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-5 shadow-2xl">
            <div className="text-center text-base font-semibold text-neutral-900">
              1~8급 평균 승진연수
            </div>

            <div className="mt-4 divide-y divide-neutral-100">
              {DEFAULT_PROMOTION_YEARS.map((x) => (
                <div
                  key={x.grade}
                  className="flex items-center justify-center gap-20 py-3"
                >
                  <span className="min-w-[44px] text-center text-sm font-medium text-neutral-800">
                    {x.grade}
                  </span>
                  <span className="min-w-[44px] text-center text-sm text-neutral-700">
                    {x.years}년
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setPromotionGuideOpen(false)}
              className="mt-5 w-full rounded-xl bg-neutral-900 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98]"
              type="button"
            >
              확인
            </button>
          </div>
        </div>
      ) : null}

      <DateWheelModal
        open={picker !== null}
        title="날짜 선택"
        value={
          picker === "birthDate"
            ? profile.birthDate ?? today
            : picker === "startDate"
            ? profile.startDate ?? today
            : profile.retireDate ?? today
        }
        onClose={() => {
          setPicker(null);
        }}
        onConfirm={(next) => applyDate(next)}
      />
    </div>
  );
}