export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { sendPushToUser } from "@/lib/push/sender";
import { workModeToPattern } from "@/lib/calendar/patterns";

type YYYYMMDD = `${number}${number}${number}${number}-${number}${number}-${number}${number}`;
type ReminderTargetCode = "DAY" | "EVE" | "NIGHT" | "DANG";

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
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = Object.fromEntries(
    fmt.formatToParts(date).map((p) => [p.type, p.value])
  );

  return `${parts.year}-${parts.month}-${parts.day}` as YYYYMMDD;
}

function getNowHhmmInKst(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return fmt.format(date);
}

function addDays(ymd: YYYYMMDD, days: number): YYYYMMDD {
  const dt = new Date(`${ymd}T00:00:00+09:00`);
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

  const a = new Date(`${pattern.anchorDate}T00:00:00+09:00`).getTime();
  const b = new Date(`${date}T00:00:00+09:00`).getTime();
  const diff = Math.floor((b - a) / (24 * 60 * 60 * 1000));
  const idx = ((diff % cycle.length) + cycle.length) % cycle.length;

  return cycle[idx];
}

function buildScheduledKey(params: {
  baseDate: YYYYMMDD;
  targetCode: ReminderTargetCode;
  whenMode: "today" | "previousDay";
  reminderTime: string;
  targetDate: YYYYMMDD;
}) {
  return [
    params.baseDate,
    params.targetCode,
    params.whenMode,
    params.reminderTime,
    params.targetDate,
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
      return Response.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const today = getTodayYmdInKst();
    const nowHhmm = getNowHhmmInKst();

    const { data: reminderRows, error: reminderError } = await supabaseAdmin
  .from("shift_reminder_rules")
  .select("user_id, target_code, enabled, when_mode, reminder_time")
  .eq("enabled", true);

console.log("[shift-reminder] now", { today, nowHhmm });
console.log("[shift-reminder] loaded reminderRows", reminderRows);

    if (reminderError) {
      return Response.json(
        { ok: false, error: reminderError.message },
        { status: 500 }
      );
    }

    let checkedRules = 0;
    let sentRules = 0;
    let skippedRules = 0;
    let failedRules = 0;

    for (const row of reminderRows ?? []) {
      checkedRules += 1;
  console.log("[shift-reminder] checking row", row);

  if (row.reminder_time !== nowHhmm) {
    console.log("[shift-reminder] time mismatch", {
      userId: row.user_id,
      targetCode: row.target_code,
      reminderTime: row.reminder_time,
      nowHhmm,
    });
    skippedRules += 1;
    continue;
  }
      const userId = row.user_id as string;
      const targetCode = row.target_code as ReminderTargetCode;
      const whenMode = row.when_mode === "today" ? "today" : "previousDay";
      const reminderTime = row.reminder_time as string;

      const [
        { data: workModeRow, error: workModeError },
        { data: notificationRow, error: notificationError },
      ] = await Promise.all([
        supabaseAdmin
          .from("user_work_modes")
          .select("work_mode")
          .eq("user_id", userId)
          .maybeSingle(),
        supabaseAdmin
          .from("notification_settings")
          .select("push_enabled")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

      if (workModeError) {
        console.error("[shift-reminder] work mode query failed", {
          userId,
          targetCode,
          workModeError,
        });
        failedRules += 1;
        continue;
      }

      if (notificationError) {
        console.error("[shift-reminder] notification settings query failed", {
          userId,
          targetCode,
          notificationError,
        });
        failedRules += 1;
        continue;
      }

      const pushEnabled = !!notificationRow?.push_enabled;
const workMode = workModeRow?.work_mode;

console.log("[shift-reminder] user state", {
  userId,
  targetCode,
  pushEnabled,
  notificationRow,
  hasWorkMode: !!workMode,
  workMode,
});

if (!pushEnabled || !workMode || typeof workMode !== "object") {
  console.log("[shift-reminder] skipped: push disabled or workMode missing", {
    userId,
    targetCode,
    pushEnabled,
    hasWorkMode: !!workMode,
  });
  skippedRules += 1;
  continue;
}

      const targetDate =
        whenMode === "previousDay" ? addDays(today, 1) : today;

      const pattern = workModeToPattern(workMode as any, today);
      const actualCode = getWorkCodeForDate(
        {
          cycle: pattern.cycle,
          anchorDate: pattern.anchorDate as YYYYMMDD,
        },
        targetDate
      );

      console.log("[shift-reminder] code compare", {
  userId,
  targetCode,
  actualCode,
  today,
  targetDate,
  whenMode,
});

if (actualCode !== targetCode) {
  console.log("[shift-reminder] skipped: code mismatch", {
    userId,
    targetCode,
    actualCode,
    targetDate,
  });
  skippedRules += 1;
  continue;
}

      const scheduledKey = buildScheduledKey({
        baseDate: today,
        targetCode,
        whenMode,
        reminderTime,
        targetDate,
      });

      const { data: existingLog, error: logCheckError } = await supabaseAdmin
        .from("shift_reminder_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("scheduled_key", scheduledKey)
        .maybeSingle();

      if (logCheckError) {
        console.error("[shift-reminder] log check failed", {
          userId,
          targetCode,
          scheduledKey,
          logCheckError,
        });
        failedRules += 1;
        continue;
      }

      if (existingLog) {
  console.log("[shift-reminder] skipped: already logged", {
    userId,
    targetCode,
    scheduledKey,
  });
  skippedRules += 1;
  continue;
}

      try {
        const result = await sendPushToUser(userId, {
          title: `${codeLabel(targetCode)} 근무 알림`,
          body:
            whenMode === "previousDay"
              ? `내일 ${codeLabel(targetCode)} 근무 예정입니다.`
              : `오늘 ${codeLabel(targetCode)} 근무 예정입니다.`,
          url: "/calendar",
          tag: `shift-${scheduledKey}`,
        });

        if (!result.sent) {
          skippedRules += 1;
          continue;
        }

        const { error: insertLogError } = await supabaseAdmin
          .from("shift_reminder_logs")
          .insert({
            user_id: userId,
            scheduled_key: scheduledKey,
            target_date: targetDate,
            target_code: targetCode,
          });

        if (insertLogError) {
          console.error("[shift-reminder] log insert failed", {
            userId,
            targetCode,
            scheduledKey,
            insertLogError,
          });
        }

        sentRules += 1;
      } catch (e) {
        console.error("[shift-reminder] send failed", { userId, targetCode, e });
        failedRules += 1;
      }
    }

    return Response.json({
  ok: true,
  today,
  nowHhmm,
  matchedRules: reminderRows?.length ?? 0,
  checkedRules,
  sentRules,
  skippedRules,
  failedRules,
});
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}