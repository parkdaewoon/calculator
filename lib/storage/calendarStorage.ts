// lib/storage/calendarStorage.ts
import type { CalendarEvent, WorkPattern, YYYYMM, YYYYMMDD } from "@/lib/calendar";
import type { WorkMode } from "@/components/Calendar/types";

export type CalendarPersistedState = {
  pattern?: WorkPattern;
  events?: CalendarEvent[];
  workMode?: WorkMode;
  month?: YYYYMM;
  selectedDate?: YYYYMMDD;
};

const KEY = "calendar_state_v1";

export function loadCalendarState(): CalendarPersistedState | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CalendarPersistedState;
  } catch (err) {
    console.warn("[calendarStorage] load failed:", err);
    return null;
  }
}

type SaveOptions = { force?: boolean };

export function saveCalendarState(partial: CalendarPersistedState, opts: SaveOptions = {}) {
  try {
    if (typeof window === "undefined") return;

    const prev = loadCalendarState() ?? {};
    const next: CalendarPersistedState = { ...prev, ...partial };

    // ✅ 방어: force가 아닐 때는 "빈 배열"로 기존 데이터를 덮지 않게 막기
    if (!opts.force) {
      if (Array.isArray(partial.events) && partial.events.length === 0 && (prev.events?.length ?? 0) > 0) {
        next.events = prev.events;
      }
    }

    localStorage.setItem(KEY, JSON.stringify(next));

    // ✅ 디버그 (원인 잡히면 삭제 가능)
    // eslint-disable-next-line no-console
    console.log("[calendarStorage] saved", {
      hasPrevEvents: (prev.events?.length ?? 0) > 0,
      partialEventsLen: partial.events?.length,
      nextEventsLen: next.events?.length,
      month: next.month,
      selectedDate: next.selectedDate,
    });
  } catch (err) {
    console.warn("[calendarStorage] save failed:", err);
  }
}

export function clearCalendarState() {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(KEY);
    // eslint-disable-next-line no-console
    console.log("[calendarStorage] cleared");
  } catch (err) {
    console.warn("[calendarStorage] clear failed:", err);
  }
}