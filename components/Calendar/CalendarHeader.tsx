"use client";

import React from "react";
import { formatMonthLabel } from "@/lib/calendar";
import type { CalendarHeaderProps } from "./types";
import { Trash2 } from "lucide-react";

export default function CalendarHeader({
  month,
  onGoToday,
  onOpenWorkMode,
  onClear,
}: CalendarHeaderProps) {
  return (
    <header
      className={[
        "sticky top-0 z-50",
        "bg-neutral-50", // ✅ 불투명
        "border-b border-neutral-200",
        "pt-[env(safe-area-inset-top)]",
      ].join(" ")}
    >
      <div className="mx-auto w-full max-w-md px-2 py-2">
        <div className="flex items-center justify-between">
          <div className="px-5 text-[18px] font-semibold tracking-tight text-neutral-900">
            {formatMonthLabel(month)}
          </div>

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
  );
}