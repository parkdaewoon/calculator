import type { Opt } from "./types";

export const STEP_OPTIONS: Opt[] = Array.from({ length: 32 }, (_, i) => {
  const n = i + 1;
  return { value: String(n), label: `${n}호봉` };
});

export const YEAR_OPTIONS: Opt[] = Array.from({ length: 41 }, (_, i) => {
  return { value: String(i), label: `${i}년` };
});