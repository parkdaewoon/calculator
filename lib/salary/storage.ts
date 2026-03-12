import { PAY_TABLES } from "@/lib/payTables";
import { columnKeyToGradeGuess } from "./helpers";
import type { SalaryHistoryItem, SalaryInputs } from "./types";

export const DRAFT_KEY = "salary_calc_inputs_draft_v1";
export const HISTORY_KEY = "salary_calc_inputs_history_v1";
export const HISTORY_MAX = 5;

export function safeParseJSON<T>(raw: string | null): T | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadDraft(): SalaryInputs | null {
  if (typeof window === "undefined") return null;
  return safeParseJSON<SalaryInputs>(localStorage.getItem(DRAFT_KEY));
}

export function saveDraft(inputs: SalaryInputs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(inputs));
}

export function loadHistory(): SalaryHistoryItem[] {
  if (typeof window === "undefined") return [];
  return (
    safeParseJSON<SalaryHistoryItem[]>(localStorage.getItem(HISTORY_KEY)) ?? []
  );
}

export function saveHistory(list: SalaryHistoryItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}

export function makeHistoryLabel(inputs: SalaryInputs) {
  const gradeGuess = columnKeyToGradeGuess(inputs.series, inputs.columnKey);

  const seriesLabel =
    PAY_TABLES[inputs.series]?.title ?? String(inputs.series);

  return `${seriesLabel} ${gradeGuess}급 ${inputs.step}호봉`;
}

export function addHistorySnapshot(inputs: SalaryInputs) {
  const now = Date.now();

  const item: SalaryHistoryItem = {
    id: `${now}_${Math.random().toString(16).slice(2)}`,
    savedAt: now,
    label: makeHistoryLabel(inputs),
    inputs,
  };

  const prev = loadHistory();
  const next = [item, ...prev].slice(0, HISTORY_MAX);
  saveHistory(next);

  return next;
}