"use client";

import React, { useMemo } from "react";
import type { BaseProfile } from "@/lib/domain/profile/types";
import SectionCard from "@/components/common/SectionCard";
import { calcSeverance } from "@/lib/domain/severance/calc";
import { calcEstimatedCurrentPensionableMonthly } from "@/lib/domain/pensionableIncome/calc";

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

function formatYearsText(years: number) {
  const safe = Math.max(0, years);
  const y = Math.floor(safe);
  const months = Math.floor((safe - y) * 12);
  return `${y}년 ${months}개월`;
}

function formatAppliedYearsText(totalYears: number, cappedYears: number) {
  if (totalYears > 33) return "33년(최대)";
  return formatYearsText(cappedYears);
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-white/75">{label}</div>
      <div className="font-medium text-white">{value}</div>
    </div>
  );
}

export default function SeveranceStub({ profile }: { profile: BaseProfile }) {
  const pensionable = useMemo(
  () => calcEstimatedCurrentPensionableMonthly(profile),
  [profile]
);

const result = useMemo(
  () =>
    calcSeverance(
      profile,
      pensionable.estimatedCurrentPensionableMonthly
    ),
  [profile, pensionable]
);

  const maxNet = Math.max(
    ...result.gradeSimulation.map((x) => x.estimatedNet),
    1
  );

  return (
    <div className="space-y-4">
      <SectionCard title="퇴직수당 예상">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-xs text-neutral-500">재직기간(총)</div>
            <div className="mt-1 text-base font-semibold text-neutral-900">
              {formatYearsText(result.totalYears)}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-xs text-neutral-500">퇴직수당 반영연수</div>
            <div className="mt-1 text-base font-semibold text-neutral-900">
              {formatAppliedYearsText(result.totalYears, result.cappedYears)}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-xs text-neutral-500">적용 지급률</div>
            <div className="mt-1 text-base font-semibold text-neutral-900">
              {result.appliedRate.toFixed(2)}%
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-xs text-neutral-500">최종기준소득월액(예상)</div>
            <div className="mt-1 text-base font-semibold text-neutral-900">
              {formatMoney(pensionable.estimatedCurrentPensionableMonthly)}
            </div>
          </div>
        </div>

        {result.totalYears > 33 && (
  <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] leading-5 text-amber-800">
    퇴직수당 인정연수는 <span className="font-semibold">최대 33년까지만 반영</span>
    됩니다.
    <br />
    계산된 퇴직수당 인정연수는 {formatYearsText(result.cappedYears)}입니다.
  </div>
)}
      </SectionCard>

      <section className="rounded-3xl bg-neutral-900 p-5 text-white">
        <div className="text-xs text-white/70">실수령액(예상)</div>
        <div className="mt-2 text-2xl font-semibold tracking-tight">
          {formatMoney(result.estimatedNet)}
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <Row label="퇴직수당 총액" value={formatMoney(result.gross)} />
          <div className="my-2 h-px bg-white/10" />
          <Row label="퇴직소득세" value={formatMoney(result.estimatedTax)} />
          <Row label="지방소득세" value={formatMoney(result.estimatedLocalTax)} />
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
              Math.round((item.estimatedNet / maxNet) * 100)
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
                      반영연수{" "}
                      {formatAppliedYearsText(item.years, item.cappedYears)} ·
                      지급률 {item.rate.toFixed(2)}%
                    </div>
                    <div className="mt-0.5 text-[11px] text-neutral-500">
                      기준소득월액 {formatMoney(item.monthlyBase)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold text-neutral-900">
                      {formatMoney(item.estimatedNet)}
                    </div>
                    <div className="mt-0.5 text-[11px] text-neutral-500">
                      총액 {formatMoney(item.gross)}
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
      </SectionCard>
    </div>
  );
}