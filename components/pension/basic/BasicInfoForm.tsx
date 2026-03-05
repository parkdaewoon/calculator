"use client";

import React, { useMemo } from "react";
import type { BaseProfile } from "@/lib/domain/profile/types";
import { PAY_TABLES, type PayTableId } from "@/lib/payTables";
import SectionCard from "@/components/common/SectionCard";
import Field from "@/components/common/Field";

function clampInt(n: number, min: number, max: number) {
  const x = Math.trunc(Number.isFinite(n) ? n : min);
  return Math.min(max, Math.max(min, x));
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
  const seriesOptions = useMemo(() => {
    return Object.keys(PAY_TABLES).map((id) => {
      const key = id as PayTableId;
      return { value: key, label: PAY_TABLES[key]?.title ?? key };
    });
  }, []);

  const columnOptions = useMemo(() => {
    const cols = PAY_TABLES[profile.series as PayTableId]?.columns ?? [];
    return cols.map((c) => ({ value: c.key, label: c.label }));
  }, [profile.series]);

  return (
    <SectionCard
      title="기본 정보"
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
      <div className="grid grid-cols-2 gap-3">
        <Field label="직렬">
          <select
            value={profile.series}
            onChange={(e) => {
              const series = e.target.value;
              const firstCol =
                (PAY_TABLES[series as PayTableId]?.columns ?? [])?.[0]?.key ?? "g9";
              onChange({ ...profile, series, columnKey: firstCol, step: 1 });
            }}
            className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
          >
            {seriesOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="직급">
          <select
            value={profile.columnKey}
            onChange={(e) => onChange({ ...profile, columnKey: e.target.value })}
            className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
          >
            {columnOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="호봉(1~32)">
          <input
            inputMode="numeric"
            value={profile.step}
            onChange={(e) =>
              onChange({ ...profile, step: clampInt(Number(e.target.value), 1, 32) })
            }
            className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
          />
        </Field>

        <Field label="임용일(시작일)">
          <input
            type="date"
            value={profile.startDate}
            onChange={(e) => onChange({ ...profile, startDate: e.target.value })}
            className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
          />
        </Field>

        <Field label="퇴직예정일">
          <input
            type="date"
            value={profile.retireDate}
            onChange={(e) => onChange({ ...profile, retireDate: e.target.value })}
            className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
          />
        </Field>

        <Field label="생년월일(옵션)">
          <input
            type="date"
            value={profile.birthDate ?? ""}
            onChange={(e) =>
              onChange({ ...profile, birthDate: e.target.value || undefined })
            }
            className="h-10 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
          />
        </Field>

        <div className="col-span-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-[12px] text-neutral-600">
          기본정보를 저장하면 <b>퇴직수당/연금/비교</b> 탭에서 자동으로 반영됩니다.
        </div>
      </div>
    </SectionCard>
  );
}
