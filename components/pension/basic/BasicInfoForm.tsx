"use client";

import React, { useMemo, useState } from "react";
import type { BaseProfile } from "@/lib/domain/profile/types";
import { getPay, PAY_TABLES, type PayTableId } from "@/lib/payTables";
import SectionCard from "@/components/common/SectionCard";
import Field from "@/components/common/Field";
import DateWheelModal from "@/components/ui/wheel/presets/DateWheelModal";

type PickerKey = "birthDate" | "startDate" | "retireDate" | "promotionDate" | null;

type MoneyMode = "auto" | "manual";

type PromotionEntry = {
  series: string;
  columnKey: string;
  promotedAt: string;
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

function clampInt(n: number, min: number, max: number) {
  const x = Math.trunc(Number.isFinite(n) ? n : min);
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

function formatYearsText(years: number) {
  const safe = Math.max(0, years);
  const y = Math.floor(safe);
  const months = Math.floor((safe - y) * 12);
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

function severanceRateByYears(years: number) {
  if (years >= 20) return 39;
  if (years >= 15) return 32.5;
  if (years >= 10) return 29.25;
  if (years >= 5) return 22.57;
  if (years >= 1) return 6.5;
  return 0;
}

function pensionRateByYears(years: number) {
  const rate = years * 1.7;
  return Math.max(0, Math.min(rate, 100));
}

function ProfileSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
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
  const [promotionPickerIndex, setPromotionPickerIndex] = useState<number | null>(null);

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
  const currentYears = diffYears(profile.startDate, today);
  const totalYears = diffYears(profile.startDate, profile.retireDate);

  const birthYear = Number((profile.birthDate ?? "").slice(0, 4));
  const pensionStartAge = Number.isFinite(birthYear) && birthYear > 0
    ? pensionStartAgeByBirthYear(birthYear)
    : null;

  const currentPay = getPay(
    (profile.currentSeries ?? profile.series) as PayTableId,
    profile.currentColumnKey ?? profile.columnKey,
    profile.currentStep ?? profile.step
  ) ?? 0;

  const incomeMode: MoneyMode = profile.incomeMode ?? "auto";
  const avgIncome = incomeMode === "manual"
    ? Number(profile.avgIncomeMonthly ?? 0)
    : Math.round(currentPay * 0.9);

  const pensionRate = pensionRateByYears(totalYears);
  const severanceRate = severanceRateByYears(totalYears);

  const promotionItems = profile.promotions ?? [];

  const update = (patch: Partial<BaseProfile>) => onChange({ ...profile, ...patch });

  const openDate = (key: PickerKey) => setPicker(key);
  const applyDate = (ymd: string) => {
    if (!picker) return;
    if (picker === "birthDate") {
      update({ birthDate: ymd, pensionStartAge: pensionStartAgeByBirthYear(Number(ymd.slice(0, 4))) });
    }
    if (picker === "startDate") update({ startDate: ymd });
    if (picker === "retireDate") update({ retireDate: ymd });
    if (picker === "promotionDate") {
      const next = [...promotionItems];
      const i = promotionPickerIndex ?? -1;
      if (i >= 0 && next[i]) next[i] = { ...next[i], promotedAt: ymd };
      update({ promotions: next });
      setPromotionPickerIndex(null);
    }
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
        promotedAt: today,
        years: 6,
      },
    ];
    update({ promotions: next });
  };

  const setPromotion = (idx: number, patch: Partial<PromotionEntry>) => {
    const next = [...promotionItems];
    next[idx] = { ...next[idx], ...patch };
    update({ promotions: next });
  };

  return (
    <div className="space-y-4">
      <SectionCard
        title="정보 카드"
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
              <button type="button" onClick={() => openDate("birthDate")} className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-left text-sm">
                {fmtYmd(profile.birthDate)}
              </button>
            </Field>

            <Field label="연금개시연령">
              <div className="h-10 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 text-sm flex items-center">
                {pensionStartAge ? `만 ${pensionStartAge}세` : "생년월일 선택"}
              </div>
            </Field>

            <Field label="임용일">
              <button type="button" onClick={() => openDate("startDate")} className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-left text-sm">
                {fmtYmd(profile.startDate)}
              </button>
            </Field>

            <Field label="퇴직일(예정)">
              <button type="button" onClick={() => openDate("retireDate")} className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-left text-sm">
                {fmtYmd(profile.retireDate)}
              </button>
            </Field>

            <Field label="재직기간(현재)">
              <div className="h-10 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 text-sm flex items-center">
                {formatYearsText(currentYears)}
              </div>
            </Field>

            <Field label="재직기간(총)">
              <div className="h-10 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 text-sm flex items-center">
                {formatYearsText(totalYears)}
              </div>
            </Field>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold text-neutral-600">시작 (직렬/직급/호봉)</div>
            <div className="grid grid-cols-3 gap-2">
              <ProfileSelect
                value={profile.startSeries ?? profile.series}
                options={seriesOptions}
                onChange={(series) => {
                  const first = makeColumnOptions(series)[0]?.value ?? "g9";
                  update({ startSeries: series, startColumnKey: first });
                }}
              />
              <ProfileSelect
                value={profile.startColumnKey ?? profile.columnKey}
                options={startColumnOptions}
                onChange={(v) => update({ startColumnKey: v })}
              />
              <input
                inputMode="numeric"
                value={profile.startStep ?? profile.step}
                onChange={(e) => update({ startStep: clampInt(Number(e.target.value), 1, 32) })}
                className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold text-neutral-600">현재 (직렬/직급/호봉)</div>
            <div className="grid grid-cols-3 gap-2">
              <ProfileSelect
                value={profile.currentSeries ?? profile.series}
                options={seriesOptions}
                onChange={(series) => {
                  const first = makeColumnOptions(series)[0]?.value ?? "g9";
                  update({ currentSeries: series, currentColumnKey: first });
                }}
              />
              <ProfileSelect
                value={profile.currentColumnKey ?? profile.columnKey}
                options={currentColumnOptions}
                onChange={(v) => update({ currentColumnKey: v })}
              />
              <input
                inputMode="numeric"
                value={profile.currentStep ?? profile.step}
                onChange={(e) => update({ currentStep: clampInt(Number(e.target.value), 1, 32) })}
                className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-3">
            <button
              type="button"
              onClick={() => setPromotionOpen((p) => !p)}
              className="flex w-full items-center justify-between text-left"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                승진
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPromotionGuideOpen(true);
                  }}
                  className="h-5 w-5 rounded-full border border-neutral-300 text-xs text-neutral-600"
                  aria-label="승진 평균연수 안내"
                >
                  ?
                </button>
              </div>
              <span className="text-neutral-400">{promotionOpen ? "▴" : "▾"}</span>
            </button>

            {promotionOpen ? (
              <div className="mt-3 space-y-2">
                {promotionItems.map((row, idx) => {
                  const colOpts = makeColumnOptions(row.series);
                  return (
                    <div key={`${idx}-${row.promotedAt}`} className="grid grid-cols-4 gap-2">
                      <ProfileSelect
                        value={row.series}
                        options={seriesOptions}
                        onChange={(series) => {
                          const first = makeColumnOptions(series)[0]?.value ?? "g9";
                          setPromotion(idx, { series, columnKey: first });
                        }}
                      />
                      <ProfileSelect
                        value={row.columnKey}
                        options={colOpts}
                        onChange={(v) => setPromotion(idx, { columnKey: v })}
                      />
                      <button
                        type="button"
                        onClick={() => { setPromotionPickerIndex(idx); openDate("promotionDate"); }}
                        className="h-10 rounded-2xl border border-neutral-200 bg-white px-3 text-left text-sm"
                      >
                        {fmtYmd(row.promotedAt)}
                      </button>
                      <input
                        inputMode="numeric"
                        value={row.years}
                        onChange={(e) => setPromotion(idx, { years: clampInt(Number(e.target.value), 1, 30) })}
                        className="h-10 rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
                        placeholder="승진연수"
                      />
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
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-neutral-200 p-3">
  <div className="flex items-center justify-between gap-2">
    <button
      type="button"
      onClick={() => setPromotionOpen((p) => !p)}
      className="flex flex-1 items-center justify-between text-left"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
        승진
      </div>
      <span className="text-neutral-400">{promotionOpen ? "▴" : "▾"}</span>
    </button>

    <button
      type="button"
      onClick={() => setPromotionGuideOpen(true)}
      className="h-5 w-5 shrink-0 rounded-full border border-neutral-300 text-xs text-neutral-600"
      aria-label="승진 평균연수 안내"
    >
      ?
    </button>
  </div>

  {promotionOpen ? (
    <div className="mt-3 space-y-2">
      {promotionItems.map((row, idx) => {
        const colOpts = makeColumnOptions(row.series);
        return (
          <div key={`${idx}-${row.promotedAt}`} className="grid grid-cols-4 gap-2">
            <ProfileSelect
              value={row.series}
              options={seriesOptions}
              onChange={(series) => {
                const first = makeColumnOptions(series)[0]?.value ?? "g9";
                setPromotion(idx, { series, columnKey: first });
              }}
            />
            <ProfileSelect
              value={row.columnKey}
              options={colOpts}
              onChange={(v) => setPromotion(idx, { columnKey: v })}
            />
            <button
              type="button"
              onClick={() => {
                setPromotionPickerIndex(idx);
                openDate("promotionDate");
              }}
              className="h-10 rounded-2xl border border-neutral-200 bg-white px-3 text-left text-sm"
            >
              {fmtYmd(row.promotedAt)}
            </button>
            <input
              inputMode="numeric"
              value={row.years}
              onChange={(e) =>
                setPromotion(idx, {
                  years: clampInt(Number(e.target.value), 1, 30),
                })
              }
              className="h-10 rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
              placeholder="승진연수"
            />
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
    </div>
  ) : null}
</div>
        </div>
      </SectionCard>

      <SectionCard title="산출결과 카드">
        <div className="grid grid-cols-2 gap-3">
          <Field label="최종기준소득월액(예상, 금년도 기준)">
            <div className="h-10 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 text-sm flex items-center justify-end">
              {currentPay.toLocaleString()}원
            </div>
          </Field>

          <Field label="평균기준소득월액(예상)">
            <div className="h-10 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 text-sm flex items-center justify-end">
              {avgIncome.toLocaleString()}원
            </div>
          </Field>

          <Field label="재직연수">
            <div className="h-10 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 text-sm flex items-center">
              {formatYearsText(totalYears)}
            </div>
          </Field>

          <Field label="지급률(연금)">
            <div className="h-10 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 text-sm flex items-center justify-end">
              {pensionRate.toFixed(2)}%
            </div>
          </Field>

          <Field label="지급률(퇴직수당)">
            <div className="h-10 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 text-sm flex items-center justify-end">
              {severanceRate.toFixed(2)}%
            </div>
          </Field>
        </div>
      </SectionCard>

      {promotionGuideOpen ? (
        <div className="fixed inset-0 z-[210]">
          <button className="absolute inset-0 bg-black/40" onClick={() => setPromotionGuideOpen(false)} aria-label="닫기" />
          <div className="absolute left-1/2 top-1/2 w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-4 shadow-2xl">
            <div className="text-sm font-semibold text-neutral-900">1~8급 평균 승진연수</div>
            <div className="mt-3 space-y-1 text-sm text-neutral-700">
              {DEFAULT_PROMOTION_YEARS.map((x) => (
                <div key={x.grade} className="flex items-center justify-between">
                  <span>{x.grade}</span>
                  <span>{x.years}년</span>
                </div>
              ))}
            </div>
            <button onClick={() => setPromotionGuideOpen(false)} className="mt-4 w-full rounded-xl bg-neutral-900 py-2 text-sm font-semibold text-white" type="button">
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
            ? (profile.birthDate ?? today)
            : picker === "startDate"
            ? profile.startDate
            : picker === "retireDate"
            ? profile.retireDate
            : ((promotionPickerIndex != null ? promotionItems[promotionPickerIndex]?.promotedAt : undefined) ?? today)
        }
        onClose={() => { setPicker(null); setPromotionPickerIndex(null); }}
        onConfirm={(next) => applyDate(next)}
      />
    </div>
  );
}
