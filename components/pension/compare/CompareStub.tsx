"use client";

import React, { useMemo } from "react";
import type { BaseProfile } from "@/lib/domain/profile/types";
import SectionCard from "@/components/common/SectionCard";
import { calcCompare } from "@/lib/domain/compare/calc";

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-[28px] border border-neutral-200 bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
      <div className="text-[12px] font-medium text-neutral-500">{label}</div>
      <div className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-neutral-950">
        {value}
      </div>
      {sub ? <div className="mt-2 text-[11px] text-neutral-500">{sub}</div> : null}
    </div>
  );
}

function PremiumGauge({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const safe = Math.max(0, Math.min(value, 100));

  return (
    <div className="rounded-[28px] border border-neutral-200 bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[13px] font-medium text-neutral-500">{label}</div>
        <div className="text-right">
          <div className="text-[28px] font-semibold tracking-[-0.03em] text-neutral-950">
            {formatPercent(value)}
          </div>
        </div>
      </div>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-500"
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}

function PremiumBar({
  label,
  value,
  max,
  tone = "neutral",
}: {
  label: string;
  value: number;
  max: number;
  tone?: "neutral" | "dark";
}) {
  const width = max > 0 ? Math.max(4, (value / max) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] text-neutral-600">{label}</span>
        <span className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-950">
          {formatMoney(value)}
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-neutral-200">
        <div
          className={[
            "h-full rounded-full transition-all duration-500",
            tone === "dark" ? "bg-neutral-900" : "bg-neutral-500",
          ].join(" ")}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function ReceiptCard({
  label,
  ratio,
  value,
}: {
  label: string;
  ratio: number;
  value: number;
}) {
  return (
    <div className="rounded-[24px] border border-neutral-200 bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[14px] font-semibold text-neutral-900">{label}</div>
          <div className="mt-1 text-[12px] text-neutral-500">
            납부액 대비 {ratio.toFixed(1)}%
          </div>
        </div>
        <div className="text-right text-[15px] font-semibold tracking-[-0.02em] text-neutral-950">
          {formatMoney(value)}
        </div>
      </div>
    </div>
  );
}

function ReplacementDetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-[12px] text-neutral-500">{label}</span>
      <span className="text-[13px] font-semibold text-neutral-900">{value}</span>
    </div>
  );
}

export default function CompareStub({ profile }: { profile: BaseProfile }) {
  const result = useMemo(() => calcCompare(profile), [profile]);

  const chartItems = [
    { label: "총 납부액", value: result.totalContribution, tone: "dark" as const },
    { label: "10년 총수령액", value: result.buckets[0]?.totalReceipt ?? 0, tone: "neutral" as const },
    { label: "20년 총수령액", value: result.buckets[1]?.totalReceipt ?? 0, tone: "neutral" as const },
    { label: "30년 총수령액", value: result.buckets[2]?.totalReceipt ?? 0, tone: "neutral" as const },
  ];

  const max = Math.max(...chartItems.map((x) => x.value), 1);

  return (
    <div className="space-y-4">
      <SectionCard>
  <div className="grid grid-cols-1 gap-3">
    <StatCard
      label="월 납부액(추정)"
      value={formatMoney(result.monthlyContribution)}
      sub="평균기준소득월액 × 9%"
    />
    <StatCard
      label="총 납부액(추정)"
      value={formatMoney(result.totalContribution)}
      sub="월 납부액 × 인정연수 × 12개월"
    />
  </div>
</SectionCard>

<SectionCard title="납부액 vs 총수령액">
        <div className="rounded-[28px] border border-neutral-200 bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
          <div className="space-y-4">
            {chartItems.map((item) => (
              <PremiumBar
                key={item.label}
                label={item.label}
                value={item.value}
                max={max}
                tone={item.tone}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {result.buckets.map((bucket) => (
            <ReceiptCard
              key={bucket.label}
              label={bucket.label}
              ratio={bucket.receiptVsContributionRatio}
              value={bucket.totalReceipt}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="소득대체율">
        <div className="space-y-3">
          <PremiumGauge
            label="최종기준소득월액 대비"
            value={result.incomeReplacementRate}
          />
          <PremiumGauge
            label="평균기준소득월액 대비"
            value={result.incomeReplacementRateVsAverage}
          />

          <div className="rounded-[28px] border border-neutral-200 bg-white px-4 py-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
            <div className="text-[13px] font-semibold text-neutral-900">
              소득대체율 산출 내역
            </div>

            <div className="mt-3 divide-y divide-neutral-100">
              <ReplacementDetailRow
                label="예상 월 연금"
                value={formatMoney(result.estimatedMonthlyPension)}
              />
              <ReplacementDetailRow
                label="최종기준소득월액"
                value={formatMoney(result.pensionCurrentMonthlyBase)}
              />
              <ReplacementDetailRow
                label="평균기준소득월액"
                value={formatMoney(result.pensionAverageMonthlyBase)}
              />
            </div>

            <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-3 py-3 text-[11px] leading-5 text-blue-900">
              소득대체율은 예상 월 연금을 기준소득월액으로 나눈 비율이에요.
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}