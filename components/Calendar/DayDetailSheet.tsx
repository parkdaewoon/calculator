"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { CalendarEvent, WorkPattern, YYYYMMDD } from "@/lib/calendar";
import { getWorkCodeForDate } from "@/lib/calendar";
import EventListItem from "./EventListItem";
import type { WorkMode } from "./types";
import { workModeToPattern } from "@/lib/calendar/patterns";
import { useLockBodyScroll } from "@/lib/hooks/useLockBodyScroll";
import { loadTypeColors } from "@/lib/storage/typeColorStorage";
import { hexToRgba, type TypeKey } from "@/lib/calendar/typeColors";

type WorkModeType = WorkMode["type"];

type Props = {
  open: boolean;
  date: YYYYMMDD;
  events: CalendarEvent[];
  pattern: WorkPattern;
  workMode: WorkMode;

  // ✅✅✅ CalendarPage에서 내려받는 공휴일 맵(전체)
  holidays?: Record<string, { name: string; isHoliday: boolean }>;

  onClose: () => void;
  onAdd: () => void;
  onEdit: (eventId: string) => void;
};

function normalizeToDash(input: string): YYYYMMDD | "" {
  if (!input) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input as YYYYMMDD;

  if (/^\d{8}$/.test(input)) {
    const y = input.slice(0, 4);
    const m = input.slice(4, 6);
    const d = input.slice(6, 8);
    return `${y}-${m}-${d}` as YYYYMMDD;
  }

  const m = input.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (m) {
    const y = m[1];
    const mm = m[2].padStart(2, "0");
    const dd = m[3].padStart(2, "0");
    return `${y}-${mm}-${dd}` as YYYYMMDD;
  }

  return "";
}

function toKey8(dash: string) {
  return (dash ?? "").replace(/\D/g, "");
}

function getDowKorean(dash: string) {
  if (!dash) return "";
  const y = Number(dash.slice(0, 4));
  const m = Number(dash.slice(5, 7));
  const d = Number(dash.slice(8, 10));
  const dt = new Date(y, m - 1, d);
  const map = ["일", "월", "화", "수", "목", "금", "토"] as const;
  return map[dt.getDay()] ?? "";
}

function getDayOnly(dash: string) {
  if (!dash) return "";
  return String(Number(dash.slice(8, 10)));
}

function workLabelFromCode(code: string) {
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

function workColorFromCode(code: string) {
  switch (code) {
    case "DAY":
      return "#ef4444"; // 빨강
    case "EVE":
      return "#f59e0b"; // 주황
    case "NIGHT":
      return "#3b82f6"; // 파랑
    case "DANG":
      return "#8b5cf6"; // 보라
    case "OFF":
      return "#6b7280"; // 회색
    case "REST":
      return "#9ca3af"; // 연회색
    default:
      return "#374151";
  }
}

function sortByTime(a: any, b: any) {
  const aAll = !!a?.allDay;
  const bAll = !!b?.allDay;
  if (aAll !== bAll) return aAll ? -1 : 1;

  const at = (a?.startTime ?? "99:99") as string;
  const bt = (b?.startTime ?? "99:99") as string;
  return at.localeCompare(bt);
}

function eventTypeKey(ev: any): TypeKey {
  const main = String(ev?.typeMain ?? ev?.categoryMain ?? "WORK");
  const normalizedMain = ["WORK", "DUTY", "SALARY", "BONUS", "ETC"].includes(main)
    ? main
    : "WORK";
  const sub = (ev?.typeSub ?? ev?.categorySub ?? "") as string;
  return `${normalizedMain}|${sub}` as TypeKey;
}

export default function DayDetailSheet({
  open,
  date,
  events,
  pattern,
  workMode,
  holidays,
  onClose,
  onAdd,
  onEdit,
}: Props) {
   useLockBodyScroll(open);
  const dateDash = useMemo(() => normalizeToDash(String(date)), [date]);
  const dateKey = useMemo(() => toKey8(dateDash), [dateDash]);

  const dow = useMemo(() => getDowKorean(dateDash), [dateDash]);
  const dayOnly = useMemo(() => getDayOnly(dateDash), [dateDash]);

  const workModeType: WorkModeType = workMode.type;

  const workCode = useMemo(() => {
  if (!dateDash) return "";
  if (workModeType === "NONE") return "";
  if (workModeType === "DAY") return "DAY";

  const runtimePattern = workModeToPattern(workMode as any, dateDash);
  return getWorkCodeForDate(runtimePattern as any, dateDash as any) || "";
}, [workModeType, workMode, dateDash]);

const workText = useMemo(() => {
  return workLabelFromCode(workCode) || "—";
}, [workCode]);

const workBadgeColor = useMemo(() => {
  return workColorFromCode(workCode);
}, [workCode]);

  // ✅✅✅ 공휴일 찾기 (여기가 핵심)
  const holiday = useMemo(() => {
    if (!dateDash) return null;
    const h = (holidays as any)?.[dateDash];
    if (!h?.isHoliday) return null;
    return h;
  }, [holidays, dateDash]);

  const dayEvents = useMemo(() => {
    if (!dateDash) return [];

    const list = (events ?? []).filter((e: any) => {
      const sDash = normalizeToDash(e?.dateStart ?? e?.startDate ?? e?.date ?? "");
      const eDash =
        normalizeToDash(e?.dateEnd ?? e?.endDate ?? e?.dateEnd_legacy ?? "") || sDash;

      if (!sDash || !eDash) return false;

      const sKey = toKey8(sDash);
      const eKey = toKey8(eDash);

      return sKey <= dateKey && dateKey <= eKey;
    });

    return list.slice().sort(sortByTime);
  }, [events, dateDash, dateKey]);

  const [typeColors, setTypeColors] = useState<Record<string, string>>(() => loadTypeColors() as any);

useEffect(() => {
  const reloadTypeColors = () => {
    setTypeColors(loadTypeColors() as any);
  };

  // 시트 열릴 때도 한번 새로 읽기
  if (open) {
    reloadTypeColors();
  }

  // 같은 앱 안에서 색상 변경 즉시 반영용
  window.addEventListener("type-colors-updated", reloadTypeColors);

  // 포커스 돌아왔을 때도 반영
  window.addEventListener("focus", reloadTypeColors);

  return () => {
    window.removeEventListener("type-colors-updated", reloadTypeColors);
    window.removeEventListener("focus", reloadTypeColors);
  };
}, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="닫기" />

      <div
        className={[
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-[min(92vw,520px)] aspect-[3/4]",
          "rounded-[28px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]",
          "overflow-hidden",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        {/* ===== Header ===== */}
        <div className="px-6 pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <div className="text-[22px] font-semibold tracking-tight text-neutral-900">
                  {dayOnly ? `${dayOnly}일` : " "}
                </div>
                <div className="text-[14px] font-medium text-neutral-500">({dow || " "}요일)</div>
              </div>

            </div>

            <div className="flex items-center gap-2">
              <span
  className="rounded-full px-3 py-1 text-[12px] font-semibold"
  style={{
    color: workBadgeColor,
    backgroundColor: hexToRgba(workBadgeColor, 0.12),
    border: `1px solid ${hexToRgba(workBadgeColor, 0.24)}`,
  }}
>
  {workText}
</span>

              <button
                onClick={onClose}
                aria-label="닫기"
                className="h-9 w-9 rounded-full hover:bg-neutral-100 grid place-items-center text-neutral-600"
              >
                <span className="text-[18px] leading-none">×</span>
              </button>
            </div>
          </div>

          <div className="mt-4 h-px bg-neutral-100" />
        </div>

        {/* ===== Body ===== */}
        <div className="px-6 pb-5 overflow-y-auto h-[calc(100%-104px-76px)]">
          {/* ✅✅✅ 공휴일 카드: 항상 목록 최상단, 수정 불가 */}
          {holiday ? (
            <div className="mb-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
              <div className="text-[11px] font-semibold text-red-600">공휴일</div>
              <div className="mt-1 text-sm font-semibold text-neutral-900">{holiday.name}</div>
            </div>
          ) : null}

          {dayEvents.length === 0 ? (
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
              <div className="text-sm font-medium text-neutral-700">아직 일정이 없어요</div>
              <div className="mt-1 text-xs text-neutral-400">아래 버튼으로 일정을 추가해보세요.</div>
            </div>
          ) : (
            <div className="space-y-2">
              {dayEvents.map((ev: any) => {
                const key = eventTypeKey(ev);
                const color = typeColors[key] ?? "#111827";

                return (
                  <div
                    key={ev.id}
                    className="rounded-2xl border"
                    style={{
                      backgroundColor: hexToRgba(color, 0.1),
                      borderColor: hexToRgba(color, 0.22),
                    }}
                  >
                    {/* ⚠️ 수정 버튼 숨김은 EventListItem 수정이 필요해서,
                        일단 여기서는 기존대로 둠.
                        다음 턴에 EventListItem도 같이 고쳐줄게. */}
                    <EventListItem event={ev} onEdit={() => onEdit(ev.id)} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== Footer ===== */}
        <div className="px-6 pb-6 pt-3 border-t border-neutral-100 bg-white">
          <button
            onClick={onAdd}
            className="w-full rounded-2xl bg-neutral-900 py-3 text-sm font-semibold text-white hover:bg-neutral-800 active:scale-[0.99] transition"
          >
            + 일정 추가
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}