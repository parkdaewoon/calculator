import type { WorkCode, WorkPattern, YYYYMMDD } from "./types";

function daysBetween(a: YYYYMMDD, b: YYYYMMDD) {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.floor((db - da) / (24 * 3600 * 1000));
}

export function getWorkCodeForDate(pattern: WorkPattern, date: YYYYMMDD): WorkCode {
  const cycle = pattern.cycle;
  if (!cycle.length) return "REST";

  const diff = daysBetween(pattern.anchorDate, date);
  const idx = ((diff % cycle.length) + cycle.length) % cycle.length;
  return cycle[idx];
}

export function defaultPattern(today: YYYYMMDD): WorkPattern {
  return {
    id: "default-jybh",
    name: "주야비휴",
    cycle: ["DAY", "NIGHT", "OFF", "REST"],
    anchorDate: today,
    dayHours: 8,
    nightHours: 8,
  };
}

/** ========= WorkMode -> WorkPattern ========= */

type ShiftCode = "DAY" | "EVE" | "NIGHT" | "DANG" | "OFF" | "REST";
type HHMM = `${number}${number}:${number}${number}`;
type TimeRange = { start: HHMM; end: HHMM };
type ShiftPatternId = "2_A" | "2_B" | "3_A" | "3_B" | "4_A" | "4_B" | "CUSTOM"; // ✅ CUSTOM 추가

export type WorkModeLite =
  | { type: "NONE" }
  | { type: "DAY"; day: TimeRange }
  | {
      type: "SHIFT";
      rotation: 2 | 3 | 4;
      patternId: ShiftPatternId;
      times: Partial<Record<ShiftCode, TimeRange>>;
      anchorDate: YYYYMMDD;
      customCycle?: WorkCode[]; // ✅ 직접입력 패턴
    };

// ✅ 1번(추천) : SHIFT_CYCLES는 "내장 패턴"만 가지게 해서 CUSTOM 키 요구를 없앰
type BuiltInShiftPatternId = Exclude<ShiftPatternId, "CUSTOM">;

const SHIFT_CYCLES: Record<BuiltInShiftPatternId, WorkCode[]> = {
  "2_A": ["DAY", "DAY", "NIGHT", "NIGHT", "REST", "REST"],
  "2_B": ["DAY", "NIGHT", "OFF"],
  "3_A": ["DAY", "DAY", "EVE", "EVE", "NIGHT", "NIGHT", "REST"],
  "3_B": ["DAY", "EVE", "NIGHT", "REST"],
  "4_A": ["DAY", "NIGHT", "OFF", "REST"],
  "4_B": ["DANG", "OFF", "REST", "REST"],
};

function minutes(hhmm: HHMM) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function rangeToHours(r: TimeRange) {
  const s = minutes(r.start);
  const e = minutes(r.end);
  const diff = e >= s ? e - s : 24 * 60 - s + e;
  return diff / 60;
}

/**
 * ✅ 핵심:
 * - NONE/DAY에는 anchorDate가 없으므로 fallbackAnchorDate를 반드시 인자로 받는다.
 * - SHIFT는 mode.anchorDate를 사용한다.
 */
export function workModeToPattern(mode: WorkModeLite, fallbackAnchorDate: YYYYMMDD): WorkPattern {
  if (mode.type === "NONE") {
    return { id: "none", name: "표시안함", cycle: [], anchorDate: fallbackAnchorDate };
  }

  if (mode.type === "DAY") {
    return {
      id: "daywork",
      name: "일근",
      cycle: ["DAY"],
      anchorDate: fallbackAnchorDate,
      dayHours: rangeToHours(mode.day),
    };
  }

  const cycle =
    mode.patternId === "CUSTOM"
      ? mode.customCycle?.length
        ? mode.customCycle
        : (["DAY", "NIGHT", "OFF", "REST"] as WorkCode[])
      : (SHIFT_CYCLES[mode.patternId] ?? (["DAY", "NIGHT", "OFF", "REST"] as WorkCode[]));

  return {
    id: `shift-${mode.patternId}`,
    name: mode.patternId === "CUSTOM" ? "교대근무(직접입력)" : "교대근무",
    cycle,
    anchorDate: mode.anchorDate,
    dayHours: mode.times.DAY ? rangeToHours(mode.times.DAY) : 8,
    eveHours: mode.times.EVE ? rangeToHours(mode.times.EVE) : 8,
    nightHours: mode.times.NIGHT ? rangeToHours(mode.times.NIGHT) : 8,
    dangHours: mode.times.DANG ? rangeToHours(mode.times.DANG) : 8,
  };
}