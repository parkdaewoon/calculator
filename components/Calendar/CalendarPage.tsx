"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import CalendarHeader from "./CalendarHeader";
import MonthGrid from "./MonthGrid";
import SummaryBar from "./SummaryBar";
import WorkSummarySheet from "./WorkSummarySheet";
import WorkModeSheet from "./WorkModeSheet";
import AdsenseSlot from "@/components/AdsenseSlot";

import DayDetailSheet from "./DayDetailSheet";
import EventEditorSheet from "./EventEditorSheet";
import { ensureDeviceUserId } from "@/lib/push/client";
import {
  addMonths,
  buildMonthGrid,
  calcWorkStatsForMonth,
  defaultPattern,
  getToday,
  toMonthKey,
  type CalendarEvent,
  type WorkPattern,
  type YYYYMM,
  type YYYYMMDD,
} from "@/lib/calendar";

import { workModeToPattern } from "@/lib/calendar/patterns";
import {
  loadCalendarState,
  saveCalendarState,
  clearCalendarState,
} from "@/lib/storage/calendarStorage";
import type { WorkMode } from "./types";

type HolidaysMap = Record<string, { name: string; isHoliday: boolean }>;
const REMINDER_FIRED_KEY = "calendar_reminder_fired_v1";
const MAX_TIMEOUT_MS = 2_147_000_000;

function readReminderFiredMap(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(REMINDER_FIRED_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeReminderFiredMap(map: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REMINDER_FIRED_KEY, JSON.stringify(map));
  } catch {}
}

function toEventStartMs(ev: CalendarEvent): number | null {
  const ymd = normalizeYmd(ev?.dateStart);
  if (!ymd) return null;
  const [y, m, d] = ymd.split("-").map(Number);

  const time = ev?.allDay ? "09:00" : String(ev?.startTime || "09:00");
  const tm = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!tm) return null;

  const hh = Math.min(23, Math.max(0, Number(tm[1])));
  const mm = Math.min(59, Math.max(0, Number(tm[2])));
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1, hh, mm, 0, 0);
  const ms = dt.getTime();
  return Number.isFinite(ms) ? ms : null;
}
function getEventScheduleTimes(ev: CalendarEvent): {
  startMs: number | null;
  startsAtIso: string | null;
  remindAtIso: string | null;
} {
  const ymd = normalizeYmd(ev?.dateStart);
  if (!ymd) {
    return { startMs: null, startsAtIso: null, remindAtIso: null };
  }

  const [y, m, d] = ymd.split("-").map(Number);

  const time = ev?.allDay ? "09:00" : String(ev?.startTime || "09:00");
  const tm = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!tm) {
    return { startMs: null, startsAtIso: null, remindAtIso: null };
  }

  const hh = Math.min(23, Math.max(0, Number(tm[1])));
  const mm = Math.min(59, Math.max(0, Number(tm[2])));

  const startDate = new Date(y, (m ?? 1) - 1, d ?? 1, hh, mm, 0, 0);
  const startMs = startDate.getTime();

  if (!Number.isFinite(startMs)) {
    return { startMs: null, startsAtIso: null, remindAtIso: null };
  }

  const startsAtIso = new Date(startMs).toISOString();

  if (String(ev?.typeMain ?? "") === "SALARY") {
    const salaryRemindMs = new Date(y, (m ?? 1) - 1, d ?? 1, 8, 0, 0, 0).getTime();

    return {
      startMs,
      startsAtIso,
      remindAtIso: Number.isFinite(salaryRemindMs)
        ? new Date(salaryRemindMs).toISOString()
        : null,
    };
  }

  const minutes =
    typeof ev?.reminderMinutes === "number" && ev.reminderMinutes >= 0
      ? ev.reminderMinutes
      : null;

  if (minutes == null) {
    return { startMs, startsAtIso, remindAtIso: null };
  }

  const remindMs = startMs - minutes * 60 * 1000;

  return {
    startMs,
    startsAtIso,
    remindAtIso:
      Number.isFinite(remindMs) && remindMs <= startMs
        ? new Date(remindMs).toISOString()
        : null,
  };
}

function isWorkModeObject(v: any): v is WorkMode {
  return v && typeof v === "object" && typeof v.type === "string";
}

/** ✅ YYYYMMDD를 "YYYY-MM-DD"로 강제 정규화 (8자리도 받아줌) */
function normalizeYmd(v: any): YYYYMMDD {
  const s = String(v ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s as YYYYMMDD;
  if (/^\d{8}$/.test(s)) {
    const y = s.slice(0, 4);
    const m = s.slice(4, 6);
    const d = s.slice(6, 8);
    return `${y}-${m}-${d}` as YYYYMMDD;
  }
  const m = s.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` as YYYYMMDD;
  return "" as YYYYMMDD;
}

/** ✅ 이벤트 필드 마이그레이션: (startDate/endDate/date 등) -> (dateStart/dateEnd) */
function migrateEvent(raw: any, fallbackDate: YYYYMMDD): CalendarEvent {
  const dateStart =
    normalizeYmd(raw?.dateStart) ||
    normalizeYmd(raw?.startDate) ||
    normalizeYmd(raw?.date) ||
    fallbackDate;

  const dateEnd =
    normalizeYmd(raw?.dateEnd) ||
    normalizeYmd(raw?.endDate) ||
    normalizeYmd(raw?.endDate_legacy) ||
    "";

  const next: CalendarEvent = {
    id: String(raw?.id ?? crypto.randomUUID()),
    dateStart,
    ...(dateEnd ? { dateEnd } : {}),

    type: raw?.type,
    title: raw?.title,

    allDay: !!raw?.allDay,
    startTime: raw?.startTime,
    endTime: raw?.endTime,

    location: raw?.location,

    typeMain: raw?.typeMain,
    typeSub: raw?.typeSub,

    reminderMinutes:
      typeof raw?.reminderMinutes === "number" ? raw.reminderMinutes : undefined,

    memo: raw?.memo,

    leaveUnit: raw?.leaveUnit,
    leaveHours: raw?.leaveHours,
  };

  return next;
}

/** =========================
 * ✅ holidays key normalize
 * ========================= */
function normalizeHolidayKey(k: string): string {
  return normalizeYmd(k) || String(k ?? "").trim();
}

function normalizeHolidayMap(input: any): HolidaysMap {
  const out: HolidaysMap = {};
  const src = (input ?? {}) as Record<string, any>;
  for (const [k, v] of Object.entries(src)) {
    const nk = normalizeHolidayKey(k);
    if (!nk) continue;
    out[nk] = v as any;
  }
  return out;
}

/** =========================
 * ✅ holidays localStorage cache
 * ========================= */
const HOLI_CACHE_KEY = "holidays_cache_v1";

function readHolidaysCache(): Record<string, HolidaysMap> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(HOLI_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};

    // ✅ 캐시 안의 키도 혹시 모르니 정규화해서 반환
    const out: Record<string, HolidaysMap> = {};
    for (const [monthKey, holiMap] of Object.entries(parsed as any)) {
      out[monthKey] = normalizeHolidayMap(holiMap);
    }
    return out;
  } catch {
    return {};
  }
}

function writeHolidaysCache(cache: Record<string, HolidaysMap>) {
  try {
    window.localStorage.setItem(HOLI_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

export default function CalendarPage() {
  const today = useMemo<YYYYMMDD>(() => normalizeYmd(getToday()) as YYYYMMDD, []);

  const [month, setMonth] = useState<YYYYMM>(() => toMonthKey(today));
  const [selectedDate, setSelectedDate] = useState<YYYYMMDD>(() => today);
  const userId = useMemo(() => ensureDeviceUserId(), []);
  const [pattern, setPattern] = useState<WorkPattern>(() => defaultPattern(today));
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [workSummaryOpen, setWorkSummaryOpen] = useState(false);

  const [workMode, setWorkMode] = useState<WorkMode>(() => ({ type: "NONE" }));
  const [workModeOpen, setWorkModeOpen] = useState(false);

  // ✅ holidays: 캐시 ref
  const holidaysCacheRef = useRef<Record<string, HolidaysMap> | null>(null);

  // ✅ holidays state: month 바뀔 때 캐시로 먼저 채움
  const [holidays, setHolidays] = useState<HolidaysMap>(() => {
    const cache = readHolidaysCache();
    holidaysCacheRef.current = cache;
    return cache[toMonthKey(today)] ?? {};
  });
  const visibleMonths = useMemo<YYYYMM[]>(() => {
    const grid = buildMonthGrid(month);
    const set = new Set<YYYYMM>();

    for (const d of grid) {
      set.add(toMonthKey(d.date as YYYYMMDD));
    }

    return Array.from(set);
  }, [month]);
  // ✅ 로드 완료 후에만 저장하기 위한 플래그
  const [hydrated, setHydrated] = useState(false);

  const [dayDetailOpen, setDayDetailOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const reminderTimersRef = useRef<number[]>([]);

  const editingEvent = useMemo(() => {
    if (!editingId) return null;
    return (events as any[]).find((e) => e?.id === editingId) ?? null;
  }, [events, editingId]);

  /** =========================
   * 1) load persisted state
   * ========================= */
  useEffect(() => {
    const st = loadCalendarState();

    if (st) {
      if (Array.isArray(st.events)) {
        const migrated = st.events.map((e: any) => migrateEvent(e, today));
        setEvents(migrated);
      }

      let nextWorkMode: WorkMode | null = null;

      if (st.workMode) {
        if (typeof st.workMode === "string") {
          if (st.workMode === "SHIFT") {
            nextWorkMode = {
              type: "SHIFT",
              rotation: 4,
              patternId: "4_A",
              times: {},
              anchorDate: today,
            };
          } else {
            nextWorkMode = { type: "NONE" };
          }
        } else if (isWorkModeObject(st.workMode)) {
          if (st.workMode.type === "SHIFT") {
            nextWorkMode = {
              ...st.workMode,
              anchorDate: normalizeYmd((st.workMode as any).anchorDate) || today,
            } as any;
          } else {
            nextWorkMode = st.workMode;
          }
        }
      }

      if (nextWorkMode?.type === "SHIFT" && !(nextWorkMode as any).anchorDate) {
        nextWorkMode = { ...(nextWorkMode as any), anchorDate: today };
      }

      if (nextWorkMode) setWorkMode(nextWorkMode);

      if (nextWorkMode) {
        setPattern(workModeToPattern(nextWorkMode as any, today));
      } else if (st.pattern) {
        const p: any = st.pattern;
        const nextPattern =
          p?.anchorDate
            ? { ...p, anchorDate: normalizeYmd(p.anchorDate) || today }
            : p;
        setPattern(nextPattern);
      } else {
        setPattern(defaultPattern(today));
      }
    }

    // ✅ 로드가 끝났다고 표시 (이후부터만 save effect 실행)
    setHydrated(true);
  }, [today]);

  /** =========================
   * 1.5) month가 바뀌면: 캐시를 즉시 적용
   * ========================= */
    useEffect(() => {
    if (!holidaysCacheRef.current) holidaysCacheRef.current = readHolidaysCache();

    const cache = holidaysCacheRef.current ?? {};
    const merged: HolidaysMap = {};

    for (const ym of visibleMonths) {
      Object.assign(merged, cache[ym] ?? {});
    }

    setHolidays(merged);
  }, [visibleMonths]);

  /** =========================
   * 2) persist state (hydrated 이후만)
   * ========================= */
  useEffect(() => {
    if (!hydrated) return;

    const safeEvents = (events ?? []).map((e: any) => migrateEvent(e, today));

    saveCalendarState({
  pattern,
  events: safeEvents,
  workMode,
  month: toMonthKey(today),
  selectedDate: today,
});
  }, [hydrated, pattern, events, workMode, month, selectedDate, today]);

  /** =========================
   * 3) holidays fetch when month changes
   * ========================= */
    useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const cache = holidaysCacheRef.current ?? readHolidaysCache();
        const nextCache = { ...cache };

        await Promise.all(
          visibleMonths.map(async (ym) => {
            // 이미 캐시에 있으면 스킵
            if (nextCache[ym]) return;

            const res = await fetch(`/api/holidays?month=${ym}`, { cache: "no-store" });
            const data = await res.json();

            nextCache[ym] = normalizeHolidayMap(data?.holidays ?? {});
          })
        );

        if (!alive) return;

        holidaysCacheRef.current = nextCache;
        writeHolidaysCache(nextCache);

        const merged: HolidaysMap = {};
        for (const ym of visibleMonths) {
          Object.assign(merged, nextCache[ym] ?? {});
        }

        setHolidays((prev) => {
          const a = JSON.stringify(prev);
          const b = JSON.stringify(merged);
          return a === b ? prev : merged;
        });
      } catch {
        if (!alive) return;
      }
    })();

    return () => {
      alive = false;
    };
  }, [visibleMonths]);

  const stats = useMemo(() => {
    return calcWorkStatsForMonth({ month, pattern, events, workMode, holidays } as any);
  }, [month, pattern, events, workMode, holidays]);

  const goPrev = () => setMonth((m) => addMonths(m, -1));
  const goNext = () => setMonth((m) => addMonths(m, +1));

  const onClear = () => {
    const ok = window.confirm("달력 데이터를 초기화할까요? (일정/설정 포함)");
    if (!ok) return;

    setEvents([]);
    const wm: WorkMode = { type: "NONE" };
    setWorkMode(wm);
    setPattern(workModeToPattern(wm as any, today));
    setMonth(toMonthKey(today));
    setSelectedDate(today);

    setDayDetailOpen(false);
    setEditorOpen(false);
    setEditingId(null);

    try {
      window.localStorage.removeItem(HOLI_CACHE_KEY);
    } catch {}
    holidaysCacheRef.current = {};
    setHolidays({});

    clearCalendarState();
  };

  const upsertEvent = async (ev: CalendarEvent) => {
  const fixed = migrateEvent(ev as any, selectedDate || today);

  setEvents((prev) => {
    const i = (prev as any[]).findIndex((x) => x?.id === (fixed as any).id);
    if (i >= 0) {
      const copy = [...prev] as any[];
      copy[i] = fixed as any;
      return copy as any;
    }
    return [...prev, fixed] as any;
  });

  try {
    const { startMs, startsAtIso, remindAtIso } = getEventScheduleTimes(fixed);

console.log("[saveEvent] payload times", {
  title: fixed.title,
  fixed,
  startMs,
  startsAtIso,
  remindAtIso,
  reminderMinutes: fixed.reminderMinutes,
  dateStart: fixed.dateStart,
  startTime: fixed.startTime,
  allDay: fixed.allDay,
});

if (!startMs || !startsAtIso) {
  console.error("[saveEvent] invalid start time", fixed);
  return;
}

const res = await fetch("/api/calendar-events/upsert", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-device-id": userId,
  },
  body: JSON.stringify({
    id: fixed.id,
    title: fixed.title ?? null,
    starts_at: startsAtIso,
    remind_at: remindAtIso,
    reminder_sent: false,
    type_main: fixed.typeMain ?? null,
  }),
});

    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) {
      console.error("calendar event upsert failed", json);
    }
  } catch (e) {
    console.error("calendar event upsert failed", e);
  }
};

  const deleteEvent = async (id: string) => {
  try {
    const res = await fetch("/api/calendar-events/delete", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-device-id": userId,
  },
  body: JSON.stringify({ id }),
});

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.ok) {
      console.error("calendar event delete failed", json);
      alert("일정 삭제에 실패했어요.");
      return;
    }

    setEvents((prev) => (prev as any[]).filter((x) => x?.id !== id) as any);
  } catch (e) {
    console.error("calendar event delete failed", e);
    alert("일정 삭제 중 오류가 발생했어요.");
  }
};

  return (
    <main className="min-h-screen bg-neutral-50 pb-24">
      <CalendarHeader
  month={month}
  onGoToday={() => {
    setMonth(toMonthKey(today));
    setSelectedDate(today);
  }}
  onOpenWorkMode={() => setWorkModeOpen(true)}
  onClear={onClear}
  onChangeMonth={(next) => {
  setMonth(next);
  setSelectedDate((prev) => (toMonthKey(prev) === next ? prev : (next + "-01") as any));
  }}
/>

      <div className="mt-3 space-y-4">
        <MonthGrid
          month={month}
          selectedDate={selectedDate}
          onSelectDate={(d) => setSelectedDate(normalizeYmd(d) || today)}
          pattern={pattern}
          events={events}
          onChangeEvents={setEvents}
          showWorkBadges={workMode.type === "SHIFT"}
          onPrevMonth={goPrev}
          onNextMonth={goNext}
          onOpenDay={(d) => {
            const nd = normalizeYmd(d) || today;
            setSelectedDate(nd);
            setDayDetailOpen(true);
          }}
          holidays={holidays}
        />

        <SummaryBar stats={stats} onOpenWorkSummary={() => setWorkSummaryOpen(true)} />
      </div>

      <section className="pt-2">
        <div className="mt-2 h-px bg-neutral-100" />
      
        <div className="mt-4 flex justify-center">
          <div className="w-full max-w-[390px] rounded-2xl border border-neutral-100 bg-white px-2 py-2 text-center shadow-[0_6px_18px_rgba(0,0,0,0.04)]">
            <AdsenseSlot slot="1234567890" height={50} />
          </div>
        </div>
      </section>


      <WorkSummarySheet
        open={workSummaryOpen}
        onClose={() => setWorkSummaryOpen(false)}
        stats={stats}
        month={month}
      />

      <WorkModeSheet
        open={workModeOpen}
        onClose={() => setWorkModeOpen(false)}
        value={workMode}
        onChange={(v) => {
          const next: WorkMode =
            v.type === "SHIFT"
              ? ({ ...v, anchorDate: normalizeYmd((v as any).anchorDate) || today } as any)
              : v;

          setWorkMode(next);
          setPattern(workModeToPattern(next as any, today));
          setWorkModeOpen(false);
        }}
      />

      <DayDetailSheet
        open={dayDetailOpen}
        date={selectedDate}
        events={events}
        pattern={pattern}
        workMode={workMode}
        holidays={holidays}
        onClose={() => setDayDetailOpen(false)}
        onAdd={() => {
          setEditingId(null);
          setEditorOpen(true);
        }}
        onEdit={(id) => {
          setEditingId(id);
          setEditorOpen(true);
        }}
      />

      <EventEditorSheet
        open={editorOpen}
        date={selectedDate}
        event={editingEvent as any}
        onClose={() => setEditorOpen(false)}
        onSave={async (ev) => {
    await upsertEvent(ev);
  }}
  onDelete={async (id) => {
    await deleteEvent(id);
    }}
      />
    </main>
  );
}
