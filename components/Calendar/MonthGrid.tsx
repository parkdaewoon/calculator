"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { MonthGridProps } from "./types";
import DayCell from "./DayCell";
import { buildMonthGrid, getMonthRange } from "@/lib/calendar";
import { fetchHolidays, type HolidayMap } from "@/lib/holidays";

import { loadTypeColors } from "@/lib/storage/typeColorStorage";
import { hexToRgba } from "@/lib/calendar/typeColors";

const DOW = ["일", "월", "화", "수", "목", "금", "토"] as const;

// ✅ 아이폰 느낌: 한 칸에서 보여줄 최대 라인 수
const MAX_LINES = 3;

// ✅ 겹침 방지(바닥 ... 공간 확보용)
const BAR_H = 14; // 기존 16
const BASE_TOP = 26; // 기존 28
const LINE_PITCH = 16; // 기존 18

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
}: MonthGridProps) {
  const grid = useMemo(() => buildMonthGrid(month), [month]);
  const { start, end } = useMemo(() => getMonthRange(month), [month]);

  function normYMD(v: string) {
    const m = String(v ?? "").match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (!m) return String(v ?? "").slice(0, 10);
    return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  }

  const eventsInView = useMemo(() => {
    const s = normYMD(start);
    const e = normYMD(end);

    return (events ?? []).filter((ev: any) => {
      const a = normYMD(ev.dateStart);
      const b = normYMD(ev.dateEnd ?? ev.dateStart);
      return !(b < s || a > e);
    });
  }, [events, start, end]);

  const [holidayMap, setHolidayMap] = useState<HolidayMap>({} as HolidayMap);

  useEffect(() => {
    let alive = true;
    fetchHolidays(month)
      .then((m) => {
        if (!alive) return;
        setHolidayMap(m);
      })
      .catch(() => {
        if (!alive) return;
        setHolidayMap({} as HolidayMap);
      });
    return () => {
      alive = false;
    };
  }, [month]);

  const typeColors = useMemo(() => loadTypeColors(), []);

  // ✅ 하루/기간 이벤트를 모두 "주(row) 점유"로 라인 배치해서 seg로 만들기
  const segments = useMemo(() => {
    type Seg = {
      id: string;
      row: number; // week row (0-based)
      line: number; // stack line within the week (0,1,2...)
      colStart: number; // 1..7
      colEnd: number; // 1..7 inclusive
      color: string;
      title: string; // 시작 segment에서만 텍스트
      startYMD: string; // 더보기 계산용
      endYMD: string; // 더보기 계산용
    };

    const segs: Seg[] = [];
    const rows = Math.ceil(grid.length / 7);

    // row별 line 점유 기록
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
      const main = (ev?.typeMain ?? ev?.categoryMain ?? "WORK") as string;
      const sub = (ev?.typeSub ?? ev?.categorySub ?? "") as string;
      return `${main === "DUTY" ? "DUTY" : "WORK"}|${sub}`;
    };

    // ✅ iOS 느낌: 시작일 빠른 순, "기간"을 "하루"보다 먼저
    const sorted = [...(eventsInView ?? [])].sort((a: any, b: any) => {
      const aS = normYMD(a.dateStart);
      const aE = normYMD(a.dateEnd ?? a.dateStart);
      const bS = normYMD(b.dateStart);
      const bE = normYMD(b.dateEnd ?? b.dateStart);

      if (aS !== bS) return aS < bS ? -1 : 1;

      const aIsRange = aS !== aE;
      const bIsRange = bS !== bE;
      if (aIsRange !== bIsRange) return aIsRange ? -1 : 1;

      // 같은 타입이면 제목으로 안정 정렬
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

        // ✅ "진짜 시작일" segment에서만 텍스트 표시
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
  }, [eventsInView, grid, typeColors]);

  // ✅ 날짜별 more 계산 (해당 날짜 칸에 걸린 seg가 MAX_LINES를 초과하면 more>0)
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
        if (more > 0) {
          map[week[i].date] = more;
        }
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

    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > thresholdY) return;

    if (!didSwipe.current && dx > thresholdX) {
      didSwipe.current = true;
      onPrevMonth();
      e.preventDefault();
    } else if (!didSwipe.current && dx < -thresholdX) {
      didSwipe.current = true;
      onNextMonth();
      e.preventDefault();
    }
  };

  const onTouchEnd = () => {
    touchStartX.current = null;
    touchStartY.current = null;
    didSwipe.current = false;
  };

  return (
    <section className="mx-auto w-full max-w-md px-4">
      <div
        className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-[0_10px_25px_rgba(0,0,0,0.05)]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="grid grid-cols-7">
          {DOW.map((d, idx) => {
            const cls =
              idx === 0
                ? "text-red-500"
                : idx === 6
                ? "text-blue-500"
                : "text-neutral-500";
            return (
              <div
                key={d}
                className={`py-2 text-center text-[11px] font-semibold ${cls}`}
              >
                {d}
              </div>
            );
          })}
        </div>

        <div
          className={[
            "relative mt-3 grid grid-cols-7 auto-rows-[84px]",
            "[&>*]:border-r [&>*]:border-b [&>*]:border-neutral-200",
            "[&>*:nth-child(7n)]:border-r-0",
            "[&>*:nth-last-child(-n+7)]:border-b-0",
          ].join(" ")}
        >
          {/* ✅ iOS 스타일 overlay: 하루/기간 이벤트를 한 레이어에서 라인 쌓기 */}
          <div className="pointer-events-none absolute inset-0 z-30 grid grid-cols-7 auto-rows-[84px]">
            {segments
  .filter((seg) => seg.line < MAX_LINES)
  .map((seg) => {
    const isContinuation = !seg.title;           // 이전 주에서 넘어온 조각(진짜 시작 아님)
    const flattenLeft = isContinuation && seg.colStart === 1; // ✅ 주 첫칸인데 이어짐이면 왼쪽 직선

    // ✅ 주 마지막칸(colEnd=7)에서 끝났는데, 실제 이벤트는 더 이어지면 오른쪽 직선
    const continuesToNextWeek = seg.colEnd === 7 && seg.endYMD > normYMD(grid[seg.row * 7 + 6].date);
    const flattenRight = continuesToNextWeek;    // ✅ 주 끝인데 다음 주로 이어지면 오른쪽 직선

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

          // ✅ 기본 둥글게, 이어짐 방향은 직선 처리
          borderRadius: 6,
          borderTopLeftRadius: flattenLeft ? 0 : 6,
          borderBottomLeftRadius: flattenLeft ? 0 : 6,
          borderTopRightRadius: flattenRight ? 0 : 6,
          borderBottomRightRadius: flattenRight ? 0 : 6,
        }}
        title={seg.title || undefined}
      >
        {/* 텍스트(시작 segment에서만) */}
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

          {grid.map((day) => {
  const h = holidayMap[day.date];
  const more = moreCountByDate[day.date] ?? 0;

  const handleTapDay = () => {
    // ✅ 이미 선택된 날짜를 다시 탭하면 상세 오픈
    if (day.date === selectedDate) {
      onOpenDay?.(day.date);
      return;
    }

    // ✅ 첫 탭은 선택만(검정 테두리)
    onSelectDate(day.date);
    onSelectMeta?.({
      date: day.date,
      holidayName: h?.name,
      isHoliday: Boolean(h?.isHoliday),
    });
  };

  return (
    <DayCell
      key={day.date}
      day={day}
      selected={day.date === selectedDate}
      onSelect={handleTapDay}
      onOpenDay={undefined} // 이제 필요 없음(안 내려도 됨)
      pattern={pattern}
      events={eventsInView}
      onChangeEvents={onChangeEvents}
      showWorkBadge={showWorkBadges}
      isHoliday={Boolean(h?.isHoliday)}
      hasMore={more > 0}
    />
  );
})}
        </div>
      </div>
    </section>
  );
}