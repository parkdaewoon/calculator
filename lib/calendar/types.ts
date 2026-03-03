// lib/calendar/types.ts

export type YYYYMM = `${number}${number}${number}${number}-${number}${number}`; // YYYY-MM
export type YYYYMMDD =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`; // YYYY-MM-DD

export type WorkCode = "DAY" | "EVE" | "NIGHT" | "DANG" | "OFF" | "REST";

export type WorkPattern = {
  id: string;
  name: string;

  cycle: WorkCode[];
  anchorDate: YYYYMMDD;

  dayHours?: number;
  eveHours?: number;
  nightHours?: number;
  dangHours?: number;
};

export type CalendarEventType = "EVENT" | "LEAVE";
export type LeaveUnit = "DAY" | "HALF" | "HOUR";

export type EventTypeMain = "WORK" | "DUTY";

export type CalendarEvent = {
  id: string;

  // ✅ 기존 유지(옵셔널) — 레거시/빈 이벤트 허용하는 설계라면 그대로 두는 게 안전
  type?: CalendarEventType;

  dateStart: YYYYMMDD;
  dateEnd?: YYYYMMDD;

  title?: string;

  allDay?: boolean;
  startTime?: string;
  endTime?: string;

  location?: string;

  typeMain?: EventTypeMain;
  typeSub?: string;

  reminderMinutes?: number;

  memo?: string;

  leaveUnit?: LeaveUnit;
  leaveHours?: number;

  // legacy fields
  date?: any;
  startDate?: any;
  endDate_legacy?: any;
  endDate?: any;
};

// ✅ 추가: 월 통계 계산 입력 파라미터 타입 (stats.ts가 import 하던 것)
export type CalcWorkStatsParams = {
  month: YYYYMM;
  pattern: WorkPattern;
  events: CalendarEvent[];
};

// ✅ SummaryBarProps 등에서 사용 중인 타입
export type WorkStats = {
  totalHours: number;
  nightHours: number;
  holidayDays: number;
  leaveDays: number;
  normalHours: number;
};