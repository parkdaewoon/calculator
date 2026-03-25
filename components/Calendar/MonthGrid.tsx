"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { MonthGridProps } from "./types";
import DayCell from "./DayCell";
import { buildMonthGrid } from "@/lib/calendar";

import { loadTypeColors, TYPE_COLORS_UPDATED_EVENT } from "@/lib/storage/typeColorStorage";
import { hexToRgba } from "@/lib/calendar/typeColors";

const DOW = ["일", "월", "화", "수", "목", "금", "토"] as const;

// ✅ 아이폰 느낌: 한 칸에서 보여줄 최대 라인 수
const MAX_LINES = 3;

// ✅ 겹침 방지(바닥 ... 공간 확보용)
const BAR_H = 14;
const BASE_TOP = 26;
const LINE_PITCH = 16;

export default function MonthGrid({
  month,
  selectedDate,
  onSelectDate,
  onSelectMeta,
  pattern,
  events,
  onChangeEvents,
  showWorkBadges,
  onPrevMonth,
  onNextMonth,
  onOpenDay,

  // ✅✅✅ CalendarPage에서 내려받는 공휴일 맵
  holidays,
}: MonthGridProps) {
  const grid = useMemo(() => buildMonthGrid(month), [month]);

  function normYMD(v: string) {
    const m = String(v ?? "").match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (!m) return String(v ?? "").slice(0, 10);
    return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  }

  const eventsInView = useMemo(() => {
    const s = normYMD(grid[0]?.date ?? "");
    const e = normYMD(grid[grid.length - 1]?.date ?? "");

    return (events ?? []).filter((ev: any) => {
      const a = normYMD(ev.dateStart);
      const b = normYMD(ev.dateEnd ?? ev.dateStart);
      return !(b < s || a > e);
    });
  }, [events, grid]);
  const displayEventsInView = useMemo(() => {
    return (eventsInView ?? []).filter((ev: any) => {
      const title = String(ev?.title ?? "").trim();
      const sub = String(ev?.typeSub ?? ev?.categorySub ?? "").trim();
      const main = String(ev?.typeMain ?? ev?.categoryMain ?? "").trim();

      // 공휴일/대체공휴일은 달력 셀에서만 숨김
      const isHolidayEvent =
        title.includes("대체공휴일") ||
        title.includes("공휴일") ||
        sub === "HOLIDAY" ||
        sub === "PUBLIC_HOLIDAY" ||
        main === "HOLIDAY";

      return !isHolidayEvent;
    });
  }, [eventsInView]);
  const [typeColors, setTypeColors] = useState(() => loadTypeColors());

useEffect(() => {
  const refresh = () => setTypeColors(loadTypeColors());

  // ✅ 같은 탭에서 저장해도 반영
  window.addEventListener(TYPE_COLORS_UPDATED_EVENT, refresh);

  // ✅ 다른 탭에서 바뀐 경우(storage 이벤트)
  window.addEventListener("storage", refresh);

  return () => {
    window.removeEventListener(TYPE_COLORS_UPDATED_EVENT, refresh);
    window.removeEventListener("storage", refresh);
  };
}, []);

  // ✅ 하루/기간 이벤트를 모두 "주(row) 점유"로 라인 배치해서 seg로 만들기
  const segments = useMemo(() => {
    type Seg = {
      id: string;
      row: number;
      line: number;
      colStart: number;
      colEnd: number;
      color: string;
      title: string;
      startYMD: string;
      endYMD: string;
    };

    const segs: Seg[] = [];
    const rows = Math.ceil(grid.length / 7);

    const occupancy: Record<number, Array<Array<[number, number]>>> = {};

    const overlaps = (a1: number, a2: number, b1: number, b2: number) =>
      !(a2 < b1 || b2 < a1);

    const findLine = (row: number, cs: number, ce: number) => {
      const lines = (occupancy[row] ??= []);
      for (let line = 0; line < lines.length; line++) {
        const intervals = lines[line];
        const hit = intervals.some(([s, e]) => overlaps(cs, ce, s, e));
        if (!hit) {
          intervals.push([cs, ce]);
          return line;
        }
      }
      lines.push([[cs, ce]]);
      return lines.length - 1;
    };

    const eventTypeKey = (ev: any) => {
  const main = String(ev?.typeMain ?? ev?.categoryMain ?? "WORK");
  const normalizedMain = ["WORK", "DUTY", "SALARY", "BONUS", "ETC"].includes(main)
    ? main
    : "WORK";
  const sub = (ev?.typeSub ?? ev?.categorySub ?? "") as string;
  return `${normalizedMain}|${sub}`;
};

        const sorted = [...(displayEventsInView ?? [])].sort((a: any, b: any) => {
      const aS = normYMD(a.dateStart);
      const aE = normYMD(a.dateEnd ?? a.dateStart);
      const bS = normYMD(b.dateStart);
      const bE = normYMD(b.dateEnd ?? b.dateStart);

      if (aS !== bS) return aS < bS ? -1 : 1;

      const aIsRange = aS !== aE;
      const bIsRange = bS !== bE;
      if (aIsRange !== bIsRange) return aIsRange ? -1 : 1;

      return String(a.title ?? "").localeCompare(String(b.title ?? ""));
    });

    for (const ev of sorted as any[]) {
      const a = normYMD(ev.dateStart);
      const b = normYMD(ev.dateEnd ?? ev.dateStart);

      const key = eventTypeKey(ev);
      const color = (typeColors as any)[key] ?? "#22c55e";
      const fullTitle = ev.title || "일정";

      for (let row = 0; row < rows; row++) {
        const week = grid.slice(row * 7, row * 7 + 7);
        if (week.length < 7) continue;

        const ws = normYMD(week[0].date);
        const we = normYMD(week[6].date);

        if (b < ws || a > we) continue;

        const segStart = a < ws ? ws : a;
        const segEnd = b > we ? we : b;

        const startIdx = week.findIndex((d) => normYMD(d.date) === segStart);
        const endIdx = week.findIndex((d) => normYMD(d.date) === segEnd);
        if (startIdx < 0 || endIdx < 0) continue;

        const colStart = startIdx + 1;
        const colEnd = endIdx + 1;

        const line = findLine(row, colStart, colEnd);
        const showTitle = segStart === a;

        segs.push({
          id: `${ev.id}_${row}_${segStart}_${segEnd}`,
          row,
          line,
          colStart,
          colEnd,
          color,
          title: showTitle ? fullTitle : "",
          startYMD: a,
          endYMD: b,
        });
      }
    }

    return segs;
    }, [displayEventsInView, grid, typeColors]);

  // ✅ 날짜별 more 계산
  const moreCountByDate = useMemo(() => {
    const total: Record<string, number> = {};
    const visible: Record<string, number> = {};

    for (const seg of segments) {
      for (let col = seg.colStart; col <= seg.colEnd; col++) {
        const k = `${seg.row}_${col}`;
        total[k] = (total[k] ?? 0) + 1;
        if (seg.line < MAX_LINES) visible[k] = (visible[k] ?? 0) + 1;
      }
    }

    const map: Record<string, number> = {};
    const rows = Math.ceil(grid.length / 7);

    for (let row = 0; row < rows; row++) {
      const week = grid.slice(row * 7, row * 7 + 7);
      for (let i = 0; i < week.length; i++) {
        const col = i + 1;
        const k = `${row}_${col}`;
        const t = total[k] ?? 0;
        const v = visible[k] ?? 0;
        const more = Math.max(0, t - v);
        if (more > 0) map[week[i].date] = more;
      }
    }

    return map;
  }, [segments, grid]);

  // swipe
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const didSwipe = useRef(false);

  const thresholdX = 70;
  const thresholdY = 30;

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    didSwipe.current = false;
  };

const onTouchMove = (e: React.TouchEvent) => {
  const sx = touchStartX.current;
  const sy = touchStartY.current;
  if (sx == null || sy == null) return;

  const t = e.touches[0];
  const dx = t.clientX - sx;
  const dy = t.clientY - sy;

  // 세로 스크롤 의도면 스킵
  if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > thresholdY) return;

  if (!didSwipe.current && dx > thresholdX) {
    didSwipe.current = true;
    onPrevMonth();
  } else if (!didSwipe.current && dx < -thresholdX) {
    didSwipe.current = true;
    onNextMonth();
  }
};

  const onTouchEnd = () => {
    touchStartX.current = null;
    touchStartY.current = null;
    didSwipe.current = false;
  };

  return (
    <section className="w-full">
      <div
        className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-[0_10px_25px_rgba(0,0,0,0.05)]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="grid grid-cols-7">
          {DOW.map((d, idx) => {
            const cls =
              idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : "text-neutral-500";
            return (
              <div key={d} className={`py-2 text-center text-[11px] font-semibold ${cls}`}>
                {d}
              </div>
            );
          })}
        </div>

        <div className="relative mt-3 grid grid-cols-7 auto-rows-[84px]">
          {/* overlay */}
          <div className="pointer-events-none absolute inset-0 z-30 grid grid-cols-7 auto-rows-[84px]">
            {segments
              .filter((seg) => seg.line < MAX_LINES)
              .map((seg) => {
                const isContinuation = !seg.title;
                const flattenLeft = isContinuation && seg.colStart === 1;

                const continuesToNextWeek =
                  seg.colEnd === 7 &&
                  seg.endYMD > normYMD(grid[seg.row * 7 + 6].date);
                const flattenRight = continuesToNextWeek;

                return (
                  <div
                    key={seg.id}
                    className="mx-1 flex items-center min-w-0 overflow-hidden"
                    style={{
                      height: BAR_H,
                      gridRow: `${seg.row + 1}`,
                      gridColumn: `${seg.colStart} / ${seg.colEnd + 1}`,
                      marginTop: BASE_TOP + seg.line * LINE_PITCH,
                      backgroundColor: hexToRgba(seg.color, 0.16),

                      borderRadius: 6,
                      borderTopLeftRadius: flattenLeft ? 0 : 6,
                      borderBottomLeftRadius: flattenLeft ? 0 : 6,
                      borderTopRightRadius: flattenRight ? 0 : 6,
                      borderBottomRightRadius: flattenRight ? 0 : 6,
                    }}
                    title={seg.title || undefined}
                  >
                    {seg.title ? (
                      <div
                        className="px-1.5 text-[10px] font-normal min-w-0 overflow-hidden whitespace-nowrap text-clip"
                        style={{ color: "#111827" }}
                      >
                        {seg.title}
                      </div>
                    ) : null}
                  </div>
                );
              })}
          </div>

          {grid.map((day, i) => {
            // ✅✅✅ 이제 여기서 "props.holidays" 사용
            const h = (holidays as any)?.[day.date];
            const more = moreCountByDate[day.date] ?? 0;

            const row = Math.floor(i / 7);
            const col = i % 7;

            const handleTapDay = () => {
              if (day.date === selectedDate) {
                onOpenDay?.(day.date);
                return;
              }
              onSelectDate(day.date);

              // ✅ onSelectMeta로 DayDetailSheet 열기 전에 정보 저장하고 싶다면 유지
              onSelectMeta?.({
                date: day.date,
                holidayName: h?.name,
                isHoliday: Boolean(h?.isHoliday),
              });
            };

            return (
              <div
                key={day.date}
                className={[
                  "cell h-full w-full border-neutral-200",
                  col === 0 ? "" : "border-l",
                  row === 0 ? "" : "border-t",
                ].join(" ")}
              >
                <DayCell
                  day={day}
                  selected={day.date === selectedDate}
                  onSelect={handleTapDay}
                  pattern={pattern}
                  events={eventsInView}
                  onChangeEvents={onChangeEvents}
                  showWorkBadge={showWorkBadges}
                  isHoliday={Boolean(h?.isHoliday)}
                  holidayName={h?.name}
                  hasMore={more > 0}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}