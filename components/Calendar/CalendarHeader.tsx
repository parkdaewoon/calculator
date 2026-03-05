"use client";

import React from "react";
import { formatMonthLabel } from "@/lib/calendar";
import type { CalendarHeaderProps } from "./types";
import { Trash2 } from "lucide-react";

/** ===== helpers ===== */
function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function parseYYYYMM(v: string) {
  const [yy, mm] = (v || "").split("-");
  return { y: Number(yy || "0"), m: Number(mm || "1") };
}
function toYYYYMM(y: number, m: number) {
  return `${y}-${pad2(m)}` as any; // YYYYMM이면 as YYYYMM
}

/** ===== wheel ===== */
type WheelHandle = {
  getValue: () => number;
  commit: () => number;
};

const WheelColumn = React.forwardRef<
  WheelHandle,
  {
    items: number[];
    value: number;
    onChange: (v: number) => void;
    height?: number;
    itemH?: number;
  }
>(function WheelColumn({ items, value, onChange, height = 176, itemH = 44 }, ref) {
  const elRef = React.useRef<HTMLDivElement | null>(null);
  const valueRef = React.useRef(value);

  React.useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // ✅ 열릴 때 / 값 바뀔 때 현재 위치로 즉시 이동 (애니메이션 X)
  React.useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const idx = Math.max(0, items.indexOf(value));
    el.scrollTo({ top: idx * itemH, behavior: "instant" as any });
  }, [value, items, itemH]);

  const readCurrent = React.useCallback(() => {
    const el = elRef.current;
    if (!el) return valueRef.current;
    const idx = Math.round(el.scrollTop / itemH);
    return items[Math.min(items.length - 1, Math.max(0, idx))];
  }, [items, itemH]);

  const commit = React.useCallback(() => {
    const el = elRef.current;
    if (!el) return valueRef.current;

    const idx = Math.round(el.scrollTop / itemH);
    const v = items[Math.min(items.length - 1, Math.max(0, idx))];

    // ✅ 스크롤 멈췄을 때만 state 반영(버퍼링 방지)
    if (v !== valueRef.current) onChange(v);

    // ✅ 스냅 정렬
    el.scrollTo({ top: idx * itemH, behavior: "smooth" });

    return v;
  }, [items, itemH, onChange]);

  React.useImperativeHandle(
    ref,
    () => ({
      getValue: () => readCurrent(),
      commit: () => commit(),
    }),
    [readCurrent, commit]
  );

  const padding = Math.floor((height - itemH) / 2);

  return (
    <div className="relative w-full">
      <div
        className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-xl border border-neutral-200 bg-white/70"
        style={{ height: itemH }}
      />
      <div
        ref={elRef}
        // ✅ 스크롤 중에는 state 업데이트 X
        onScroll={() => {}}
        // ✅ 손 떼면 커밋
        onPointerUp={() => commit()}
        onTouchEnd={() => commit()}
        className="w-full overflow-y-auto rounded-2xl border border-neutral-100 bg-white"
        style={{
          height,
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}
      >
        <div style={{ paddingTop: padding, paddingBottom: padding }}>
          {items.map((n) => (
            <div
              key={n}
              className={[
                "flex items-center justify-center text-sm font-semibold",
                n === value ? "text-neutral-900" : "text-neutral-400",
              ].join(" ")}
              style={{ height: itemH, scrollSnapAlign: "center" }}
              onClick={() => onChange(n)} // 클릭은 즉시 반영 OK
            >
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

/** ===== modal ===== */
function MonthWheelModal({
  open,
  onClose,
  initialYYYYMM,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  initialYYYYMM: string; // "YYYY-MM"
  onApply: (nextYYYYMM: string) => void;
}) {
  const now = new Date();
  const curY = now.getFullYear();

  const years = React.useMemo(() => {
    const start = curY - 20;
    const end = curY + 10;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [curY]);

  const months = React.useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  const [y, setY] = React.useState(curY);
  const [m, setM] = React.useState(now.getMonth() + 1);

  // ✅ 핵심: ref로 “현재 스크롤 위치의 값”을 적용 시점에 강제 읽기
  const yearRef = React.useRef<WheelHandle | null>(null);
  const monthRef = React.useRef<WheelHandle | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const p = parseYYYYMM(initialYYYYMM);
    setY(p.y || curY);
    setM(p.m || 1);
  }, [open, initialYYYYMM, curY]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/35" onClick={onClose} aria-hidden="true" />

      {/* panel */}
      <div className="absolute left-0 right-0 bottom-0 mx-auto w-full max-w-md rounded-t-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div className="text-sm font-semibold text-neutral-900">년/월 선택</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-[13px] font-semibold text-neutral-600 hover:bg-neutral-100"
          >
            닫기
          </button>
        </div>

        <div className="px-5 pb-6 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-2 text-xs font-semibold text-neutral-700">년</div>
              <WheelColumn ref={yearRef} items={years} value={y} onChange={setY} />
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold text-neutral-700">월</div>
              <WheelColumn ref={monthRef} items={months} value={m} onChange={setM} />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-3">
            <div className="text-[11px] text-neutral-500">선택됨</div>
            <div className="mt-1 text-sm font-semibold text-neutral-900">
              {y}년 {m}월
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => {
                // ✅ 적용 직전에 무조건 “현재 휠 위치”를 커밋해서 정확한 값 사용
                const yy = yearRef.current?.commit() ?? y;
                const mm = monthRef.current?.commit() ?? m;

                onApply(toYYYYMM(yy, mm));
                onClose();
              }}
              className="w-full rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white"
            >
              적용
            </button>
          </div>
        </div>

        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}

export default function CalendarHeader({
  month,
  onGoToday,
  onOpenWorkMode,
  onClear,
  onChangeMonth,
}: CalendarHeaderProps) {
  const [openYM, setOpenYM] = React.useState(false);

  return (
    <>
      <header
        className={[
          "sticky top-0 z-50",
          "bg-neutral-50",
          "border-b border-neutral-200",
          "pt-[env(safe-area-inset-top)]",
        ].join(" ")}
      >
        <div className="mx-auto w-full max-w-md px-2 py-2">
          <div className="flex items-center justify-between">
            {/* 월 라벨 클릭 -> 휠 피커 */}
            <button
              type="button"
              onClick={() => setOpenYM(true)}
              className="rounded-2xl px-5 text-[18px] font-semibold tracking-tight text-neutral-900 hover:bg-neutral-100 active:scale-[0.99]"
              aria-label="년/월 선택"
              title="년/월 선택"
            >
              {formatMonthLabel(month)}
            </button>

            <div className="flex items-center gap-1 pr-2">
              <button
                className="rounded-xl border border-neutral-200 bg-white px-2 py-1 text-sm font-medium text-neutral-800 shadow-sm active:scale-[0.98]"
                onClick={onGoToday}
                type="button"
              >
                오늘
              </button>

              <button
                className="rounded-xl border border-neutral-200 bg-white px-2 py-1 text-sm font-medium text-neutral-800 shadow-sm active:scale-[0.98]"
                onClick={onOpenWorkMode}
                type="button"
                aria-label="근무형태 설정"
                title="근무형태 설정"
              >
                근무형태
              </button>

              <button
                className="group rounded-xl border border-neutral-200 bg-white p-2 text-neutral-500 shadow-sm transition hover:bg-neutral-100 active:scale-[0.97]"
                onClick={onClear}
                type="button"
                aria-label="초기화"
                title="초기화"
              >
                <Trash2 size={18} strokeWidth={1.8} className="transition group-hover:text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MonthWheelModal
        open={openYM}
        onClose={() => setOpenYM(false)}
        initialYYYYMM={month as any}
        onApply={(next) => onChangeMonth(next as any)}
      />
    </>
  );
}