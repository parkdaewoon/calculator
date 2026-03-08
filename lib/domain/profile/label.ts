import type { BaseProfile } from "./types";

export function ymdLabel(ts: number) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** "YYYY-MM-DD  9급 3호봉" 같은 라벨. gradeGuess는 columnKey/label로 추정해서 나중에 붙이면 됨 */
export function makeProfileLabel(p: BaseProfile, gradeGuess?: number) {
  const g = gradeGuess ?? undefined;
  const left = ymdLabel(Date.now());
  const mid = g ? `${g}급` : `직급`;
  return `${left}  ${mid} ${p.step}호봉`;
}
