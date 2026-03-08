"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PAY_TABLES, getPay, type PayTableId } from "@/lib/payTables";

type Props = {
  series: PayTableId;
  columnKey: string; // ✅ grade -> columnKey
  step: number;
  onChangeSeries: (v: PayTableId) => void;
  onChangeColumnKey: (v: string) => void; // ✅ onChangeGrade -> onChangeColumnKey
  onChangeStep: (v: number) => void;
};

type Opt = { value: string; label: string };

const STEPS_1_TO_32: Opt[] = Array.from({ length: 32 }, (_, i) => {
  const n = i + 1;
  return { value: String(n), label: `${n}호봉` };
});

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
    firstKey && table.columns.some((c) => c.key === columnKey)
      ? columnKey
      : firstKey;

  // ✅ 호봉은 1~32 고정
  const safeStep = clampInt(String(step ?? 1), 1, 32);

  const pay = safeColumnKey ? getPay(tableId, safeColumnKey, safeStep) : null;

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

  // ✅ 옵션들
  const seriesOptions: Opt[] = tableIds.map((id) => ({
    value: id,
    label: PAY_TABLES[id]?.title ?? id,
  }));

  const gradeOptions: Opt[] = table.columns.map((c) => ({
    value: c.key,
    label: c.label,
  }));

  return (
    <section className="rounded-3xl border border-neutral-100 bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
      <div className="text-sm font-semibold">봉급표</div>
      <p className="mt-2 text-sm text-neutral-500">
        직렬/직급/호봉을 선택하면 월 기본급을 보여줍니다.
      </p>

      {/* ✅ 기존과 어울리게: 같은 톤의 “필드 + 드롭다운” */}
<div className="mt-3 grid grid-cols-2 gap-3">
  <Field label="직렬">
    <NiceSelect
      value={tableId}
      options={seriesOptions}
      onChange={(v) => onChangeTable(v as PayTableId)}
      className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
    />
  </Field>

  <Field label="직급">
    <NiceSelect
      value={safeColumnKey}
      options={gradeOptions}
      onChange={(v) => onChangeColumnKey(v)}
      className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
    />
  </Field>

  <Field label="호봉">
    <NiceSelect
      value={String(safeStep)}
      options={STEPS_1_TO_32}
      onChange={(v) => onChangeStep(Number(v))}
      className="w-full rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-sm"
    />
  </Field>
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
            {selectedColLabel} · {safeStep}호봉
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

/** -------------------- UI: 기존 톤 유지용 필드 -------------------- */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-neutral-500">{label}</div>
      {children}
    </label>
  );
}

/**
 * ✅ “옵션 리스트(빨간 영역)”까지 예쁘게 나오는 커스텀 드롭다운
 * - 둥근 모서리/그림자/hover/선택 강조
 * - 최대 높이 + 스크롤
 * - 바깥 클릭/ESC 닫기
 * - 버튼 폭에 딱 맞춰 아래로 펼침
 */
function NiceSelect({
  value,
  options,
  onChange,
  className,
}: {
  value: string;
  options: Opt[];
  onChange: (v: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? "선택";

  const [pos, setPos] = useState<{ left: number; top: number; width: number } | null>(
    null
  );

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
          "h-10", // ✅ 기본정보와 동일 높이
          "rounded-2xl border border-neutral-200 bg-white px-3",
          "text-left text-sm text-neutral-900", // ✅ 동일 폰트
          "shadow-sm transition hover:border-neutral-300",
          "focus:outline-none focus:ring-4 focus:ring-neutral-200/60 focus:border-neutral-400",
          className ?? "",
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
              }}
              className={[
                "overflow-hidden rounded-2xl border border-neutral-200 bg-white",
                "shadow-[0_20px_60px_rgba(0,0,0,0.18)]",
              ].join(" ")}
            >
              <div className="max-h-[320px] overflow-auto p-1">
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

/** -------------------- helpers -------------------- */

function clampInt(v: string, min: number, max: number) {
  const n = Number(v);
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

function formatWon(n: number) {
  return `${Math.trunc(n).toLocaleString("ko-KR")}원`;
}