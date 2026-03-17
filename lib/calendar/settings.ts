import type { WorkMode } from "@/components/Calendar/types";
import type { ShiftReminderSettings } from "@/components/Calendar/types";

export async function loadCalendarSettings(userId: string) {
  const res = await fetch("/api/calendar/settings", {
    method: "GET",
    cache: "no-store",
    headers: {
      "x-device-id": userId,
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || "캘린더 설정 조회 실패");
  }

  return {
    workMode: (json.data?.workMode ?? null) as WorkMode | null,
    shiftReminder: (json.data?.shiftReminder ?? null) as ShiftReminderSettings | null,
  };
}

export async function saveCalendarSettings(
  userId: string,
  payload: {
    workMode: WorkMode;
    shiftReminder: ShiftReminderSettings;
  }
) {
  const res = await fetch("/api/calendar/settings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-device-id": userId,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.ok) {
    throw new Error(json?.error || "캘린더 설정 저장 실패");
  }

  return true;
}