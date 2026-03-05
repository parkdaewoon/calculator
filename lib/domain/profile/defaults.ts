import type { BaseProfile } from "./types";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function makeDefaultProfile(): BaseProfile {
  const today = todayISO();
  // ✅ 기본: 오늘 임용/오늘 퇴직(사용자가 바꾸게)
  return {
    version: 1,
    series: "general",
    columnKey: "g9",
    step: 1,
    startDate: today,
    retireDate: today,
  };
}
