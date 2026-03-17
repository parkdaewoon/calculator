export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { sendPushToUser } from "@/lib/push/sender";
import { workModeToPattern } from "@/lib/calendar/patterns";

type YYYYMMDD = `${number}${number}${number}${number}-${number}${number}-${number}${number}`;
type ReminderTargetCode = "DAY" | "EVE" | "NIGHT" | "DANG";
type ShiftReminderItem = {
  enabled: boolean;
  whenMode: "today" | "previousDay";
  reminderTime: `${number}${number}:${number}${number}`;
};
type ShiftReminderSettings = Partial<Record<ReminderTargetCode, ShiftReminderItem>>;

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getTodayYmdInKst(date = new Date()): YYYYMMDD {
  const kst = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const y = kst.getFullYear();
  const m = String(kst.getMonth() + 1).padStart(2, "0");
  const d = String(kst.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}` as YYYYMMDD;
}

function getNowHhmmInKst(date = new Date()) {
  const kst = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const hh = String(kst.getHours()).padStart(2, "0");
  const mm = String(kst.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function addDays(ymd: YYYYMMDD, days: number): YYYYMMDD {
  const dt = new Date(`${ymd}T00:00:00`);
  dt.setDate(dt.getDate() + days);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}` as YYYYMMDD;
}

function getWorkCodeForDate(
  pattern: { cycle: string[]; anchorDate: YYYYMMDD },
  date: YYYYMMDD
): string {
  const cycle = pattern.cycle;
  if (!cycle.length) return "REST";

  const a = new Date(`${pattern.anchorDate}T00:00:00`).getTime();
  const b = new Date(`${date}T00:00:00`).getTime();
  const diff = Math.floor((b - a) / (24 * 60 * 60 * 1000));
  const idx = ((diff % cycle.length) + cycle.length) % cycle.length;
  return cycle[idx];
}

function buildScheduledKey(params: {
  baseDate: YYYYMMDD;
  whenMode: "today" | "previousDay";
  reminderTime: string;
  targetDate: YYYYMMDD;
  targetCode: string;
}) {
  return [
    params.baseDate,
    params.whenMode,
    params.reminderTime,
    params.targetDate,
    params.targetCode,
  ].join("_");
}

function codeLabel(code: string) {
  switch (code) {
    case "DAY":
      return "주간";
    case "EVE":
      return "저녁";
    case "NIGHT":
      return "야간";
    case "DANG":
      return "당직";
    default:
      return code;
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const expected = process.env.CRON_SECRET;

    if (expected && authHeader !== `Bearer ${expected}`) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const today = getTodayYmdInKst();
    const nowHhmm = getNowHhmmInKst();

    const { data: rows, error } = await supabaseAdmin
      .from("shift_reminder_settings")
      .select(`
        user_id,
        settings,
        user_work_modes!inner (
          work_mode
        ),
        notification_settings (
          push_enabled
        )
      `);

    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }

    let checkedUsers = 0;
    let sentUsers = 0;
    let skippedUsers = 0;
    let failedUsers = 0;

    for (const row of rows ?? []) {
      checkedUsers += 1;

      const userId = row.user_id as string;
      const settings = (row.settings ?? {}) as ShiftReminderSettings;
      const workMode = (row as any).user_work_modes?.work_mode;
      const pushEnabled = !!(row as any).notification_settings?.[0]?.push_enabled;

      if (!pushEnabled || !workMode || typeof workMode !== "object") {
        skippedUsers += 1;
        continue;
      }

      const pattern = workModeToPattern(workMode as any, today);

      let userSent = false;

      for (const code of ["DAY", "EVE", "NIGHT", "DANG"] as const) {
        const item = settings[code];
        if (!item?.enabled) continue;
        if (item.reminderTime !== nowHhmm) continue;

        const targetDate = item.whenMode === "previousDay" ? addDays(today, 1) : today;
        const actualCode = getWorkCodeForDate(
          {
            cycle: pattern.cycle,
            anchorDate: pattern.anchorDate as YYYYMMDD,
          },
          targetDate
        );

        if (actualCode !== code) continue;

        const scheduledKey = buildScheduledKey({
          baseDate: today,
          whenMode: item.whenMode,
          reminderTime: item.reminderTime,
          targetDate,
          targetCode: code,
        });

        const { data: existingLog } = await supabaseAdmin
          .from("shift_reminder_logs")
          .select("id")
          .eq("user_id", userId)
          .eq("scheduled_key", scheduledKey)
          .maybeSingle();

        if (existingLog) continue;

        try {
          await sendPushToUser(userId, {
            title: `${codeLabel(code)} 근무 알림`,
            body:
              item.whenMode === "previousDay"
                ? `내일 ${codeLabel(code)} 근무 예정입니다.`
                : `오늘 ${codeLabel(code)} 근무 예정입니다.`,
            url: "/calendar",
            tag: `shift-${scheduledKey}`,
          });

          await supabaseAdmin.from("shift_reminder_logs").insert({
            user_id: userId,
            scheduled_key: scheduledKey,
            target_date: targetDate,
            target_code: code,
          });

          userSent = true;
        } catch (e) {
          console.error("[shift-reminder] send failed", { userId, code, e });
          failedUsers += 1;
        }
      }

      if (userSent) sentUsers += 1;
      else skippedUsers += 1;
    }

    return Response.json({
      ok: true,
      today,
      nowHhmm,
      checkedUsers,
      sentUsers,
      skippedUsers,
      failedUsers,
    });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}