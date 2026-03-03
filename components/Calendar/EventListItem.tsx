"use client";

import React from "react";
import type { CalendarEvent } from "@/lib/calendar";

type Props = {
  event: CalendarEvent;
  onEdit: () => void;
};

function normalizeToDash(input: any): string {
  const s = String(input ?? "");
  if (!s) return "";

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // YYYYMMDD
  if (/^\d{8}$/.test(s)) {
    const y = s.slice(0, 4);
    const m = s.slice(4, 6);
    const d = s.slice(6, 8);
    return `${y}-${m}-${d}`;
  }

  // YYYY-M-D / YYYY/MM/DD
  const m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (m) {
    const y = m[1];
    const mm = m[2].padStart(2, "0");
    const dd = m[3].padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  }

  return "";
}

function mdLabel(dash: string) {
  if (!dash) return "";
  const m = String(Number(dash.slice(5, 7)));
  const d = String(Number(dash.slice(8, 10)));
  return `${m}월${d}일`;
}

function allDayRangeLabel(ev: any) {
  const sDash = normalizeToDash(ev?.dateStart ?? ev?.startDate ?? ev?.date ?? "");
  const eDash =
    normalizeToDash(ev?.dateEnd ?? ev?.endDate ?? ev?.dateEnd_legacy ?? "") || sDash;

  const s = mdLabel(sDash);
  const e = mdLabel(eDash);

  if (!s && !e) return "종일";
  if (s && e) return `${s} - ${e}`;
  return s || e;
}

function timeLabel(ev: any) {
  // ✅ 종일이면 "종일" 대신 "M월D일~M월D일"
  if (ev?.allDay) return allDayRangeLabel(ev);

  const s = ev?.startTime;
  const e = ev?.endTime;
  if (s && e) return `${s} - ${e}`;
  if (s) return `${s}`;
  return "시간 미지정";
}

export default function EventListItem({ event, onEdit }: Props) {
  const ev: any = event;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white px-4 py-3 shadow-[0_6px_18px_rgba(0,0,0,0.04)]">
      <div className="min-w-0">
        <div className="text-xs text-neutral-500">{timeLabel(ev)}</div>
        <div className="truncate text-sm font-semibold text-neutral-900">
          {ev?.title ?? "(제목 없음)"}
        </div>
        {ev?.memo ? (
          <div className="truncate text-xs text-neutral-400">{ev.memo}</div>
        ) : null}
      </div>

      <button
        onClick={onEdit}
        className="ml-3 shrink-0 rounded-xl px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
      >
        수정
      </button>
    </div>
  );
}