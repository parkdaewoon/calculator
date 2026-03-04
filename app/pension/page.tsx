"use client";

import { useMemo, useState } from "react";
import AdsenseSlot from "@/components/AdsenseSlot";

type PensionTab = "input" | "result" | "charts" | "detail" | "simulate";

type Inputs = {
  appointYear: number;
  currentGrade: number;
  currentMonthlyPay: number;
  retireYear: number;
  expectPromotion: boolean;
  includeMilitary: boolean;
};

function won(n: number) {
  return `${Math.max(0, Math.trunc(n)).toLocaleString("ko-KR")}원`;
}

function num(v: string, fallback = 0) {
  const cleaned = v.replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function yearsBetween(start: number, end: number) {
  return Math.max(0, end - start + 1);
}

export default function PensionPage() {
  const now = new Date();
  const thisYear = now.getFullYear();

  const [openInputs, setOpenInputs] = useState(true);
  const [tab, setTab] = useState<PensionTab>("input");
  const [inputs, setInputs] = useState<Inputs>({
    appointYear: thisYear - 12,
    currentGrade: 7,
    currentMonthlyPay: 3_397_240,
    retireYear: thisYear + 23,
    expectPromotion: true,
    includeMilitary: true,
  });

  const result = useMemo(() => {
    const serviceYears = yearsBetween(inputs.appointYear, inputs.retireYear);
    const militaryYears = inputs.includeMilitary ? 2 : 0;
    const totalYears = serviceYears + militaryYears;

    const growthRate = (inputs.expectPromotion ? 0.032 : 0.022) + 0.015; // 승진 + 물가/임금상승 가정
    const projectedFinalPay = Math.round(
      inputs.currentMonthlyPay * Math.pow(1 + growthRate, Math.max(0, inputs.retireYear - thisYear))
    );

    // MVP 추정 모델: 소득대체율 1.9% * 가입연수 (상한 62%)
    const replacementRate = clamp(totalYears * 0.019, 0.18, 0.62);
    const estimatedMonthlyPension = Math.round(projectedFinalPay * replacementRate);

    const contributionRate = 0.09;
    const totalContribution = Math.round(
      inputs.currentMonthlyPay * contributionRate * 12 * totalYears * 1.12 // 평균 상승분 근사
    );

    const receive20y = estimatedMonthlyPension * 12 * 20;

    const startAge = 35;
    const retireAge = startAge + serviceYears;
    const ages = Array.from({ length: 26 }, (_, i) => retireAge - 5 + i);

    const pensionTrend = ages.map((age) => {
      const diff = age - retireAge;
      const factor = diff < 0 ? Math.max(0.72, 1 + diff * 0.05) : 1 + diff * 0.015;
      return {
        age,
        amount: Math.round(estimatedMonthlyPension * factor),
      };
    });

    const replacementTrend = ages.map((age) => {
      const diff = age - retireAge;
      const factor = diff < 0 ? Math.max(0.8, 1 + diff * 0.03) : 1 + diff * 0.005;
      return {
        age,
        rate: clamp(replacementRate * factor, 0.12, 0.8),
      };
    });

    return {
      serviceYears,
      totalYears,
      projectedFinalPay,
      replacementRate,
      estimatedMonthlyPension,
      totalContribution,
      receive20y,
      pensionTrend,
      replacementTrend,
      retireAge,
    };
  }, [inputs, thisYear]);

  const compareCards = [
    {
      label: "+1년 더 근무하면?",
      value: Math.round(result.estimatedMonthlyPension * 1.022),
    },
    {
      label: "승진 반영 OFF",
      value: Math.round(result.estimatedMonthlyPension * 0.91),
    },
    {
      label: "보수 5% 추가 상승",
      value: Math.round(result.estimatedMonthlyPension * 1.05),
    },
  ];

  return (
    <div className="space-y-4 pb-6">
      <AdsenseSlot />

      <section className="grid grid-cols-2 gap-3">
        <Card title="예상 퇴직연도" value={`${inputs.retireYear}년`} />
        <Card title="예상 월 연금액" value={won(result.estimatedMonthlyPension)} />
        <Card title="총 납부기간" value={`${result.totalYears}년`} />
        <Card title="소득대체율" value={`${(result.replacementRate * 100).toFixed(1)}%`} />
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-2 shadow-sm">
        <div className="grid grid-cols-5 gap-1">
          {[
            ["input", "입력"],
            ["result", "결과"],
            ["charts", "그래프"],
            ["detail", "상세"],
            ["simulate", "시뮬"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key as PensionTab)}
              className={[
                "rounded-2xl px-2 py-2 text-xs font-medium",
                tab === key ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-50",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {tab === "input" ? (
        <section className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
          <button
            type="button"
            className="flex w-full items-center justify-between"
            onClick={() => setOpenInputs((v) => !v)}
          >
            <h2 className="text-sm font-semibold text-neutral-900">기본 정보 입력</h2>
            <span className="text-xs text-neutral-500">{openInputs ? "접기" : "펼치기"}</span>
          </button>

          {openInputs ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Input
                label="임용년도"
                value={inputs.appointYear}
                onChange={(v) => setInputs((p) => ({ ...p, appointYear: clamp(v, 1980, 2099) }))}
              />
              <Input
                label="현재 직급"
                value={inputs.currentGrade}
                onChange={(v) => setInputs((p) => ({ ...p, currentGrade: clamp(v, 1, 9) }))}
              />
              <Input
                label="현재 보수월액"
                value={inputs.currentMonthlyPay}
                onChange={(v) => setInputs((p) => ({ ...p, currentMonthlyPay: Math.max(0, v) }))}
              />
              <Input
                label="예상 퇴직년도"
                value={inputs.retireYear}
                onChange={(v) => setInputs((p) => ({ ...p, retireYear: clamp(v, thisYear, 2100) }))}
              />

              <Toggle
                label="승진 예상"
                checked={inputs.expectPromotion}
                onChange={(checked) => setInputs((p) => ({ ...p, expectPromotion: checked }))}
              />
              <Toggle
                label="군복무 포함"
                checked={inputs.includeMilitary}
                onChange={(checked) => setInputs((p) => ({ ...p, includeMilitary: checked }))}
              />
            </div>
          ) : null}
        </section>
      ) : null}

      {tab === "result" ? (
        <section className="rounded-3xl bg-neutral-900 p-5 text-white shadow-sm">
          <div className="text-sm text-white/70">예상 연금 결과</div>
          <div className="mt-2 text-3xl font-bold tracking-tight">{won(result.estimatedMonthlyPension)}</div>
          <div className="mt-2 text-sm text-white/80">
            예상 퇴직 시 총 납부액 {won(result.totalContribution)} · 20년 수령 총액 {won(result.receive20y)}
          </div>
        </section>
      ) : null}

      {tab === "charts" ? (
        <section className="space-y-3 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-900">그래프 시각화</h3>
          <SimpleLineChart
            title="연금 예상 월 수령액 추이"
            data={result.pensionTrend.map((d) => d.amount)}
            labels={result.pensionTrend.map((d) => `${d.age}세`)}
            formatter={(v) => `${Math.round(v / 10000)}만원`}
          />

          <BarCompare
            title="납부액 vs 20년 수령액"
            leftLabel="총 납부액"
            leftValue={result.totalContribution}
            rightLabel="20년 총 수령액"
            rightValue={result.receive20y}
          />

          <SimpleLineChart
            title="소득대체율 변화"
            data={result.replacementTrend.map((d) => Math.round(d.rate * 1000) / 10)}
            labels={result.replacementTrend.map((d) => `${d.age}세`)}
            formatter={(v) => `${v.toFixed(1)}%`}
          />
        </section>
      ) : null}

      {tab === "detail" ? (
        <section className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-900">상세 계산 내역</h3>
          <ul className="mt-2 space-y-1 text-sm text-neutral-600">
            <li>• 기준소득월액(추정): {won(result.projectedFinalPay)}</li>
            <li>• 적용률(소득대체율): {(result.replacementRate * 100).toFixed(1)}%</li>
            <li>• 재직기간(군복무 포함): {result.totalYears}년</li>
            <li>• 조기퇴직 감액은 연령별 시뮬레이션 그래프에서 반영</li>
          </ul>
        </section>
      ) : null}

      {tab === "simulate" ? (
        <section className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-900">시뮬레이션 비교</h3>
          <div className="mt-3 grid grid-cols-1 gap-2">
            {compareCards.map((c) => (
              <div key={c.label} className="rounded-2xl border border-neutral-200 p-3">
                <div className="text-xs text-neutral-500">{c.label}</div>
                <div className="mt-1 text-lg font-semibold text-neutral-900">{won(c.value)}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
      <div className="text-xs text-neutral-500">{title}</div>
      <div className="mt-1 text-base font-semibold text-neutral-900">{value}</div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-neutral-500">{label}</div>
      <input
        inputMode="numeric"
        value={value.toLocaleString("ko-KR")}
        onChange={(e) => onChange(Math.trunc(num(e.target.value)))}
        className="w-full rounded-2xl border border-neutral-200 px-3 py-2 text-sm"
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        "rounded-2xl border px-3 py-2 text-left text-sm",
        checked
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 bg-white text-neutral-700",
      ].join(" ")}
    >
      {label}: {checked ? "반영" : "미반영"}
    </button>
  );
}

function SimpleLineChart({
  title,
  data,
  labels,
  formatter,
}: {
  title: string;
  data: number[];
  labels: string[];
  formatter: (v: number) => string;
}) {
  const w = 320;
  const h = 120;
  const pad = 16;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = Math.max(1, max - min);

  const points = data
    .map((v, i) => {
      const x = pad + (i * (w - pad * 2)) / Math.max(1, data.length - 1);
      const y = h - pad - ((v - min) * (h - pad * 2)) / range;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-2xl border border-neutral-200 p-3">
      <div className="text-xs font-semibold text-neutral-700">{title}</div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full">
        <polyline fill="none" stroke="#171717" strokeWidth="2" points={points} />
      </svg>
      <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500">
        <span>{labels[0]}</span>
        <span>{formatter(data[Math.floor(data.length / 2)] ?? 0)}</span>
        <span>{labels[data.length - 1]}</span>
      </div>
    </div>
  );
}

function BarCompare({
  title,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  title: string;
  leftLabel: string;
  leftValue: number;
  rightLabel: string;
  rightValue: number;
}) {
  const max = Math.max(leftValue, rightValue, 1);
  const lw = Math.round((leftValue / max) * 100);
  const rw = Math.round((rightValue / max) * 100);

  return (
    <div className="rounded-2xl border border-neutral-200 p-3">
      <div className="text-xs font-semibold text-neutral-700">{title}</div>
      <div className="mt-2 space-y-2 text-xs">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-neutral-500">{leftLabel}</span>
            <span className="font-medium text-neutral-900">{won(leftValue)}</span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100">
            <div className="h-2 rounded-full bg-neutral-700" style={{ width: `${lw}%` }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-neutral-500">{rightLabel}</span>
            <span className="font-medium text-neutral-900">{won(rightValue)}</span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100">
            <div className="h-2 rounded-full bg-neutral-900" style={{ width: `${rw}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}