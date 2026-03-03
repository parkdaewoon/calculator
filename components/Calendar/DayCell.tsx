"use client";

import React, { useMemo } from "react";
import type { MonthGridDay } from "./types";
import type { CalendarEvent, WorkPattern } from "@/lib/calendar";
import { getWorkCodeForDate } from "@/lib/calendar";

type Props = {
  day: MonthGridDay;
  selected: boolean;
  onSelect: () => void;
  onOpenDay?: () => void; // ✅ 남겨둬도 되지만 DayCell에서는 더 이상 안 씀

  pattern: WorkPattern;

  // ✅ Shift+클릭 빠른 일정 토글은 유지
  events: CalendarEvent[];
  onChangeEvents: (events: CalendarEvent[]) => void;

  showWorkBadge: boolean;
  isHoliday?: boolean;

  // ✅ 더보기 여부만 전달 (숫자 대신 boolean)
  hasMore?: boolean;
};

function normYMD(v: string) {
  const m = String(v ?? "").match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return String(v ?? "").slice(0, 10);
  const y = m[1];
  const mo = m[2].padStart(2, "0");
  const d = m[3].padStart(2, "0");
  return `${y}-${mo}-${d}`;
}

function workBadgeLabel(code: string) {
  switch (code) {
    case "DAY":
      return "주";
    case "EVE":
      return "저";
    case "NIGHT":
      return "야";
    case "DANG":
      return "당";
    case "OFF":
      return "비";
    case "REST":
      return "휴";
    default:
      return "";
  }
}

function workBadgeClass(code: string) {
  switch (code) {
    case "DAY":
      return "bg-red-50 text-red-700";
    case "EVE":
      return "bg-amber-50 text-amber-700";
    case "NIGHT":
      return "bg-blue-50 text-blue-700";
    case "DANG":
      return "bg-purple-50 text-purple-700";
    case "OFF":
    case "REST":
      return "bg-neutral-100 text-neutral-500";
    default:
      return "bg-transparent text-neutral-400";
  }
}

function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function DayCell({
  day,
  selected,
  onSelect,
  onOpenDay, // eslint-disable-line @typescript-eslint/no-unused-vars
  pattern,
  events,
  onChangeEvents,
  showWorkBadge,
  isHoliday,
  hasMore = false,
}: Props) {
  const workCode = useMemo(
    () => getWorkCodeForDate(pattern, day.date),
    [pattern, day.date]
  );
  const badge = showWorkBadge ? workBadgeLabel(workCode) : "";
  const badgeStyle = workBadgeClass(workCode);

  const isSun = day.dow === 0;
  const isSat = day.dow === 6;

  const dateColor =
    isHoliday || isSun
      ? "text-red-500"
      : isSat
      ? "text-blue-500"
      : day.inMonth
      ? "text-neutral-900"
      : "text-neutral-400";

  const toggleQuickEvent = () => {
    const idx = (events ?? []).findIndex((e: any) => {
      const a = normYMD(e?.dateStart ?? "");
      const b = normYMD(e?.dateEnd ?? e?.dateStart ?? "");
      const type = e?.type ?? "EVENT";
      if (!a || !b) return false;
      if (a !== b) return false;
      return type === "EVENT" && a === normYMD(day.date);
    });

    if (idx >= 0) {
      const next = [...events.slice(0, idx), ...events.slice(idx + 1)];
      onChangeEvents(next);
      return;
    }

    const next: CalendarEvent[] = [
      ...events,
      {
        id: makeId(),
        type: "EVENT",
        dateStart: day.date,
        title: "일정",
      } as any,
    ];
    onChangeEvents(next);
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        if (e.shiftKey) {
          toggleQuickEvent();
          return;
        }
        // ✅ DayCell은 클릭 시 선택만. (2번째 탭 오픈 로직은 MonthGrid에서 처리)
        onSelect();
      }}
      // ✅ 더블클릭 동작 제거
      className={[
        "relative h-[84px] w-full text-left cursor-pointer",
        day.inMonth ? "bg-white" : "bg-neutral-50",
        selected
          ? "z-10 outline outline-2 outline-neutral-900 -outline-offset-2"
          : "outline-none",
      ].join(" ")}
    >
      {/* ✅ 상단: 날짜 + 근무배지 (overlay보다 위로) */}
      <div className="absolute left-2 right-2 top-1 z-40 flex items-start justify-between">
        <div
          className={["text-[12px] font-semibold leading-4", dateColor].join(
            " "
          )}
        >
          {day.day}
        </div>

        {badge ? (
          <div
            className={[
              "px-1.5 py-[1px] rounded text-[10px] font-semibold leading-4",
              badgeStyle,
            ].join(" ")}
          >
            {badge}
          </div>
        ) : (
          <div />
        )}
      </div>

      {/* ✅ 제일 아래 '...' 표시 (겹침 방지 위해 z-40) */}
      {hasMore ? (
        <div className="absolute bottom-0.5 left-2 right-2 z-40 flex justify-center">
          <div className="text-[10px] leading-none text-neutral-400">...</div>
        </div>
      ) : null}
    </button>
  );
}