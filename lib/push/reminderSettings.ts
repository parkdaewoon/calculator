export type ReminderWhenMode = "today" | "previousDay";
export type ReminderTargetCode = "DAY" | "EVE" | "NIGHT" | "DANG";

export type ShiftReminderRule = {
  targetCode: ReminderTargetCode;
  enabled: boolean;
  whenMode: ReminderWhenMode;
  reminderTime: string;
};

export const DEFAULT_SHIFT_REMINDER_RULES: ShiftReminderRule[] = [
  {
    targetCode: "DAY",
    enabled: true,
    whenMode: "previousDay",
    reminderTime: "19:10",
  },
  {
    targetCode: "EVE",
    enabled: true,
    whenMode: "previousDay",
    reminderTime: "19:10",
  },
  {
    targetCode: "NIGHT",
    enabled: true,
    whenMode: "previousDay",
    reminderTime: "19:10",
  },
  {
    targetCode: "DANG",
    enabled: true,
    whenMode: "previousDay",
    reminderTime: "19:10",
  },
];

export function buildShiftReminderRulesEnabled(
  enabled: boolean,
  baseRules: ShiftReminderRule[] = DEFAULT_SHIFT_REMINDER_RULES
): ShiftReminderRule[] {
  return baseRules.map((rule) => ({
    ...rule,
    enabled,
  }));
}

export async function saveShiftReminderRules(
  userId: string,
  rules: ShiftReminderRule[]
) {
  const res = await fetch("/api/calendar/settings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-device-id": userId,
    },
    body: JSON.stringify({
      shiftReminders: rules,
    }),
  });

  const json = await res.json().catch(() => null);

  console.log("saveShiftReminderRules", {
    status: res.status,
    json,
    rules,
  });

  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || "알림 규칙 저장 실패");
  }

  return json;
}

export async function fetchShiftReminderRules(userId: string) {
  const res = await fetch("/api/calendar/settings", {
    method: "GET",
    headers: {
      "x-device-id": userId,
    },
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || "알림 규칙 조회 실패");
  }

  const rules = Array.isArray(json?.data?.shiftReminders)
    ? (json.data.shiftReminders as ShiftReminderRule[])
    : [];

  return rules;
}