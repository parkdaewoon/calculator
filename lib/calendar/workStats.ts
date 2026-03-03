// lib/calendar/workStats.ts
import type { HHMM, TimeRange, ShiftCode, WorkMode } from "@/components/Calendar/types";

const MINUTES_PER_DAY = 24 * 60;

function toMinutes(hhmm: HHMM): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// ✅ DANG: start=end이면 24h로 취급(다른 파일과 동일하게)
function expandRange(range: TimeRange, code?: ShiftCode): Array<[number, number]> {
  const s = toMinutes(range.start);
  const e = toMinutes(range.end);

  if (s === e) {
    if (code === "DANG") return [[0, MINUTES_PER_DAY]];
    return [];
  }
  if (s < e) return [[s, e]];
  return [
    [s, MINUTES_PER_DAY],
    [0, e],
  ];
}

function overlapMinutes(a: Array<[number, number]>, b: Array<[number, number]>): number {
  let sum = 0;
  for (const [as, ae] of a) {
    for (const [bs, be] of b) {
      const s = Math.max(as, bs);
      const e = Math.min(ae, be);
      if (s < e) sum += e - s;
    }
  }
  return sum;
}

// ✅ 야간창: 22:00~06:00
const NIGHT_WINDOW: TimeRange = { start: "22:00", end: "06:00" };

function getBreakMinutesForCode(workMode: WorkMode, code: ShiftCode): number {
  if (workMode.type === "DAY") {
    return Number((workMode as any).day?.breakMinutes ?? 0);
  }
  if (workMode.type === "SHIFT") {
    return Number((workMode as any).times?.[code]?.breakMinutes ?? 0);
  }
  return 0;
}

function getWorkMinutesForCode(workMode: WorkMode, code: ShiftCode): number {
  if (workMode.type === "DAY") {
    // DAY 모드도 breakMinutes 반영(다른 파일과 일관)
    const raw = overlapMinutes(expandRange(workMode.day as any), [[0, MINUTES_PER_DAY]]);
    const br = getBreakMinutesForCode(workMode, "DAY" as any);
    return Math.max(0, raw - br);
  }
  if (workMode.type !== "SHIFT") return 0;

  if (code === "OFF" || code === "REST") return 0;
  const tr = (workMode as any).times?.[code];
  if (!tr) return 0;

  const raw = overlapMinutes(expandRange(tr, code), [[0, MINUTES_PER_DAY]]);
  const br = getBreakMinutesForCode(workMode, code);
  return Math.max(0, raw - br);
}

function getNightMinutesForCode(workMode: WorkMode, code: ShiftCode): number {
  if (workMode.type !== "SHIFT") return 0;
  if (code === "OFF" || code === "REST") return 0;

  const tr = (workMode as any).times?.[code];
  if (!tr) return 0;

  const rawNight = overlapMinutes(expandRange(tr, code), expandRange(NIGHT_WINDOW));
  const rawWork = overlapMinutes(expandRange(tr, code), [[0, MINUTES_PER_DAY]]);

  const br = getBreakMinutesForCode(workMode, code);
  const netWork = Math.max(0, rawWork - br);

  if (rawWork <= 0) return 0;

  // ✅ 휴게 위치를 모르면 night에서 임의로 빼면 튀므로 "비율 근사"로 일관
  const ratio = netWork / rawWork;
  return Math.max(0, Math.round(rawNight * ratio));
}

function minutesToHours(min: number) {
  return min / 60;
}

function isWeekdayFromYmd(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const day = dt.getDay(); // 0=일,6=토
  return day !== 0 && day !== 6;
}

export type CalendarWorkDay = {
  date: string; // YYYY-MM-DD
  code: ShiftCode;
  isHoliday: boolean; // 주말/공휴일 등 “휴일 여부”
};

export type WorkStats = {
  totalHours: number;
  nightHours: number;
  holidayDays: number;
  normalHours: number;
};

export function calcWorkStats(params: { workMode: WorkMode; days: CalendarWorkDay[] }): WorkStats {
  const { workMode, days } = params;

  let totalMin = 0;
  let nightMin = 0;
  let holidayDays = 0;

  let normalWorkDays = 0;

  for (const d of days) {
    if (isWeekdayFromYmd(d.date) && !d.isHoliday) {
      normalWorkDays += 1;
    }

    const workMin = getWorkMinutesForCode(workMode, d.code);
    totalMin += workMin;

    nightMin += getNightMinutesForCode(workMode, d.code);

    // ✅ stats.ts 규칙과 맞춤:
    //  1) 휴일 + DAY + net>=8h
    //  2) 휴일 + EVE + net>=8h
    //  3) 휴일 + DANG (시간조건 없음)
    if (d.isHoliday) {
      const isCounted =
        (d.code === "DAY" && workMin >= 8 * 60) ||
        (d.code === "EVE" && workMin >= 8 * 60) ||
        d.code === "DANG";

      if (isCounted) holidayDays += 1;
    }
  }

  return {
    totalHours: minutesToHours(totalMin),
    nightHours: minutesToHours(nightMin),
    holidayDays,
    normalHours: normalWorkDays * 8,
  };
}