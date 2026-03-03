// lib/calendar/overtimeInput.ts

function keyForMonth(yyyyMm: string) {
  // 예: "2026-03"
  return `calendar.overtimeHoursInput:${yyyyMm}`;
}

export function loadOvertimeHoursInput(yyyyMm: string): number {
  if (typeof window === "undefined") return 0;
  const v = window.localStorage.getItem(keyForMonth(yyyyMm));
  const n = v ? Number(v) : 0;
  return Number.isFinite(n) ? n : 0;
}

export function saveOvertimeHoursInput(yyyyMm: string, value: number) {
  if (typeof window === "undefined") return;
  const n = Number.isFinite(value) && value >= 0 ? value : 0;
  window.localStorage.setItem(keyForMonth(yyyyMm), String(n));
}