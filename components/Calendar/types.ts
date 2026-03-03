// components/Calendar/types.ts
import type {
  CalendarEvent,
  WorkPattern,
  WorkStats,
  YYYYMM,
  YYYYMMDD,
} from "@/lib/calendar";

/** ===== Calendar basic ===== */

export type MonthGridDay = {
  date: YYYYMMDD;
  day: number;
  inMonth: boolean;
  dow: number;
};

/** ===== Work Mode (일근/교대 설정) ===== */

export type WorkModeType = "NONE" | "DAY" | "SHIFT";
export type ShiftRotation = 2 | 3 | 4;

export type ShiftCode = "DAY" | "EVE" | "NIGHT" | "DANG" | "OFF" | "REST";

export type TimeHH = `${number}${number}`;
export type TimeMM = `${number}${number}`;
export type HHMM = `${TimeHH}:${TimeMM}`;

export type TimeRange = {
  start: HHMM;
  end: HHMM;
  breakMinutes?: number; // ✅ 공제시간(분)
};

export type ShiftPatternId =
  | "2_A"
  | "2_B"
  | "3_A"
  | "3_B"
  | "4_A"
  | "4_B"
  | "CUSTOM"; // ✅ 추가

export type WorkMode =
  | { type: "NONE" }
  | { type: "DAY"; day: TimeRange }
  | {
      type: "SHIFT";
      rotation: ShiftRotation;
      patternId: ShiftPatternId;
      times: Partial<Record<ShiftCode, TimeRange>>;
      anchorDate?: YYYYMMDD; // ✅ (권장) 지금 as any 쓰는거 정리용
      customCycle?: ShiftCode[]; // ✅ 직접입력 패턴 저장
    };

/** ===== UI Props ===== */

export type CalendarHeaderProps = {
  month: YYYYMM;
  onGoToday: () => void;
  onOpenWorkMode: () => void;
  onClear: () => void;
};

export type MonthGridProps = {
  month: YYYYMM;
  selectedDate: YYYYMMDD;
  onSelectDate: (date: YYYYMMDD) => void;
  onSelectMeta?: (meta: {
    date: YYYYMMDD;
    holidayName?: string;
    isHoliday?: boolean;
  }) => void;

  pattern: WorkPattern;
  events: CalendarEvent[];
  onChangeEvents: (events: CalendarEvent[]) => void; // ✅ 추가

  showWorkBadges: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;

  // ✅ 추가: 날짜 더블클릭/상세보기 열기
  onOpenDay?: (date: YYYYMMDD) => void;

  // ✅✅✅ 추가: CalendarPage에서 내려주는 공휴일 맵
  holidays?: Record<string, { name: string; isHoliday: boolean }>;
};

export type SummaryBarProps = {
  stats: WorkStats;
  onOpenWorkSummary: () => void;
};

export type WorkSummarySheetProps = {
  open: boolean;
  onClose: () => void;
  stats: any; // 너 프로젝트에 있는 stats 타입으로 유지
  month: YYYYMM; // ✅ 추가 (예: "2026-03")
};

export type WorkModeSheetProps = {
  open: boolean;
  onClose: () => void;
  value: WorkMode;
  onChange: (v: WorkMode) => void;
};