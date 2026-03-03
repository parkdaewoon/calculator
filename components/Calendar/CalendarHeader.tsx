"use client";

import React from "react";
import { formatMonthLabel } from "@/lib/calendar";
import type { CalendarHeaderProps } from "./types";

export default function CalendarHeader({
  month,
  onGoToday,
  onOpenWorkMode,
  onClear,
}: CalendarHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-neutral-50/90 backdrop-blur">
      <div className="mx-auto w-full max-w-md px-2 py-1">
        <div className="flex items-center justify-between">
          {/* ✅ 왼쪽 정렬 */}
          <div className="mt-2 px-5 text-[18px] font-semibold tracking-tight text-neutral-900">
  {formatMonthLabel(month)}
</div>

          {/* ✅ 오른쪽 버튼 3개 */}
          <div className="flex items-center gap-1">
            <button
              className="rounded-xl border border-neutral-200 bg-white px-2 py-1 text-sm font-medium text-neutral-800 shadow-sm"
              onClick={onGoToday}
              type="button"
            >
              오늘
            </button>

            <button
              className="rounded-xl border border-neutral-200 bg-white px-2 py-1 text-sm font-medium text-neutral-800 shadow-sm"
              onClick={onOpenWorkMode}
              type="button"
              aria-label="근무형태 설정"
              title="근무형태 설정"
            >
              근무형태
            </button>

            <button
              className="rounded-xl border border-neutral-200 bg-white px-2 py-1 text-sm font-medium text-neutral-800 shadow-sm"
              onClick={onClear}
              type="button"
              aria-label="초기화"
              title="초기화"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}