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

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    return parsed as CalendarPersistedState;
  } catch (err) {
    console.warn("[calendarStorage] load failed:", err);
    return null;
  }
}

type SaveOptions = {
  force?: boolean;
};

export function saveCalendarState(
  partial: CalendarPersistedState,
  opts: SaveOptions = {}
) {
  try {
    if (typeof window === "undefined") return;

    const prev = loadCalendarState() ?? {};
    const next: CalendarPersistedState = { ...prev, ...partial };

    // ✅ 방어 1) events가 undefined면 기존 유지
    if (partial.events === undefined) {
      next.events = prev.events;
    }

    // ✅ 방어 2) force가 아닐 때: 빈 배열이 기존 이벤트를 덮지 못하게
    if (!opts.force) {
      const prevLen = prev.events?.length ?? 0;
      const partialLen = partial.events?.length ?? -1; // undefined면 -1

      if (Array.isArray(partial.events) && partial.events.length === 0 && prevLen > 0) {
        next.events = prev.events;
      }

      // ✅ 혹시라도 partial.events가 []로 들어오고 prev도 없으면 그냥 저장(정상)
      // (prevLen=0이면 허용)
    }

    localStorage.setItem(KEY, JSON.stringify(next));

    // eslint-disable-next-line no-console
    // console.log("[calendarStorage] saved", {
    //   prevLen: prev.events?.length,
    //   partialLen: partial.events?.length,
    //   nextLen: next.events?.length,
    // });
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