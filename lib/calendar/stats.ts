// lib/calendar/stats.ts
import type {
  CalcWorkStatsParams,
  WorkStats,
  YYYYMMDD,
  WorkCode,
  CalendarEvent,
} from "./types";
import { getMonthRange, iterateDates, isWeekend } from "./date";
import { getWorkCodeForDate } from "./patterns";

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function isWorkedCode(code: WorkCode) {
  return code === "DAY" || code === "EVE" || code === "NIGHT" || code === "DANG";
}

function hoursForCode(pattern: CalcWorkStatsParams["pattern"], code: WorkCode) {
  const dayH = pattern.dayHours ?? 8;
  const eveH = pattern.eveHours ?? 8;
  const nightH = pattern.nightHours ?? 8;
  const dangH = pattern.dangHours ?? 8;

  switch (code) {
    case "DAY":
      return dayH;
    case "EVE":
      return eveH;
    case "NIGHT":
      return nightH;
    case "DANG":
      return dangH;
    default:
      return 0;
  }
}

/** ====== 시간 유틸 (workMode.times 반영용) ====== */
const MINUTES_PER_DAY = 24 * 60;

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * ✅ DANG은 start=end 입력이 많음 → 24h로 취급
 */
function expandRange(
  start: string,
  end: string,
  code?: WorkCode
): Array<[number, number]> {
  const s = toMinutes(start);
  const e = toMinutes(end);

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

function overlapMinutes(a: Array<[number, number]>, b: Array<[number, number]>) {
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

function minutesToHours(min: number) {
  return min / 60;
}

/** ✅ 야간창: 22:00~06:00 */
const NIGHT_WINDOW = { start: "22:00", end: "06:00" };

/**
 * workMode 기준으로 "그 코드의 실제 근무구간"을 가져온다.
 * - SHIFT: times[code]
 * - DAY: day (근무코드와 무관하게 동일 구간)
 * - NONE/기타: null
 */
function getWorkRangeFromWorkMode(
  workMode: any,
  code: WorkCode
): { start: string; end: string } | null {
  if (!workMode) return null;
  if (workMode.type === "NONE") return null;

  if (workMode.type === "DAY") {
    const day = workMode.day;
    if (!day?.start || !day?.end) return null;
    return { start: day.start, end: day.end };
  }

  if (workMode.type === "SHIFT") {
    if (!isWorkedCode(code)) return null;
    const tr = workMode.times?.[code];
    if (!tr?.start || !tr?.end) return null;
    return { start: tr.start, end: tr.end };
  }

  return null;
}

function getBreakMinutesFromWorkMode(workMode: any, code: WorkCode): number {
  if (!workMode) return 0;

  if (workMode.type === "DAY") {
    return Number(workMode.day?.breakMinutes ?? 0);
  }

  if (workMode.type === "SHIFT") {
    return Number(workMode.times?.[code]?.breakMinutes ?? 0);
  }

  return 0;
}

type HolidaysMap = Record<string, { name: string; isHoliday: boolean }>;

function isHolidayLike(d: YYYYMMDD, holidays?: HolidaysMap | null) {
  return isWeekend(d) || !!holidays?.[d]?.isHoliday;
}

function isWeekday(d: YYYYMMDD) {
  return !isWeekend(d);
}

/**
 * ✅ 규칙(확정)
 * 1) SHIFT: 월 순근무시간(totalMin)에는 NIGHT 포함(그대로 더함)
 * 2) 휴일근무일수(holidayDays) 카운트:
 *    - 휴일 + DAY + net>=8h
 *    - 휴일 + EVE + net>=8h
 *    - 휴일 + DANG (조건 없음)
 *    (NIGHT는 holidayDays에 포함하지 않음)
 * 3) 휴일공제시간(총근무시간에서 뺄 시간):
 *    - 휴일 + DAY/EVE + net>=8h  => netWorkMin 공제
 *    - 휴일 + DANG              => 8h 고정 공제
 *    - NIGHT는 공제하지 않음(월 순근무시간에 남김)
 * 4) 야간수당시간(nightHours):
 *    - "휴일근무로 인정되는 날"(DAY/EVE>=8h 또는 DANG)은 nightHours에서 제외
 *    - NIGHT는 휴일이라도 제외 대상 아님(=그대로 야간시간 누적)
 */
export function calcWorkStatsForMonth(
  params: CalcWorkStatsParams & { workMode?: any; holidays?: HolidaysMap }
): WorkStats {
  const { month, pattern, events } = params;
  const workMode = (params as any).workMode;
  const holidays = (params as any).holidays as HolidaysMap | undefined;

  const { start, end } = getMonthRange(month);

  let totalMin = 0;
  let nightMin = 0;
  let holidayDays = 0;

  // ✅ 총근무시간에서 뺄 "휴일공제시간"(분)
  let holidayWorkCountedMin = 0;

  let normalWorkDays = 0;
  let dayModeTotalMin = 0;

  const dayModeWorkRange =
    workMode?.type === "DAY" ? getWorkRangeFromWorkMode(workMode, "DAY") : null;

  const dayModeBreakMin =
    workMode?.type === "DAY" ? getBreakMinutesFromWorkMode(workMode, "DAY") : 0;

  const dayModeNetPerDayMin = (() => {
    if (!dayModeWorkRange) return 8 * 60;
    const raw = overlapMinutes(
      expandRange(dayModeWorkRange.start, dayModeWorkRange.end),
      [[0, MINUTES_PER_DAY]]
    );
    return Math.max(0, raw - dayModeBreakMin);
  })();

  for (const d of iterateDates(start, end)) {
    const isHol = isHolidayLike(d, holidays);

    const isNormalWorkday = isWeekday(d) && !holidays?.[d]?.isHoliday;
    if (isNormalWorkday) normalWorkDays += 1;

    // DAY 모드: 평일만 합산
    if (workMode?.type === "DAY") {
      if (isNormalWorkday) dayModeTotalMin += dayModeNetPerDayMin;
      continue;
    }

    const code = getWorkCodeForDate(pattern, d);
    if (!isWorkedCode(code)) continue;

    const wr = getWorkRangeFromWorkMode(workMode, code);

    const workMin = wr
      ? overlapMinutes(expandRange(wr.start, wr.end, code), [[0, MINUTES_PER_DAY]])
      : hoursForCode(pattern, code) * 60;

    const breakMin = getBreakMinutesFromWorkMode(workMode, code);
    const netWorkMin = Math.max(0, workMin - breakMin);

    // ✅ 1) 월 순근무시간에는 NIGHT 포함(그대로 누적)
    totalMin += netWorkMin;

    // ✅ 휴일근무(수당) 인정 여부(= 야간수당 제외 대상)
    const isHolidayWorkForAllowance =
      isHol &&
      (
        ((code === "DAY" || code === "EVE") && netWorkMin >= 8 * 60) ||
        code === "DANG"
      );

    // ✅ 4) 야간수당시간
// 공제시간은 "총 근무시간"에서만 차감하고,
// 야간근무시간은 실제 22:00~06:00 겹치는 시간 그대로 본다.
if (wr && !isHolidayWorkForAllowance) {
  const rawNight = overlapMinutes(
    expandRange(wr.start, wr.end, code),
    expandRange(NIGHT_WINDOW.start, NIGHT_WINDOW.end)
  );

  nightMin += Math.max(0, rawNight);
}

    if (isHol) {
      // ✅ 2) holidayDays 카운트(기존 유지: NIGHT 제외)
      const isCountedHolidayDay =
        (code === "DAY" && netWorkMin >= 8 * 60) ||
        (code === "EVE" && netWorkMin >= 8 * 60) ||
        code === "DANG";

      if (isCountedHolidayDay) holidayDays += 1;

      // ✅ 3) 휴일공제시간(총근무시간에서 뺄 시간)
      // - DAY/EVE(>=8h): net 공제
      // - DANG: 8h 고정 공제
      // - NIGHT: 공제하지 않음
      const isDeductTarget =
        (code === "DAY" && netWorkMin >= 8 * 60) ||
        (code === "EVE" && netWorkMin >= 8 * 60) ||
        code === "DANG";

      if (isDeductTarget) {
        if (code === "DANG") holidayWorkCountedMin += 8 * 60;
        else holidayWorkCountedMin += netWorkMin; // DAY/EVE
      }
    }
  }

  const leaveDays = calcLeaveDaysForRange(events, start, end);
  const normalHours = normalWorkDays * 8;
  const holidayDeductHours = round1(minutesToHours(holidayWorkCountedMin));

  const finalTotalMin =
    workMode?.type === "DAY"
      ? dayModeTotalMin
      : Math.max(0, totalMin - holidayWorkCountedMin);

  return {
    totalHours: round1(minutesToHours(finalTotalMin)),
    nightHours: round1(minutesToHours(nightMin)),
    holidayDays,
    leaveDays: round1(leaveDays),
    normalHours: round1(normalHours),
    holidayDeductHours,
  } as WorkStats;
}

function calcLeaveDaysForRange(
  events: CalendarEvent[],
  start: YYYYMMDD,
  end: YYYYMMDD
) {
  const leaveEvents = events.filter((e) => e?.type === "LEAVE");

  let sum = 0;

  for (const e of leaveEvents) {
    const eStart = e.dateStart;
    const eEnd = e.dateEnd ?? e.dateStart;

    if (eEnd < start || eStart > end) continue;

    const s = eStart < start ? start : eStart;
    const t = eEnd > end ? end : eEnd;

    for (const _d of iterateDates(s, t)) {
      const unit = e.leaveUnit ?? "DAY";
      if (unit === "DAY") sum += 1;
      else if (unit === "HALF") sum += 0.5;
      else if (unit === "HOUR") sum += (e.leaveHours ?? 0) / 8;
    }
  }

  return sum;
}