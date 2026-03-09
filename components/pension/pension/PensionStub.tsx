"use client";

import React, { useMemo } from "react";
import type { BaseProfile, PromotionEntry } from "@/lib/domain/profile/types";
import SectionCard from "@/components/common/SectionCard";
import { calcEstimatedCurrentPensionableMonthly } from "@/lib/domain/pensionableIncome/calc";
import { calcPension } from "@/lib/domain/pension/calc";
import { getPay, type PayTableId } from "@/lib/payTables";

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

function formatYearsText(years: number) {
  const safe = Math.max(0, years);
  const y = Math.floor(safe);
  const months = Math.floor((safe - y) * 12);
  return `${y}년 ${months}개월`;
}

function diffYears(start?: string, end?: string) {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
  if (e < s) return 0;
  return (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24 * 365.2425);
}

function clampInt(n: number, min: number, max: number) {
  const x = Math.trunc(Number.isFinite(n) ? n : min);
  return Math.min(max, Math.max(min, x));
}

function getStepPay(series: string, columnKey: string, step: number) {
  return getPay(series as PayTableId, columnKey, clampInt(step, 1, 32)) ?? 0;
}

type CareerSegment = {
  series: string;
  columnKey: string;
  years: number;
};

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

function calcAverageIncomeForDisplay(
  profile: BaseProfile,
  currentPensionableMonthly: number
) {
  if ((profile.incomeMode ?? "auto") === "manual") {
    return Math.max(0, Number(profile.avgIncomeMonthly ?? 0));
  }

  const leaveOfAbsenceYears = Math.max(
  0,
  Number(profile.leaveOfAbsenceYears ?? 0)
);
const totalYearsRaw = diffYears(profile.startDate, profile.retireDate);
const totalYears = Math.min(
  36,
  Math.max(0, totalYearsRaw - leaveOfAbsenceYears)
);

  const promotionItems = (profile.promotions ?? []) as PromotionEntry[];

  const validPromotions = promotionItems.filter(
    (x) => x.series && x.columnKey && Number(x.years) > 0
  );

  if (!validPromotions.length) {
    return Math.round(currentPensionableMonthly * 0.9);
  }

  const segments = buildCareerSegments({
    startSeries: profile.startSeries ?? profile.series,
    startColumnKey: profile.startColumnKey ?? profile.columnKey,
    currentSeries: profile.currentSeries ?? profile.series,
    currentColumnKey: profile.currentColumnKey ?? profile.columnKey,
    totalYears,
    promotions: promotionItems,
  });

  if (!segments.length) {
    return Math.round(currentPensionableMonthly * 0.9);
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
    return Math.round(currentPensionableMonthly * 0.9);
  }

  return Math.round(weightedSum / totalWeight);
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-white/75">{label}</div>
      <div className="font-medium text-white">{value}</div>
    </div>
  );
}

export default function PensionStub({ profile }: { profile: BaseProfile }) {
  const pensionable = useMemo(
    () => calcEstimatedCurrentPensionableMonthly(profile),
    [profile]
  );

  const result = useMemo(
  () =>
    calcPension(profile, {
      currentMonthlyBase: pensionable.estimatedCurrentPensionableMonthly,
    }),
  [profile, pensionable]
);

  const maxNet = Math.max(
    ...result.gradeSimulation.map((x) => x.estimatedNetPension),
    1
  );

  return (
    <div className="space-y-4">
      <SectionCard title="연금 예상">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-xs text-neutral-500">총 재직연수</div>
            <div className="mt-1 text-base font-semibold text-neutral-900">
              {formatYearsText(result.totalYears)}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-xs text-neutral-500">연금 인정연수</div>
            <div className="mt-1 text-base font-semibold text-neutral-900">
  {result.recognizedYears >= 36
    ? "36년(최대)"
    : formatYearsText(result.recognizedYears)}
</div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-xs text-neutral-500">적용 지급률</div>
            <div className="mt-1 text-base font-semibold text-neutral-900">
              {result.pensionRate.toFixed(2)}%
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-xs text-neutral-500">평균기준소득월액(예상)</div>
            <div className="mt-1 text-base font-semibold text-neutral-900">
              {formatMoney(result.averageMonthlyBase)}
            </div>
          </div>
        </div>

        {result.recognizedYears >= 36 && (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] leading-5 text-amber-800">
            연금 인정연수는 <span className="font-semibold">최대 36년까지만 반영</span>
            됩니다.
            <br />
            계산된 연금 인정연수는 {formatYearsText(result.recognizedYears)}입니다.
          </div>
        )}
      </SectionCard>

      <section className="rounded-3xl bg-neutral-900 p-5 text-white">
        <div className="text-xs text-white/70">실수령액(예상)</div>
        <div className="mt-2 text-2xl font-semibold tracking-tight">
          {formatMoney(result.monthlyPensionNet)}
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <Row label="월 연금 총액" value={formatMoney(result.monthlyPensionGross)} />
          <div className="my-2 h-px bg-white/10" />
          <Row label="공제 합계(추정)" value={formatMoney(result.deductionsTotal)} />
        </div>
      </section>

      <div className="ml-3 text-xs text-neutral-500">
        * 실수령액은 예상액입니다.
      </div>

      <SectionCard title="같은 근속연수 기준 직급별 비교">
        <div className="space-y-3">
          {result.gradeSimulation.map((item) => {
            const width = Math.max(
              8,
              Math.round((item.estimatedNetPension / maxNet) * 100)
            );

            return (
              <div
                key={item.key}
                className="rounded-2xl border border-neutral-200 bg-white p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">
                      {item.label}
                    </div>
                    <div className="mt-0.5 text-[11px] text-neutral-500">
                      인정연수 {formatYearsText(item.recognizedYears)} ·
                      지급률 {item.pensionRate.toFixed(2)}%
                    </div>
                    <div className="mt-0.5 text-[11px] text-neutral-500">
                      평균기준소득월액 {formatMoney(item.averageMonthlyBase)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold text-neutral-900">
                      {formatMoney(item.estimatedNetPension)}
                    </div>
                    <div className="mt-0.5 text-[11px] text-neutral-500">
                      총액 {formatMoney(item.monthlyPensionGross)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-neutral-900 transition-all"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 text-[11px] leading-5 text-neutral-500">
          동일한 근속연수와 연금 인정연수를 기준으로, 직급별 평균기준소득월액 차이에 따라 예상 연금액을 비교한 값입니다.
        </div>
      </SectionCard>
    </div>
  );
}