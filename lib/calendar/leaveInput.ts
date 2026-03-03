// lib/calendar/leaveInput.ts
const KEY_USED = "calendar.leaveDaysUsedInput";
const KEY_TOTAL = "calendar.leaveDaysTotalInput";

function safeNumber(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function loadLeaveDaysUsedInput(): number {
  if (typeof window === "undefined") return 0;
  const v = window.localStorage.getItem(KEY_USED);
  return safeNumber(v, 0);
}

export function saveLeaveDaysUsedInput(value: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY_USED, String(safeNumber(value, 0)));
}

export function loadLeaveDaysTotalInput(): number {
  if (typeof window === "undefined") return 0;
  const v = window.localStorage.getItem(KEY_TOTAL);
  return safeNumber(v, 0);
}

export function saveLeaveDaysTotalInput(value: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY_TOTAL, String(safeNumber(value, 0)));
}