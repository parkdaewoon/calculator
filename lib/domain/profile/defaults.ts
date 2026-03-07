import type { BaseProfile } from "./types";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function makeDefaultProfile(): BaseProfile {
  const today = todayISO();
  return {
    version: 1,
    series: "general",
    columnKey: "g9",
    step: 1,
    startDate: today,
    retireDate: today,
    birthDate: today,

    startSeries: "general",
    startColumnKey: "g9",
    startStep: 1,

    currentSeries: "general",
    currentColumnKey: "g9",
    currentStep: 1,

    promotions: [],
    incomeMode: "auto",
    avgIncomeMonthly: 0,
  };
}
