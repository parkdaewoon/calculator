"use client";

import { useMemo, useState } from "react";
import { PAY_TABLES, getPay, type PayTableId } from "@/lib/payTables";

type Props = {
  series: PayTableId;
  columnKey: string; // ✅ grade -> columnKey
  step: number;
  onChangeSeries: (v: PayTableId) => void;
  onChangeColumnKey: (v: string) => void; // ✅ onChangeGrade -> onChangeColumnKey
  onChangeStep: (v: number) => void;
};

export default function PayTableSection({
  series,
  columnKey,
  step,
  onChangeSeries,
  onChangeColumnKey,
  onChangeStep,
}: Props) {
  // ✅ PAY_TABLES에 등록된 모든 직렬 키
  const tableIds = useMemo(() => Object.keys(PAY_TABLES) as PayTableId[], []);

  // ✅ PAY_TABLES가 비어있으면 안전하게 안내 (런타임 방지)
  if (tableIds.length === 0) {
    return (
      <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
        <div className="text-sm font-semibold">봉급표</div>
        <p className="mt-2 text-sm text-neutral-500">
          봉급표 데이터를 찾을 수 없습니다. (PAY_TABLES가 비어있어요)
        </p>
      </section>
    );
  }

  // ✅ series 값이 PAY_TABLES에 없으면 첫 번째 테이블로 fallback
  const tableId: PayTableId = tableIds.includes(series) ? series : tableIds[0];
  const table = PAY_TABLES[tableId];

  // ✅ table이 없으면 안내 UI (런타임 에러 방지)
  if (!table) {
    return (
      <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
        <div className="text-sm font-semibold">봉급표</div>
        <p className="mt-2 text-sm text-neutral-500">
          봉급표 데이터를 찾을 수 없습니다. (PAY_TABLES 설정을 확인해 주세요)
        </p>
      </section>
    );
  }

  // ✅ columnKey 안전 보정: 표에 없으면 첫 번째 컬럼으로
  const firstKey = table.columns[0]?.key ?? "";
  const safeColumnKey =
    firstKey && table.columns.some((c) => c.key === columnKey) ? columnKey : firstKey;

  const pay = safeColumnKey ? getPay(tableId, safeColumnKey, step) : null;

  const selectedColLabel =
    table.columns.find((c) => c.key === safeColumnKey)?.label ?? "";

  const onChangeTable = (nextId: PayTableId) => {
    const nextTable = PAY_TABLES[nextId];
    if (!nextTable) return;

    onChangeSeries(nextId);

    // ✅ 표 바꾸면: 해당 표의 첫 직급 + 호봉 1로 리셋 (호환 보장)
    const firstKey = nextTable.columns[0]?.key ?? "";
    onChangeColumnKey(firstKey);
    onChangeStep(1);
  };

  return (
    <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
      <div className="text-sm font-semibold">봉급표</div>
      <p className="mt-2 text-sm text-neutral-500">
        직렬/직급/호봉을 선택하면 월 기본급을 보여줍니다.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block">
          <div className="mb-1 text-xs text-neutral-500">직렬</div>
          <select
            value={tableId}
            onChange={(e) => onChangeTable(e.target.value as PayTableId)}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
          >
            {tableIds.map((id) => (
              <option key={id} value={id}>
                {PAY_TABLES[id]?.title ?? id}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <div className="mb-1 text-xs text-neutral-500">직급</div>
          <select
            value={safeColumnKey}
            onChange={(e) => onChangeColumnKey(e.target.value)}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
          >
            {table.columns.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <div className="mb-1 text-xs text-neutral-500">호봉</div>
          <DraftNumberInput
            key={`${tableId}:${step}`}
            value={step}
            min={1}
            max={table.maxStep}
            onCommit={onChangeStep}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="mt-6 flex justify-center">
        <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-50 p-6 text-center shadow-[0_15px_35px_rgba(0,0,0,0.06)]">
          <div className="text-xs font-medium tracking-wide text-neutral-500">
            월 기본급
          </div>

          <div className="mt-3 text-3xl font-bold tracking-tight text-neutral-900">
            {pay == null ? "해당 없음" : formatWon(pay)}
          </div>

          <div className="mt-2 text-sm text-neutral-500">
            {selectedColLabel} · {step}호봉
          </div>

          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-neutral-300" />
        </div>
      </div>

      <div className="mt-4 text-xs text-neutral-400">
        * 표에 없는 구간은 “해당 없음”으로 표시됩니다.
      </div>
    </section>
  );
}

function clampInt(v: string, min: number, max: number) {
  const n = Number(v);
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

function DraftNumberInput({
  value,
  min,
  max,
  onCommit,
  className,
}: {
  value: number;
  min: number;
  max: number;
  onCommit: (next: number) => void;
  className: string;
}) {
  const [draft, setDraft] = useState(() =>
    Number.isFinite(value) ? String(Math.trunc(value)) : ""
  );

  return (
    <input
      inputMode="numeric"
      value={draft}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^0-9]/g, "");
        setDraft(raw);
      }}
      onBlur={() => {
        const committed = clampInt(draft, min, max);
        onCommit(committed);
        setDraft(String(committed));
      }}
      className={className}
    />
  );
}

function formatWon(n: number) {
  return `${Math.trunc(n).toLocaleString("ko-KR")}원`;
}
