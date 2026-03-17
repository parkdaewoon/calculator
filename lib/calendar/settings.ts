import type {
  WorkMode,
  ShiftReminderSettings,
  HHMM,
} from "@/components/Calendar/types";

type ReminderWhenMode = "today" | "previousDay";
type ReminderTargetCode = "DAY" | "EVE" | "NIGHT" | "DANG";

type ShiftReminderRule = {
  targetCode: ReminderTargetCode;
  enabled: boolean;
  whenMode: ReminderWhenMode;
  reminderTime: HHMM;
};

function toShiftReminderRules(
  reminder: ShiftReminderSettings | undefined | null
): ShiftReminderRule[] {
  if (!reminder) return [];

  const out: ShiftReminderRule[] = [];

  for (const code of ["DAY", "EVE", "NIGHT", "DANG"] as const) {
    const item = reminder[code];
    if (!item) continue;

    out.push({
      targetCode: code,
      enabled: !!item.enabled,
      whenMode: "previousDay", // ✅ 무조건 고정
      reminderTime: item.reminderTime as HHMM,
    });
  }

  return out;
}

function fromShiftReminderRules(
  rules: ShiftReminderRule[] | undefined | null
): ShiftReminderSettings {
  const next: ShiftReminderSettings = {};

  for (const rule of rules ?? []) {
    next[rule.targetCode] = {
      enabled: !!rule.enabled,
      whenMode: rule.whenMode === "previousDay" ? "previousDay" : "today",
      reminderTime: rule.reminderTime,
    };
  }

  return next;
}

export async function loadCalendarSettings(userId: string): Promise<{
  workMode: WorkMode | null;
  shiftReminder: ShiftReminderSettings | null;
}> {
  const res = await fetch("/api/calendar/settings", {
    method: "GET",
    headers: {
      "x-device-id": userId,
    },
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  console.log("loadCalendarSettings", { status: res.status, json });

  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || "캘린더 설정 불러오기 실패");
  }

  const workMode = (json?.data?.workMode ?? null) as WorkMode | null;
  const shiftReminders = Array.isArray(json?.data?.shiftReminders)
    ? (json.data.shiftReminders as ShiftReminderRule[])
    : [];

  return {
    workMode,
    shiftReminder: fromShiftReminderRules(shiftReminders),
  };
}

export async function saveCalendarSettings(
  userId: string,
  params: {
    workMode?: WorkMode;
    shiftReminder?: ShiftReminderSettings;
  }
) {
  const body: Record<string, unknown> = {};

  if (params.workMode) {
    body.workMode = params.workMode;
  }

  if (params.shiftReminder) {
    body.shiftReminders = toShiftReminderRules(params.shiftReminder);
  }

  console.log("saveCalendarSettings request body", body);

  const res = await fetch("/api/calendar/settings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-device-id": userId,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);

  console.log("saveCalendarSettings response", {
    status: res.status,
    json,
  });

  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || "캘린더 설정 저장 실패");
  }

  return json;
}