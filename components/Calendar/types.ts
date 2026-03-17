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
  breakMinutes?: number;
};

export type ShiftPatternId =
  | "2_A"
  | "2_B"
  | "3_A"
  | "3_B"
  | "4_A"
  | "4_B"
  | "CUSTOM";

export type WorkMode =
  | { type: "NONE" }
  | { type: "DAY"; day: TimeRange }
  | {
      type: "SHIFT";
      rotation: ShiftRotation;
      patternId: ShiftPatternId;
      times: Partial<Record<ShiftCode, TimeRange>>;
      anchorDate?: YYYYMMDD;
      customCycle?: ShiftCode[];
    };

/** ===== Shift Reminder ===== */

export type ShiftReminderWhenMode = "today" | "previousDay";

export type ReminderTargetCode = "DAY" | "EVE" | "NIGHT" | "DANG";

export type ShiftReminderItem = {
  enabled: boolean;
  whenMode: ShiftReminderWhenMode;
  reminderTime: HHMM;
};

export type ShiftReminderSettings = Partial<Record<ReminderTargetCode, ShiftReminderItem>>;

export const DEFAULT_SHIFT_REMINDER: ShiftReminderSettings = {
  DAY: { enabled: false, whenMode: "today", reminderTime: "07:00" },
  EVE: { enabled: false, whenMode: "today", reminderTime: "13:00" },
  NIGHT: { enabled: false, whenMode: "previousDay", reminderTime: "21:00" },
  DANG: { enabled: false, whenMode: "today", reminderTime: "08:00" },
};

/** ===== UI Props ===== */

export type CalendarHeaderProps = {
  month: YYYYMM;
  onGoToday: () => void;
  onOpenWorkMode: () => void;
  onClear: () => void;
  onChangeMonth: (next: YYYYMM) => void;
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
  onChangeEvents: (events: CalendarEvent[]) => void;

  showWorkBadges: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;

  onOpenDay?: (date: YYYYMMDD) => void;
  holidays?: Record<string, { name: string; isHoliday: boolean }>;
};

export type SummaryBarProps = {
  stats: WorkStats;
  onOpenWorkSummary: () => void;
};

export type WorkSummarySheetProps = {
  open: boolean;
  onClose: () => void;
  stats: any;
  month: YYYYMM;
};

export type WorkModeSheetProps = {
  open: boolean;
  onClose: () => void;
  value: WorkMode;
  onChange: (v: WorkMode) => void;

  reminderValue: ShiftReminderSettings;
  onChangeReminder: (v: ShiftReminderSettings) => void;
};