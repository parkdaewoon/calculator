"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { CalendarEvent } from "@/lib/calendar";
import {
  COLOR_PRESETS,
  type TypeKey,
} from "@/lib/calendar/typeColors";
import { loadTypeColors } from "@/lib/storage/typeColorStorage";

type Props = {
  event: CalendarEvent;
  onEdit: () => void;
  canEdit?: boolean; // ✅ 추가: 수정 가능 여부(기본 true)
};

function normalizeToDash(input: any): string {
  const s = String(input ?? "");
  if (!s) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-").map(Number);
    if (y > 0 && m >= 1 && m <= 12 && d >= 1 && d <= 31) return s;
    return "";
  }

  if (/^\d{8}$/.test(s)) {
    const y = s.slice(0, 4);
    const m = s.slice(4, 6);
    const d = s.slice(6, 8);
    if (Number(y) <= 0 || Number(m) < 1 || Number(m) > 12 || Number(d) < 1 || Number(d) > 31) return "";
    return `${y}-${m}-${d}`;
  }

  const match = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (match) {
    const y = match[1];
    const mm = match[2].padStart(2, "0");
    const dd = match[3].padStart(2, "0");
    if (Number(y) <= 0 || Number(mm) < 1 || Number(mm) > 12 || Number(dd) < 1 || Number(dd) > 31) return "";
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
  if (ev?.allDay) return allDayRangeLabel(ev);

  const s = ev?.startTime;
  const e = ev?.endTime;
  if (s && e) return `${s} - ${e}`;
  if (s) return `${s}`;
  return "시간 미지정";
}

export default function EventListItem({ event, onEdit, canEdit = true }: Props) {
  const ev: any = event;

  const [typeColors, setTypeColors] = useState<Record<string, string>>(() => loadTypeColors() as any);

  useEffect(() => {
    const reload = () => {
      setTypeColors(loadTypeColors() as any);
    };

    window.addEventListener("type-colors-updated", reload);
    window.addEventListener("focus", reload);

    return () => {
      window.removeEventListener("type-colors-updated", reload);
      window.removeEventListener("focus", reload);
    };
  }, []);

  const typeKey = useMemo(() => {
    const main = String(ev?.typeMain ?? "WORK");
    const sub = String(ev?.typeSub ?? "");
    return `${main}|${sub}` as TypeKey;
  }, [ev?.typeMain, ev?.typeSub]);

  const accentColor = useMemo(() => {
    return typeColors[typeKey] ?? COLOR_PRESETS[0];
  }, [typeColors, typeKey]);

  return (
    <div className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white px-4 py-3 shadow-[0_6px_18px_rgba(0,0,0,0.04)]">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="h-10 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: accentColor }}
          aria-hidden
        />

        <div className="min-w-0">
          <div className="text-xs text-neutral-500">{timeLabel(ev)}</div>
          <div className="truncate text-sm font-semibold text-neutral-900">
            {ev?.title ?? "(제목 없음)"}
          </div>
          {ev?.memo ? (
            <div className="truncate text-xs text-neutral-400">{ev.memo}</div>
          ) : null}
        </div>
      </div>

      {canEdit ? (
        <button
          onClick={onEdit}
          className="ml-3 shrink-0 rounded-xl px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
        >
          수정
        </button>
      ) : null}
    </div>
  );
}