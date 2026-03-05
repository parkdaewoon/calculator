"use client";

import React from "react";
import type { CalendarHeaderProps } from "./types";
import { Trash2 } from "lucide-react";
import YearMonthWheel from "@/components/ui/wheel/presets/YearMonthWheel";

/** month = "YYYY-MM" 가정 */
function splitYM(v: string) {
  const y = v?.slice(0, 4) ?? "";
  const m = v?.slice(5, 7) ?? "";
  return { y, m };
}

export default function CalendarHeader({
  month,
  onGoToday,
  onOpenWorkMode,
  onClear,
  onChangeMonth,
}: CalendarHeaderProps) {
  const [openYM, setOpenYM] = React.useState(false);

  const { y, m } = splitYM(String(month));

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
              className="rounded-2xl px-5 hover:bg-neutral-100 active:scale-[0.99]"
              aria-label="년/월 선택"
              title="년/월 선택"
            >
              {/* ✅ 년은 작게 + 볼드 제거 / 월은 크게 */}
              <span className="mr-1 text-[14px] font-normal text-neutral-700">
                {y}년
              </span>
              <span className="text-[18px] ml-1 font-semibold tracking-tight text-neutral-900">
                {m}월
              </span>
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
                <Trash2
                  size={18}
                  strokeWidth={1.8}
                  className="transition group-hover:text-red-500"
                />
              </button>
            </div>
          </div>
        </div>
      </header>

            {/* ✅ 프리셋 모달 사용 */}
      <YearMonthWheel
        open={openYM}
        title="년/월 선택"
        value={String(month)} // YYYY-MM
        onClose={() => setOpenYM(false)}
        onConfirm={(nextYYYYMM: string) => {
          onChangeMonth(nextYYYYMM as any); // month 타입이 YYYYMM 같은 커스텀 타입이면 as any 대신 맞춰주면 됨
          setOpenYM(false);
        }}
      />
    </>
  );
}