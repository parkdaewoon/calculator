export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { sendPushToUser } from "@/lib/push/sender";
import { workModeToPattern } from "@/lib/calendar/patterns";

type YYYYMMDD = `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

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
      return Response.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const today = getTodayYmdInKst();
    const nowHhmm = getNowHhmmInKst();

    const { data: rows, error } = await supabaseAdmin
      .from("shift_reminder_settings")
      .select(`
        user_id,
        enabled,
        when_mode,
        reminder_time,
        target_codes,
        user_work_modes!inner (
          work_mode
        ),
        notification_settings (
          push_enabled
        )
      `)
      .eq("enabled", true)
      .eq("reminder_time", nowHhmm);

    if (error) {
      return Response.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    let checkedUsers = 0;
    let sentUsers = 0;
    let skippedUsers = 0;
    let failedUsers = 0;

    for (const row of rows ?? []) {
      checkedUsers += 1;

      const userId = row.user_id as string;
      const whenMode =
        row.when_mode === "today" ? "today" : "previousDay";
      const reminderTime = row.reminder_time as string;
      const targetCodes = Array.isArray(row.target_codes)
        ? row.target_codes.filter((v): v is string => typeof v === "string")
        : [];

      const workMode = (row as any).user_work_modes?.work_mode;
      const pushEnabled = !!(row as any).notification_settings?.[0]?.push_enabled;

      if (!pushEnabled || !workMode || typeof workMode !== "object") {
        skippedUsers += 1;
        continue;
      }

      if (!targetCodes.length) {
        skippedUsers += 1;
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

      if (!targetCodes.includes(actualCode)) {
        skippedUsers += 1;
        continue;
      }

      const scheduledKey = buildScheduledKey({
        baseDate: today,
        whenMode,
        reminderTime,
        targetDate,
        targetCode: actualCode,
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
          scheduledKey,
          logCheckError,
        });
        failedUsers += 1;
        continue;
      }

      if (existingLog) {
        skippedUsers += 1;
        continue;
      }

      try {
        const result = await sendPushToUser(userId, {
          title: `${codeLabel(actualCode)} 근무 알림`,
          body:
            whenMode === "previousDay"
              ? `내일 ${codeLabel(actualCode)} 근무 예정입니다.`
              : `오늘 ${codeLabel(actualCode)} 근무 예정입니다.`,
          url: "/calendar",
          tag: `shift-${scheduledKey}`,
        });

        if (!result.sent) {
          skippedUsers += 1;
          continue;
        }

        const { error: insertLogError } = await supabaseAdmin
          .from("shift_reminder_logs")
          .insert({
            user_id: userId,
            scheduled_key: scheduledKey,
            target_date: targetDate,
            target_code: actualCode,
          });

        if (insertLogError) {
          console.error("[shift-reminder] log insert failed", {
            userId,
            scheduledKey,
            insertLogError,
          });
        }

        sentUsers += 1;
      } catch (e) {
        console.error("[shift-reminder] send failed", { userId, e });
        failedUsers += 1;
      }
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