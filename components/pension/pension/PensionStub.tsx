"use client";

import React, { useMemo } from "react";
import type { BaseProfile } from "@/lib/domain/profile/types";
import SectionCard from "@/components/common/SectionCard";
import { calcEstimatedCurrentPensionableMonthly } from "@/lib/domain/pensionableIncome/calc";
import { calcPension } from "@/lib/domain/pension/calc";

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

function formatYearsText(years: number) {
  const safe = Math.max(0, years);
  const y = Math.floor(safe);
  const months = Math.floor((safe - y) * 12);
  return `${y}년 ${months}개월`;
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
            <div className="text-xs text-neutral-500">재직기간(총)</div>
            <div className="mt-1 text-base font-semibold text-neutral-900">
              {result.totalYears >= 36
                ? "36년(최대)"
                : formatYearsText(result.totalYears)}
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
                      인정연수 {formatYearsText(item.recognizedYears)} · 지급률{" "}
                      {item.pensionRate.toFixed(2)}%
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
      </SectionCard>
    </div>
  );
}